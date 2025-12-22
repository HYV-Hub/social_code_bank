import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)

  // CRITICAL: UUID validation helper
  const isValidUUID = (id) => {
    if (!id || typeof id !== 'string') return false
    // Prevent "undefined" and "null" strings
    if (id === 'undefined' || id === 'null') return false
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    return uuidRegex?.test(id);
  }

  // Helper function to clear stale auth tokens
  const clearStaleTokens = () => {
    try {
      // Clear all Supabase auth-related items from localStorage
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('sb-') && key?.includes('-auth-token')) {
          keysToRemove?.push(key);
        }
      }
      keysToRemove?.forEach(key => localStorage.removeItem(key));
      console.log('🧹 Cleared stale auth tokens from localStorage');
    } catch (error) {
      console.error('Error clearing stale tokens:', error);
    }
  }

  // Isolated async operations - never called from auth callbacks
  const profileOperations = {
    async load(userId) {
      // CRITICAL FIX: Validate UUID before any operations
      if (!isValidUUID(userId)) {
        console.error('❌ Invalid user ID detected:', userId)
        return
      }
      
      setProfileLoading(true)
      try {
        // CRITICAL FIX: Increased retry attempts with company_id focus
        let attempts = 0
        let data = null
        let error = null
        
        while (attempts < 10 && !data) {
          const result = await supabase
            ?.from('user_profiles')
            ?.select('*')
            ?.eq('id', userId)
            ?.single()
          
          data = result?.data
          error = result?.error
          
          // CRITICAL: Log company_id to track propagation
          if (data) {
            console.log(`🔍 Profile load attempt ${attempts + 1}:`, {
              id: data?.id,
              email: data?.email,
              company_id: data?.company_id,
              role: data?.role
            })
          }
          
          if (!data && attempts < 9) {
            // Longer wait time to handle company_id updates
            await new Promise(resolve => setTimeout(resolve, 1000))
          }
          attempts++
        }
        
        if (!error && data) {
          setUserProfile(data)
          console.log('✅ Profile loaded successfully with company:', {
            id: data?.id,
            email: data?.email,
            company_id: data?.company_id || 'NO_COMPANY',
            role: data?.role
          })
        } else if (error) {
          console.error('Profile load error:', error)
        }
      } catch (error) {
        console.error('Profile load exception:', error)
      } finally {
        setProfileLoading(false)
      }
    },

    clear() {
      setUserProfile(null)
      setProfileLoading(false)
    },

    // NEW: Force reload profile (useful after company creation)
    async forceReload(userId) {
      if (!isValidUUID(userId)) return
      
      console.log('🔄 Force reloading profile...')
      await this.load(userId)
    }
  }

  // Auth state handlers - PROTECTED from async modification
  const authStateHandlers = {
    // This handler MUST remain synchronous - Supabase requirement
    onChange: (event, session) => {
      // CRITICAL FIX: Validate user object and user.id before setting state
      const sessionUser = session?.user
      
      if (sessionUser) {
        // Validate user.id is a proper UUID
        if (!isValidUUID(sessionUser?.id)) {
          console.error('❌ CRITICAL: Invalid user ID in session:', sessionUser?.id)
          console.error('Session user object:', sessionUser)
          // Don't set invalid user - treat as logged out
          setUser(null)
          setLoading(false)
          profileOperations?.clear()
          clearStaleTokens()
          return
        }
        
        // Validate email exists
        if (!sessionUser?.email) {
          console.error('❌ CRITICAL: No email in session user')
          setUser(null)
          setLoading(false)
          profileOperations?.clear()
          clearStaleTokens()
          return
        }
        
        console.log('✅ Valid user session detected:', {
          id: sessionUser?.id,
          email: sessionUser?.email
        })
        
        setUser(sessionUser)
        profileOperations?.load(sessionUser?.id) // Fire-and-forget
      } else {
        console.log('🔓 No session - user logged out')
        setUser(null)
        profileOperations?.clear()
        // Clear any stale tokens when session ends
        clearStaleTokens()
      }
      
      setLoading(false)
    }
  }

  useEffect(() => {
    // Initial session check with error handling for refresh token issues
    supabase?.auth?.getSession()?.then(({ data: { session }, error }) => {
      if (error) {
        // Handle specific refresh token error gracefully
        if (error?.message?.includes('Invalid Refresh Token') || error?.message?.includes('Refresh Token Not Found')) {
          console.log('🔄 Stale refresh token detected - clearing and resetting session');
          clearStaleTokens();
          // Treat as no session - user needs to log in again
          authStateHandlers?.onChange(null, null);
        } else {
          console.error('Session fetch error:', error);
        }
      } else {
        authStateHandlers?.onChange(null, session);
      }
    })?.catch((error) => {
      // Catch any unexpected errors during session retrieval
      console.error('Unexpected error fetching session:', error);
      clearStaleTokens();
      authStateHandlers?.onChange(null, null);
    });

    // CRITICAL: This must remain synchronous
    const { data: { subscription } } = supabase?.auth?.onAuthStateChange(
      (event, session) => {
        // Add error handling for auth state changes
        if (event === 'TOKEN_REFRESHED') {
          console.log('🔄 Token refreshed successfully');
        } else if (event === 'SIGNED_OUT') {
          console.log('👋 User signed out');
          clearStaleTokens();
        }
        authStateHandlers?.onChange(event, session);
      }
    )

    return () => subscription?.unsubscribe()
  }, [])

  // Auth methods
  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase?.auth?.signInWithPassword({ email, password })
      return { data, error }
    } catch (error) {
      return { error: { message: 'Network error. Please try again.' } }
    }
  }

  const signUp = async (email, password, fullName, role, companyData = null, inviteCode = null) => {
    try {
      // Validate role matches database ENUM values
      const validRoles = ['user', 'team_member', 'team_admin', 'company_admin', 'super_admin'];
      if (!validRoles?.includes(role)) {
        return { error: { message: 'Invalid account type selected' } };
      }

      // Generate username from email if not provided
      const username = email?.split('@')?.[0]?.toLowerCase()?.replace(/[^a-z0-9]/g, '');

      // Sign up with Supabase Auth - trigger will create profile automatically
      const { data: authData, error: authError } = await supabase?.auth?.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
            username: username,
          },
          emailRedirectTo: `${window?.location?.origin}/email-verification`
        },
      });

      if (authError) {
        console.error('Auth signup error:', authError);
        return { error: authError };
      }

      if (!authData?.user) {
        return { error: { message: 'User creation failed' } };
      }

      // Don't set user yet - wait for email verification
      // The trigger will create the profile automatically

      // Handle company creation if role is company_admin
      if (role === 'company_admin' && companyData?.name) {
        // Wait longer for trigger to complete profile creation
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Verify profile exists with retry logic before creating company
        let profileExists = false;
        let retryCount = 0;
        const maxRetries = 5;

        while (!profileExists && retryCount < maxRetries) {
          const { data: profileCheck, error: profileCheckError } = await supabase
            ?.from('user_profiles')
            ?.select('id, username, email')
            ?.eq('id', authData?.user?.id)
            ?.single();

          if (profileCheck && !profileCheckError) {
            profileExists = true;
            console.log('Profile verified:', profileCheck);
          } else {
            console.log(`Profile check attempt ${retryCount + 1}/${maxRetries} - waiting...`);
            await new Promise(resolve => setTimeout(resolve, 1000));
            retryCount++;
          }
        }

        if (!profileExists) {
          console.error('Profile not created by trigger after retries');
          return { 
            error: { 
              message: 'Account created but profile setup is taking longer than expected. Please try logging in after email verification, and you can create your company from your profile settings.' 
            } 
          };
        }

        // Create company with all provided fields
        const companyInsertData = {
          name: companyData?.name,
          slug: companyData?.slug,
          created_by: authData?.user?.id,
        };

        // Add optional fields if provided
        if (companyData?.website) {
          companyInsertData.website = companyData?.website;
        }
        if (companyData?.description) {
          companyInsertData.description = companyData?.description;
        }

        const { data: companyResult, error: companyError } = await supabase
          ?.from('companies')
          ?.insert([companyInsertData])
          ?.select()
          ?.single();

        if (companyError) {
          console.error('Company creation error:', companyError);
          return { 
            error: { 
              message: `Account created but company setup failed: ${companyError?.message}. You can create a company from your profile after verifying your email.` 
            } 
          };
        }

        // Update user profile with company_id
        if (companyResult) {
          const { error: profileUpdateError } = await supabase?.from('user_profiles')
            ?.update({ 
              company_id: companyResult?.id,
              role: 'company_admin' 
            })
            ?.eq('id', authData?.user?.id);

          if (profileUpdateError) {
            console.error('Profile update error:', profileUpdateError);
            // Don't fail the signup if profile update fails, company is created
          }
        }
      }
      
      return { data: authData, error: null };
    } catch (error) {
      console.error('Signup error:', error);
      return { error: { message: error?.message || 'An unexpected error occurred' } };
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase?.auth?.signOut()
      if (!error) {
        setUser(null)
        profileOperations?.clear()
        clearStaleTokens()
      }
      return { error }
    } catch (error) {
      // Even if signOut fails, clear local state and tokens
      setUser(null)
      profileOperations?.clear()
      clearStaleTokens()
      return { error: { message: 'Network error. Please try again.' } }
    }
  }

  const updateProfile = async (updates) => {
    if (!user) return { error: { message: 'No user logged in' } }
    
    try {
      const { data, error } = await supabase?.from('user_profiles')?.update(updates)?.eq('id', user?.id)?.select()?.single()
      if (!error) setUserProfile(data)
      return { data, error }
    } catch (error) {
      return { error: { message: 'Network error. Please try again.' } }
    }
  }

  const resetPasswordForEmail = async (email) => {
    try {
      const { data, error } = await supabase?.auth?.resetPasswordForEmail(email, {
        redirectTo: `${window.location?.origin}/reset-password`
      })
      return { data, error }
    } catch (error) {
      return { error: { message: 'Network error. Please try again.' } }
    }
  }

  const updatePassword = async (newPassword) => {
    try {
      const { data, error } = await supabase?.auth?.updateUser({ password: newPassword })
      return { data, error }
    } catch (error) {
      return { error: { message: 'Network error. Please try again.' } }
    }
  }

  const value = {
    user,
    userProfile,
    loading,
    profileLoading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    resetPasswordForEmail,
    updatePassword,
    isAuthenticated: !!user,
    // NEW: Expose force reload method
    forceReloadProfile: () => {
      if (user?.id) {
        profileOperations?.forceReload(user?.id)
      }
    }
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}