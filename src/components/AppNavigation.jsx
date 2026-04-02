import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Icon from './AppIcon';
import Button from './ui/Button';
import FriendSearchModal from './FriendSearchModal';
import { notificationService } from '../services/notificationService';
import { dmService } from '../services/dmService';

const AppNavigation = () => {
  const { user, signOut, userProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [friendModalOpen, setFriendModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // ADD: New state for notification count and real-time updates
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [notificationChannel, setNotificationChannel] = useState(null);
  const [dmChannel, setDmChannel] = useState(null);
  const [localProfile, setLocalProfile] = useState(null);
  const [userCompany, setUserCompany] = useState(null);
  const [companyLoading, setCompanyLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  
  const userMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const skipLinkRef = useRef(null);

  // CRITICAL FIX: Use userProfile from AuthContext instead of fetching again
  useEffect(() => {
    if (userProfile) {
      setLocalProfile(userProfile);
    }
  }, [userProfile]);

  // ENHANCED: Fetch company details with better error handling and validation
  useEffect(() => {
    const fetchCompanyDetails = async () => {
      const profile = localProfile || userProfile;
      
      // SECURITY: Only fetch company if user has a company_id in their profile
      if (!profile?.company_id) {
        console.log('ℹ️ User has no company - showing "Create/Join Company" option');
        setUserCompany(null);
        setCompanyLoading(false);
        return;
      }

      setCompanyLoading(true);
      
      try {
        const { supabase } = await import('../lib/supabase');
        
        // SECURITY: Verify company belongs to user with strict validation
        const { data: company, error } = await supabase
          ?.from('companies')
          ?.select('*')
          ?.eq('id', profile?.company_id)
          ?.maybeSingle();

        if (error && error?.code !== 'PGRST116') {
          console.error('❌ Company fetch error:', error?.message);
          setUserCompany(null);
          setCompanyLoading(false);
          return;
        }

        if (company) {
          // CRITICAL SECURITY: Verify company_id matches profile before setting
          if (company?.id === profile?.company_id) {
            setUserCompany(company);
            console.log('✅ User company verified:', {
              company_name: company?.name,
              company_id: company?.id,
              user_role: profile?.role
            });
          } else {
            console.error('🚨 SECURITY: Company ID mismatch prevented');
            setUserCompany(null);
          }
        } else {
          console.warn('⚠️ Company not found for ID:', profile?.company_id);
          setUserCompany(null);
        }
      } catch (error) {
        console.error('❌ Company fetch failed:', error?.message || error);
        setUserCompany(null);
      } finally {
        setCompanyLoading(false);
      }
    };

    // Only fetch if user is authenticated and not already loading
    if (!authLoading && user?.id) {
      fetchCompanyDetails();
    }
  }, [localProfile, userProfile, user, authLoading, location?.pathname]);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef?.current && !userMenuRef?.current?.contains(event?.target)) {
        setUserMenuOpen(false);
      }
      if (mobileMenuRef?.current && !mobileMenuRef?.current?.contains(event?.target)) {
        const mobileToggle = document.getElementById('mobile-menu-toggle');
        if (!mobileToggle?.contains(event?.target)) {
          setMobileMenuOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle escape key to close menus
  useEffect(() => {
    const handleEscape = (event) => {
      if (event?.key === 'Escape') {
        setUserMenuOpen(false);
        setMobileMenuOpen(false);
        setFriendModalOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Global search shortcut: press "/" to focus search
  useEffect(() => {
    const handleSlash = (e) => {
      if (e.key === '/' && !e.ctrlKey && !e.metaKey && !['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName)) {
        e.preventDefault();
        const searchInput = document.querySelector('[role="search"] input');
        if (searchInput) searchInput.focus();
      }
    };
    document.addEventListener('keydown', handleSlash);
    return () => document.removeEventListener('keydown', handleSlash);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  // ADD: Fetch unread notification count and setup real-time subscription
  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (!user) {
        setUnreadCount(0);
        return;
      }

      try {
        // CRITICAL FIX: Add defensive check to prevent "not a function" error
        if (typeof notificationService?.getUnreadCount !== 'function') {
          console.error('notificationService.getUnreadCount is not a function');
          setUnreadCount(0);
          return;
        }
        
        const count = await notificationService?.getUnreadCount();
        setUnreadCount(count);
      } catch (error) {
        console.error('Error fetching unread count:', error);
        setUnreadCount(0);
      }
    };

    const setupRealtimeSubscription = () => {
      if (!user?.id) return;

      try {
        // CRITICAL FIX: Add defensive check before subscribing
        if (typeof notificationService?.subscribeToNotifications !== 'function') {
          console.error('notificationService.subscribeToNotifications is not a function');
          return;
        }

        // Subscribe to notification changes
        const channel = notificationService?.subscribeToNotifications(
          user?.id,
          (payload) => {
            console.log('Notification change detected:', payload);
            
            // Refetch unread count when notifications change
            fetchUnreadCount();
          }
        );

        setNotificationChannel(channel);
      } catch (error) {
        console.error('Error setting up notification subscription:', error);
      }
    };

    if (user) {
      fetchUnreadCount();
      setupRealtimeSubscription();
    }

    // Cleanup subscription on unmount
    return () => {
      if (notificationChannel) {
        try {
          if (typeof notificationService?.unsubscribeFromNotifications === 'function') {
            notificationService?.unsubscribeFromNotifications(notificationChannel);
          }
        } catch (error) {
          console.error('Error unsubscribing from notifications:', error);
        }
      }
    };
  }, [user]);

  // Fetch unread DM count and subscribe to new messages
  useEffect(() => {
    if (!user) {
      setUnreadMessages(0);
      return;
    }

    const fetchUnreadMessages = async () => {
      try {
        const count = await dmService.getUnreadTotal();
        setUnreadMessages(count);
      } catch (err) {
        console.warn('Error fetching unread messages:', err);
      }
    };

    fetchUnreadMessages();

    const channel = dmService.subscribeToAllMessages(user.id, () => {
      fetchUnreadMessages();
    });
    setDmChannel(channel);

    return () => {
      if (channel) dmService.unsubscribe(channel);
    };
  }, [user]);

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await signOut();
      // SECURITY: Clear company state on logout
      setUserCompany(null);
      setLocalProfile(null);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      alert('Failed to sign out. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // CRITICAL FIX: Add company-feed and company-teams-page to company detection
  // This ensures navbar stays in company mode when navigating to these pages
  const isOnCompanyPage = location?.pathname?.startsWith('/company-dashboard') || 
                          location?.pathname === '/company-management-dashboard' ||
                          location?.pathname === '/member-management-center' ||
                          location?.pathname === '/company-feed' ||
                          location?.pathname === '/company-teams-page' ||
                          location?.pathname === '/team-dashboard' ||  // ADD: Team dashboard pages
                          location?.pathname === '/team-chat' ||        // ADD: Team chat pages
                          // CRITICAL FIX: Check for company query parameter in bug-board
                          (location?.pathname === '/bug-board' && searchParams?.get('company')) ||
                          // ADD: Detect if viewing company snippet
                          (location?.pathname === '/snippet-details' && searchParams?.get('company'));

  // UPDATED: Navigation items change based on company context
  // CRITICAL: Teams landing page will NEVER trigger company navigation now
  const navigationItems = isOnCompanyPage && userCompany ? [
    { name: 'Company Home', icon: 'Building', path: '/company-dashboard' },
    { name: 'Company Feed', icon: 'Compass', path: '/company-feed' },
    { name: 'Company Teams', icon: 'Users', path: '/company-teams-page' },
    { name: 'Company Bugs', icon: 'Bug', path: `/bug-board?company=${userCompany?.id}` }, // ADDED: Separate company bug board link
    { name: 'Management', icon: 'Settings', path: '/company-management-dashboard' }
  ] : [
    { name: 'Dashboard', icon: 'Home', path: '/user-dashboard' },
    { name: 'Explore', icon: 'Compass', path: '/search-results' },
    { name: 'My Snippets', icon: 'Code', path: '/snippet-collections' },
    { name: 'My Hives', icon: 'Hexagon', path: '/teams-landing-page' },
    { name: 'Messages', icon: 'MessageCircle', path: '/inbox' },
    { name: 'Bugs', icon: 'Bug', path: '/bug-board' }
  ];

  const publicNavigation = [
    { name: 'Home', href: '/', icon: 'Home' },
    { name: 'Features', href: '/features', icon: 'Sparkles' },
    { name: 'Pricing', href: '/pricing', icon: 'DollarSign' },
    { name: 'Docs', href: '/documentation-hub', icon: 'BookOpen' },
    { name: 'About', href: '/about-us', icon: 'Info' }
  ];

  const navigation = user ? navigationItems : publicNavigation;

  // UPDATED: Active state detection with query parameter support
  const isActive = (path) => {
    // Handle paths with query parameters (e.g., /bug-board?company=123)
    if (path?.includes('?')) {
      const [pathname, queryString] = path?.split('?');
      const pathMatches = location?.pathname === pathname;
      
      if (!pathMatches) return false;
      
      // If path has query params, check if current URL has matching params
      if (queryString) {
        const pathParams = new URLSearchParams(queryString);
        const currentParams = new URLSearchParams(location?.search);
        
        // Check if all required params from the path exist in current URL
        for (const [key, value] of pathParams?.entries()) {
          if (currentParams?.get(key) !== value) {
            return false;
          }
        }
      }
      
      return true;
    }
    
    // Simple path matching for routes without query params
    return location?.pathname === path;
  };

  // ENHANCED: User menu with better company access control
  const renderUserMenu = () => {
    if (!userMenuOpen) return null;

    return (
      <div 
        className="absolute right-0 mt-3 w-72 bg-card backdrop-blur-md rounded-xl border border-border py-2 z-50 shadow-xl shadow-black/20 animate-in fade-in slide-in-from-top-2 duration-200"
        role="menu"
        aria-label="User menu"
      >
        <div className="px-4 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full blur-md opacity-50"></div>
              <img
                src={
                  userProfile?.avatar_url || 
                  userProfile?.avatarUrl || 
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile?.full_name || userProfile?.fullName || user?.email || 'User')}&background=3b82f6&color=fff`
                }
                alt={`${userProfile?.full_name || userProfile?.fullName || user?.email || 'User'}'s profile picture`}
                className="w-12 h-12 rounded-full object-cover border-2 border-blue-100 relative z-10 ring-2 ring-blue-200"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.email || 'User')}&background=3b82f6&color=fff`;
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">
                {userProfile?.full_name || userProfile?.fullName || user?.email?.split('@')?.[0] || 'User'}
              </p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        <div className="py-1">
          <button
            onClick={() => {
              navigate('/user-dashboard');
              setUserMenuOpen(false);
            }}
            className="w-full px-4 py-2.5 text-left text-sm text-foreground hover:bg-muted flex items-center gap-3 focus:outline-none focus:bg-muted transition-all duration-200 group"
            role="menuitem"
          >
            <div className="p-1.5 rounded-lg bg-success/15 text-success group-hover:scale-110 transition-transform duration-200">
              <Icon name="Home" size={16} aria-hidden="true" />
            </div>
            <span className="font-medium">Back to Global Feed</span>
          </button>

          <button
            onClick={() => {
              navigate(`/user-profile/${user?.id}`);
              setUserMenuOpen(false);
            }}
            className="w-full px-4 py-2.5 text-left text-sm text-foreground hover:bg-muted flex items-center gap-3 focus:outline-none focus:bg-muted transition-all duration-200 group"
            role="menuitem"
          >
            <div className="p-1.5 rounded-lg bg-primary/15 text-primary group-hover:scale-110 transition-transform duration-200">
              <Icon name="User" size={16} aria-hidden="true" />
            </div>
            <span className="font-medium">View Profile</span>
          </button>

          <button
            onClick={() => {
              navigate('/profile-editor');
              setUserMenuOpen(false);
            }}
            className="w-full px-4 py-2.5 text-left text-sm text-foreground hover:bg-muted flex items-center gap-3 focus:outline-none focus:bg-muted transition-all duration-200 group"
            role="menuitem"
          >
            <div className="p-1.5 rounded-lg bg-indigo-100 text-secondary group-hover:scale-110 transition-transform duration-200">
              <Icon name="Settings" size={16} aria-hidden="true" />
            </div>
            <span className="font-medium">Edit Profile</span>
          </button>

          <button
            onClick={() => {
              navigate('/teams-landing-page');
              setUserMenuOpen(false);
            }}
            className="w-full px-4 py-2.5 text-left text-sm text-foreground hover:bg-muted flex items-center gap-3 focus:outline-none focus:bg-muted transition-all duration-200 group"
            role="menuitem"
          >
            <div className="p-1.5 rounded-lg bg-purple-100 text-primary group-hover:scale-110 transition-transform duration-200">
              <Icon name="Users" size={16} aria-hidden="true" />
            </div>
            <span className="font-medium">My Teams</span>
          </button>

          {/* UPDATED: Company access with clear security messaging */}
          {userCompany ? (
            <button
              onClick={() => {
                navigate('/company-dashboard');
                setUserMenuOpen(false);
              }}
              className="w-full px-4 py-2.5 text-left text-sm text-foreground hover:bg-muted flex items-center gap-3 focus:outline-none focus:bg-muted transition-all duration-200 group"
              role="menuitem"
              title={`Access ${userCompany?.name} dashboard`}
            >
              <div className="p-1.5 rounded-lg bg-success/15 text-success group-hover:scale-110 transition-transform duration-200">
                <Icon name="Building2" size={16} aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-medium block truncate">{userCompany?.name}</span>
                <span className="text-xs text-muted-foreground">Company Dashboard</span>
              </div>
            </button>
          ) : companyLoading ? (
            <div className="w-full px-4 py-2.5 text-left text-sm text-muted-foreground flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-muted">
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              </div>
              <span>Checking company...</span>
            </div>
          ) : (
            <button
              onClick={() => {
                navigate('/company-creation');
                setUserMenuOpen(false);
              }}
              className="w-full px-4 py-2.5 text-left text-sm text-foreground hover:bg-muted flex items-center gap-3 focus:outline-none focus:bg-muted transition-all duration-200 group"
              role="menuitem"
              title="Create or join a company workspace"
            >
              <div className="p-1.5 rounded-lg bg-success/15 text-success group-hover:scale-110 transition-transform duration-200">
                <Icon name="Building2" size={16} aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-medium block">Create / Join Company</span>
                <span className="text-xs text-muted-foreground">Start collaborating</span>
              </div>
            </button>
          )}
        </div>

        <div className="border-t border-border mt-1 pt-1">
          <button
            onClick={handleSignOut}
            disabled={isLoading}
            className="w-full px-4 py-2.5 text-left text-sm text-error hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 flex items-center gap-3 focus:outline-none focus:bg-gradient-to-r focus:from-red-100 focus:to-pink-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
            role="menuitem"
            aria-busy={isLoading}
          >
            <div className="p-1.5 rounded-lg bg-error/15 text-error group-hover:scale-110 transition-transform duration-200">
              <Icon name="LogOut" size={16} aria-hidden="true" />
            </div>
            <span className="font-medium">{isLoading ? 'Signing out...' : 'Sign Out'}</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Skip Navigation Link for Accessibility */}
      <a
        ref={skipLinkRef}
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-gradient-to-r focus:from-blue-600 focus:to-indigo-600 focus:text-white focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:shadow-lg"
      >
        Skip to main content
      </a>

      <nav 
        className="bg-card/80 backdrop-blur-lg border-b border-border/50 sticky top-0 z-50 shadow-sm"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14">
            {/* Logo */}
            <div className="flex items-center">
              <button
                onClick={() => navigate(isOnCompanyPage && userCompany ? '/company-dashboard' : (user ? '/user-dashboard' : '/'))}
                className="flex items-center gap-3 hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring rounded-lg p-2 group"
                aria-label="Go to home page"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-lg blur-sm opacity-0 group-hover:opacity-75 transition-opacity duration-300"></div>
                  <img 
                    src="public/assets/images/F4A2CCAB-658E-44EE-BE03-CDB69CA24EEB-1764073212026.png"
                    alt="HYVhub logo featuring hexagonal design with blue/teal circuit board patterns and bee character"
                    className="h-10 w-auto object-contain relative z-10"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
                <span className="text-xl font-bold text-gradient">
                  HYVhub
                </span>
              </button>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1" role="menubar">
              {navigation?.map((item) => (
                <button
                  key={item?.name}
                  onClick={() => navigate(item?.path || item?.href)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-150 ${
                    isActive(item?.path || item?.href)
                      ? 'bg-primary/15 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                  role="menuitem"
                >
                  <Icon name={item?.icon} size={16} />
                  <span>{item?.name}</span>
                </button>
              ))}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2">
              {user ? (
                <>
                  {/* Add Friends Button - HIDDEN on company pages */}
                  {!isOnCompanyPage && (
                    <button
                      onClick={() => setFriendModalOpen(true)}
                      className="relative p-2.5 text-muted-foreground hover:text-primary rounded-xl transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-ring overflow-hidden"
                      aria-label="Find and add friends"
                      title="Find Friends"
                    >
                      <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <Icon 
                        name="UserPlus" 
                        size={20} 
                        className="relative z-10 group-hover:scale-110 transition-transform duration-300" 
                        aria-hidden="true"
                      />
                    </button>
                  )}

                  {/* Messages with unread badge */}
                  <button
                    onClick={() => navigate('/inbox')}
                    className="relative p-2.5 text-muted-foreground hover:text-primary rounded-xl transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-ring overflow-hidden"
                    aria-label={`Messages ${unreadMessages > 0 ? `(${unreadMessages} unread)` : ''}`}
                    title={`Messages ${unreadMessages > 0 ? `(${unreadMessages} unread)` : ''}`}
                  >
                    <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <Icon
                      name="MessageCircle"
                      size={20}
                      aria-hidden="true"
                      className="relative z-10 group-hover:scale-110 transition-transform duration-300"
                    />
                    {unreadMessages > 0 && (
                      <span
                        className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-xs font-bold text-white bg-gradient-to-r from-primary to-accent rounded-full animate-pulse"
                        aria-label={`${unreadMessages} unread messages`}
                      >
                        {unreadMessages > 99 ? '99+' : unreadMessages}
                      </span>
                    )}
                  </button>

                  {/* UPDATED: Notifications with badge */}
                  <button
                    onClick={() => navigate('/notifications')}
                    className="relative p-2.5 text-muted-foreground hover:text-foreground rounded-xl transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-ring overflow-hidden"
                    aria-label={`View notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
                    title={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-50 to-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <Icon 
                      name="Bell" 
                      size={20} 
                      aria-hidden="true"
                      className="relative z-10 group-hover:scale-110 transition-transform duration-300"
                    />
                    {/* ADD: Notification badge */}
                    {unreadCount > 0 && (
                      <span 
                        className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-xs font-bold text-white bg-gradient-to-r from-red-500 to-pink-500 rounded-full animate-pulse"
                        aria-label={`${unreadCount} unread notifications`}
                      >
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* User Menu */}
                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="relative flex items-center gap-2 p-1.5 hover:bg-muted rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring group"
                      aria-label="Open user menu"
                      aria-expanded={userMenuOpen}
                      aria-haspopup="true"
                    >
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full blur-sm opacity-0 group-hover:opacity-75 transition-opacity duration-300"></div>
                        <img
                          src={
                            userProfile?.avatar_url || 
                            userProfile?.avatarUrl || 
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile?.full_name || userProfile?.fullName || user?.email || 'User')}&background=3b82f6&color=fff`
                          }
                          alt={`${userProfile?.full_name || userProfile?.fullName || user?.email || 'User'}'s profile picture`}
                          className="w-9 h-9 rounded-full object-cover border-2 border-blue-100 relative z-10 ring-2 ring-transparent group-hover:ring-blue-200 transition-all duration-300"
                          onError={(e) => {
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.email || 'User')}&background=3b82f6&color=fff`;
                          }}
                        />
                      </div>
                    </button>

                    {renderUserMenu()}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => navigate('/login')}
                    className="text-sm hover:bg-gradient-to-r hover:from-gray-100 hover:to-blue-50 transition-all duration-300"
                    aria-label="Sign in to your account"
                  >
                    Sign In
                  </Button>
                  <Button
                    onClick={() => navigate('/register')}
                    className="text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300"
                    aria-label="Create a new account"
                  >
                    Get Started
                  </Button>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <button
                id="mobile-menu-toggle"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2.5 text-muted-foreground hover:text-foreground hover:bg-gradient-to-r hover:from-gray-100 hover:to-blue-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-300"
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-menu"
              >
                <Icon name={mobileMenuOpen ? 'X' : 'Menu'} size={24} aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div 
            id="mobile-menu"
            ref={mobileMenuRef}
            className="md:hidden border-t border-border/50 bg-card/95 backdrop-blur-xl shadow-2xl max-h-[calc(100vh-4rem)] overflow-y-auto animate-in slide-in-from-top duration-300"
            role="menu"
            aria-label="Mobile navigation menu"
          >
            <div className="px-4 py-4 space-y-1">
              {/* Add Friends Button in Mobile - HIDDEN on company pages */}
              {user && !isOnCompanyPage && (
                <button
                  onClick={() => {
                    setFriendModalOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-medium rounded-xl text-primary hover:bg-muted transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring group"
                  role="menuitem"
                >
                  <div className="p-2 rounded-lg bg-primary/15 group-hover:scale-110 transition-transform duration-300">
                    <Icon name="UserPlus" size={20} aria-hidden="true" />
                  </div>
                  <span>Find Friends</span>
                </button>
              )}

              {navigation?.map((item) => (
                <button
                  key={item?.name}
                  onClick={() => {
                    navigate(item?.path || item?.href);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm font-medium rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring group relative overflow-hidden ${
                    isActive(item?.path || item?.href)
                      ? 'text-white shadow-lg' 
                      : 'text-foreground hover:text-foreground'
                  }`}
                  role="menuitem"
                  aria-current={isActive(item?.path || item?.href) ? 'page' : undefined}
                >
                  {isActive(item?.path || item?.href) && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>
                  )}
                  {!isActive(item?.path || item?.href) && (
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-50 via-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  )}
                  <div className={`p-2 rounded-lg relative z-10 group-hover:scale-110 transition-transform duration-300 ${
                    isActive(item?.path || item?.href) 
                      ? 'bg-card/20' :'bg-gradient-to-r from-blue-100 to-indigo-100'
                  }`}>
                    <Icon 
                      name={item?.icon} 
                      size={20} 
                      aria-hidden="true"
                      className={isActive(item?.path || item?.href) ? 'text-white' : 'text-primary'}
                    />
                  </div>
                  <span className="relative z-10">{item?.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Friend Search Modal */}
        <FriendSearchModal 
          isOpen={friendModalOpen} 
          onClose={() => setFriendModalOpen(false)} 
        />
      </nav>

      {/* Add custom animations */}
      <style jsx>{`
        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </>
  );
};

export default AppNavigation;