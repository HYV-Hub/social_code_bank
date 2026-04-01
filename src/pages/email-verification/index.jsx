import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { supabase } from "../../lib/supabase";
import Icon from "../../components/AppIcon";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import PublicNavigation from "../../components/PublicNavigation";

const EmailVerification = () => {
  const navigate = useNavigate();
  const [verificationStatus, setVerificationStatus] = useState("pending");
  const [errorMessage, setErrorMessage] = useState("");
  const [email, setEmail] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [showResendSuccess, setShowResendSuccess] = useState(false);

  useEffect(() => {
    // Check if user came from email verification link
    const hashParams = new URLSearchParams(window?.location?.hash?.substring(1));
    const accessToken = hashParams?.get('access_token');
    const type = hashParams?.get('type');

    if (accessToken && type === 'signup') {
      handleEmailVerification(accessToken);
    }
  }, []);

  useEffect(() => {
    // Countdown timer for resend cooldown
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleEmailVerification = async (token) => {
    try {
      const { data, error } = await supabase?.auth?.verifyOtp({
        token_hash: token,
        type: 'signup'
      });

      if (error) {
        setVerificationStatus("error");
        if (error?.message?.includes('expired')) {
          setVerificationStatus("expired");
          setErrorMessage("Your verification link has expired. Please request a new one below.");
        } else {
          setErrorMessage(error?.message || "Verification failed. Please try again.");
        }
        return;
      }

      if (data?.user) {
        setVerificationStatus("success");
        setTimeout(() => {
          navigate("/user-dashboard");
        }, 3000);
      }
    } catch (err) {
      console.error('Verification error:', err);
      setVerificationStatus("error");
      setErrorMessage("An unexpected error occurred during verification.");
    }
  };

  const handleResendEmail = async () => {
    if (!email) {
      setErrorMessage("Please enter your email address");
      return;
    }

    setIsResending(true);
    setErrorMessage("");
    setShowResendSuccess(false);

    try {
      const { error } = await supabase?.auth?.resend({
        type: 'signup',
        email: email
      });

      if (error) {
        setErrorMessage(error?.message || "Failed to resend verification email");
      } else {
        setResendCooldown(60);
        setShowResendSuccess(true);
        setErrorMessage("");
        setTimeout(() => setShowResendSuccess(false), 5000);
      }
    } catch (err) {
      setErrorMessage("An error occurred while resending the email");
    } finally {
      setIsResending(false);
    }
  };

  // Success State
  if (verificationStatus === "success") {
    return (
      <>
        <Helmet>
          <title>Email Verified - HYVhub</title>
        </Helmet>

        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="bg-card rounded-lg shadow-xl border border-border p-8">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-success/15 rounded-full flex items-center justify-center">
                  <Icon name="CheckCircle2" size={32} color="#16a34a" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-foreground text-center mb-3">
                Email Verified!
              </h1>
              <p className="text-muted-foreground text-center mb-8">
                Your email has been successfully verified. You will be redirected to your dashboard shortly.
              </p>
              <Button
                onClick={() => navigate("/user-dashboard")}
                variant="default"
                fullWidth
                iconName="ArrowRight"
                iconPosition="right"
              >
                Go to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Email Verification - HYVhub</title>
      </Helmet>

      <PublicNavigation />

      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-blue-800 rounded-lg flex items-center justify-center">
                <Icon name="Code2" size={24} color="#ffffff" />
              </div>
              <span className="text-2xl font-bold text-foreground">HYVhub</span>
            </div>
          </div>

          {/* Main Card */}
          <div className="bg-card rounded-lg shadow-xl border border-border p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary/15 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="Mail" size={32} color="#1e40af" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Check Your Email
              </h1>
              <p className="text-muted-foreground text-sm">
                We've sent a verification link to your email address. Click the link in the email to verify your account.
              </p>
            </div>

            {/* Success Message for Resend */}
            {showResendSuccess && (
              <div className="mb-6 bg-success/10 border border-success/20 rounded-lg p-4 flex items-start gap-3">
                <Icon name="CheckCircle2" size={20} color="#16a34a" className="flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-success font-medium">Email Sent!</p>
                  <p className="text-sm text-success mt-1">
                    A new verification link has been sent to your email.
                  </p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-6 bg-error/10 border border-error/20 rounded-lg p-4 flex items-start gap-3">
                <Icon name="AlertCircle" size={20} color="#dc2626" className="flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-error font-medium">Verification Error</p>
                  <p className="text-sm text-error mt-1">{errorMessage}</p>
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <p className="text-sm font-medium text-foreground mb-3">What to do next:</p>
              <ol className="space-y-2 text-sm text-foreground">
                <li className="flex items-start gap-2">
                  <span className="font-semibold mt-0.5">1.</span>
                  <span>Open your email inbox</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold mt-0.5">2.</span>
                  <span>Look for an email from HYVhub</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold mt-0.5">3.</span>
                  <span>Click the verification link in the email</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold mt-0.5">4.</span>
                  <span>You'll be automatically redirected to your dashboard</span>
                </li>
              </ol>
            </div>

            {/* Resend Section */}
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Didn't receive the email?</span>
                </div>
              </div>

              <Input
                label="Your Email Address"
                type="email"
                name="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e?.target?.value)}
                required
              />

              <Button
                onClick={handleResendEmail}
                variant="outline"
                fullWidth
                loading={isResending}
                disabled={resendCooldown > 0}
                iconName="RefreshCw"
              >
                {resendCooldown > 0 
                  ? `Resend Link in ${resendCooldown}s` 
                  : isResending 
                    ? "Sending..." :"Resend Verification Link"
                }
              </Button>
            </div>

            {/* Troubleshooting */}
            <div className="mt-6 p-4 bg-muted border border-border rounded-lg">
              <p className="text-xs font-medium text-muted-foreground mb-2">Can't find the email?</p>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Icon name="Check" size={12} className="mt-0.5 flex-shrink-0" />
                  <span>Check your spam or junk folder</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" size={12} className="mt-0.5 flex-shrink-0" />
                  <span>Wait a few minutes for email delivery</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" size={12} className="mt-0.5 flex-shrink-0" />
                  <span>Verify your email address is correct above</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" size={12} className="mt-0.5 flex-shrink-0" />
                  <span>Make sure you haven't already verified your account</span>
                </li>
              </ul>
            </div>

            {/* Back to Login */}
            <div className="mt-6 text-center">
              <button
                onClick={() => navigate("/login")}
                className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-2 transition-colors"
              >
                <Icon name="ArrowLeft" size={16} />
                <span>Back to Login</span>
              </button>
            </div>
          </div>

          {/* Security Note */}
          <div className="mt-6 text-center">
            <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
              <Icon name="Shield" size={14} />
              <span>Verification link expires in 24 hours</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EmailVerification;