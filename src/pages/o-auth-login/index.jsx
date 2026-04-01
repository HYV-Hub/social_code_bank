import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import PublicNavigation from "../../components/PublicNavigation";
import Icon from "../../components/AppIcon";

export default function OAuthLoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [processingCallback, setProcessingCallback] = useState(false);

  useEffect(() => {
    // Handle OAuth callback
    const handleOAuthCallback = async () => {
      // Check if we're on a callback with a hash fragment
      if (window?.location?.hash?.includes('access_token')) {
        setProcessingCallback(true);
        
        try {
          const { data: { session }, error } = await supabase?.auth?.getSession();
          
          if (error) {
            console.error("OAuth session error:", error);
            setError(error?.message || "Authentication failed. Please try again.");
            setProcessingCallback(false);
            return;
          }

          if (session?.user) {
            // Wait a moment for trigger to execute
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Check if profile exists (trigger should create it)
            const { data: profile, error: profileError } = await supabase
              ?.from('user_profiles')
              ?.select('*')
              ?.eq('id', session?.user?.id)
              ?.single();

            if (profileError || !profile) {
              console.error("Profile not found for OAuth user:", profileError);
              
              // Create profile manually if trigger failed
              const username = session?.user?.user_metadata?.preferred_username || 
                              session?.user?.user_metadata?.user_name ||
                              session?.user?.email?.split('@')?.[0] || 
                              `user_${session?.user?.id?.substring(0, 8)}`;
              
              const { error: createError } = await supabase
                ?.from('user_profiles')
                ?.insert({
                  id: session?.user?.id,
                  email: session?.user?.email,
                  full_name: session?.user?.user_metadata?.full_name || 
                            session?.user?.user_metadata?.name || 
                            session?.user?.email?.split('@')?.[0],
                  username: username,
                  role: 'user',
                  email_verified: true,
                  avatar_url: session?.user?.user_metadata?.avatar_url || null
                });

              if (createError) {
                console.error("Failed to create profile:", createError);
                setError("Authentication successful but profile setup failed. Please contact support or try again.");
                setProcessingCallback(false);
                return;
              }
            }

            // Navigate to dashboard
            navigate("/user-dashboard");
          }
        } catch (err) {
          console.error("Callback handling error:", err);
          setError("An unexpected error occurred during authentication. Please try again.");
          setProcessingCallback(false);
        }
      }
    };

    handleOAuthCallback();
  }, [navigate]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");

    try {
      const { data, error } = await supabase?.auth?.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window?.location?.origin}/o-auth-login`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error("Google OAuth error:", error);
        setError(error?.message || "Failed to initiate Google sign-in. Please ensure Google OAuth is configured in your Supabase project.");
      }
    } catch (err) {
      console.error("OAuth error:", err);
      setError("An unexpected error occurred. Please try again or contact support if the issue persists.");
    } finally {
      setLoading(false);
    }
  };

  const handleGitHubSignIn = async () => {
    setLoading(true);
    setError("");

    try {
      const { data, error } = await supabase?.auth?.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window?.location?.origin}/o-auth-login`,
        },
      });

      if (error) {
        console.error("GitHub OAuth error:", error);
        setError(error?.message || "Failed to initiate GitHub sign-in. Please ensure GitHub OAuth is configured in your Supabase project.");
      }
    } catch (err) {
      console.error("OAuth error:", err);
      setError("An unexpected error occurred. Please try again or contact support if the issue persists.");
    } finally {
      setLoading(false);
    }
  };

  if (processingCallback) {
    return (
      <>
        <Helmet>
          <title>Processing Login - HYVhub</title>
        </Helmet>
        
        <PublicNavigation />
        
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="bg-card rounded-xl shadow-2xl border border-border p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold text-foreground mb-2">Processing Sign In</h2>
              <p className="text-muted-foreground">Setting up your account...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>OAuth Login - HYVhub</title>
      </Helmet>
      <PublicNavigation />
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">Sign In with OAuth</h1>
            <p className="text-muted-foreground">Continue with your preferred provider</p>
          </div>

          <div className="bg-card rounded-xl shadow-2xl border border-border p-8">
            {error && (
              <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <Icon name="AlertCircle" size={20} className="text-error flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-error text-sm font-medium mb-1">Authentication Error</p>
                    <p className="text-error text-sm">{error}</p>
                    <button
                      onClick={() => setError("")}
                      className="mt-2 text-xs text-error hover:text-error underline"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-3 px-4 bg-card hover:bg-muted text-foreground font-medium rounded-lg flex items-center justify-center gap-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-2 border-border hover:border-slate-400"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                {loading ? "Connecting..." : "Continue with Google"}
              </button>

              <button
                onClick={handleGitHubSignIn}
                disabled={loading}
                className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg flex items-center justify-center gap-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                {loading ? "Connecting..." : "Continue with GitHub"}
              </button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-muted-foreground text-sm">
                By signing in, you agree to our{" "}
                <a href="/terms-of-service" className="text-primary hover:text-primary underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="/privacy-policy" className="text-primary hover:text-primary underline">
                  Privacy Policy
                </a>
              </p>
            </div>

            <div className="mt-6 pt-6 border-t border-border">
              <button
                onClick={() => navigate("/login")}
                className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
              >
                ← Back to Login
              </button>
            </div>
          </div>

          {/* Setup Instructions */}
          {error && (error?.includes("configured") || error?.includes("setup")) && (
            <div className="mt-6 bg-primary/10 border border-primary/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Icon name="Info" size={20} className="text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-foreground mb-1">OAuth Setup Required</h3>
                  <p className="text-xs text-primary">
                    To enable OAuth sign-in, configure your providers in the Supabase dashboard under Authentication → Providers. 
                    See{" "}
                    <a 
                      href="https://supabase.com/docs/guides/auth/social-login" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="underline hover:text-foreground"
                    >
                      documentation
                    </a>
                    {" "}for setup instructions.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}