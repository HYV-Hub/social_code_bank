import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useAuth } from "../../contexts/AuthContext";
import Icon from "../../components/AppIcon";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import PublicNavigation from "../../components/PublicNavigation";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { resetPasswordForEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/?.test(email);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError("");

    // Validation
    if (!email) {
      setError("Email address is required");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      const { error: resetError } = await resetPasswordForEmail(email);
      
      if (resetError) {
        if (resetError?.message?.includes('User not found')) {
          setError("No account found with this email address. Please check your email or create a new account.");
        } else {
          setError(resetError?.message || "Failed to send reset email. Please try again.");
        }
        setIsLoading(false);
        return;
      }

      // Success
      setEmailSent(true);
    } catch (err) {
      console.error('Password reset error:', err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <>
        <Helmet>
          <title>Check Your Email - Social Code Bank</title>
          <meta name="description" content="Password reset instructions sent" />
        </Helmet>

        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            {/* Success Card */}
            <div className="bg-card rounded-lg shadow-xl border border-slate-200 p-8">
              {/* Success Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-success/15 rounded-full flex items-center justify-center">
                  <Icon name="MailCheck" size={32} color="#16a34a" />
                </div>
              </div>

              {/* Success Message */}
              <h1 className="text-2xl font-bold text-slate-900 text-center mb-3">
                Check Your Email
              </h1>
              <p className="text-slate-600 text-center mb-6">
                We've sent password reset instructions to:
              </p>
              <p className="text-foreground font-semibold text-center mb-6 bg-primary/10 py-3 px-4 rounded-lg">
                {email}
              </p>

              {/* Instructions */}
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary/15 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-foreground text-xs font-bold">1</span>
                  </div>
                  <p className="text-sm text-slate-700">Check your email inbox (and spam folder)</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary/15 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-foreground text-xs font-bold">2</span>
                  </div>
                  <p className="text-sm text-slate-700">Click the password reset link in the email</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary/15 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-foreground text-xs font-bold">3</span>
                  </div>
                  <p className="text-sm text-slate-700">Set your new password</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={() => navigate("/login")}
                  variant="default"
                  fullWidth
                  iconName="ArrowLeft"
                >
                  Back to Login
                </Button>
                <Button
                  onClick={() => {
                    setEmailSent(false);
                    setEmail("");
                  }}
                  variant="outline"
                  fullWidth
                >
                  Send to Different Email
                </Button>
              </div>

              {/* Help Note */}
              <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <Icon name="Info" size={16} color="#64748b" className="flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-600">
                    The reset link will expire in 1 hour. If you don't receive the email within 5 minutes, please check your spam folder or request a new link.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Forgot Password - HyvHub</title>
      </Helmet>

      {/* Add Navigation */}
      <PublicNavigation />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-blue-800 rounded-lg flex items-center justify-center">
                <Icon name="Code2" size={24} color="#ffffff" />
              </div>
              <span className="text-2xl font-bold text-slate-900">Social Code Bank</span>
            </div>
          </div>

          {/* Main Card */}
          <div className="bg-card rounded-lg shadow-xl border border-slate-200 p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary/15 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="KeyRound" size={32} color="#1e40af" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">
                Forgot Password?
              </h1>
              <p className="text-slate-600 text-sm">
                No worries! Enter your email address and we'll send you instructions to reset your password.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="bg-error/10 border border-error/20 rounded-lg p-4 flex items-start gap-3">
                  <Icon name="AlertCircle" size={20} color="#dc2626" className="flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-red-800 font-medium">Error</p>
                    <p className="text-sm text-error mt-1">{error}</p>
                  </div>
                </div>
              )}

              {/* Email Input */}
              <Input
                label="Email Address"
                type="email"
                name="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e?.target?.value);
                  setError("");
                }}
                error=""
                required
              />

              {/* Submit Button */}
              <Button
                type="submit"
                variant="default"
                fullWidth
                loading={isLoading}
                iconName="Mail"
                iconPosition="right"
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>

              {/* Back to Login */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="text-sm text-slate-600 hover:text-slate-800 inline-flex items-center gap-2"
                >
                  <Icon name="ArrowLeft" size={16} />
                  <span>Back to Login</span>
                </button>
              </div>
            </form>
          </div>

          {/* Security Note */}
          <div className="mt-6 text-center">
            <div className="inline-flex items-center gap-2 text-xs text-slate-500">
              <Icon name="Shield" size={14} />
              <span>Your security is our priority</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;