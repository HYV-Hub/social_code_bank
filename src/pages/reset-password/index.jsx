import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useAuth } from "../../contexts/AuthContext";
import Icon from "../../components/AppIcon";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import PublicNavigation from "../../components/PublicNavigation";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { updatePassword } = useAuth();
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [globalError, setGlobalError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Check if user has a valid reset token
  useEffect(() => {
    const hashParams = new URLSearchParams(window?.location?.hash?.substring(1));
    const accessToken = hashParams?.get('access_token');
    const type = hashParams?.get('type');

    if (!accessToken || type !== 'recovery') {
      setGlobalError("Invalid or expired reset link. Please request a new password reset.");
    }
  }, []);

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password?.length >= 8) strength += 25;
    if (password?.length >= 12) strength += 25;
    if (/[a-z]/?.test(password) && /[A-Z]/?.test(password)) strength += 20;
    if (/\d/?.test(password)) strength += 15;
    if (/[^a-zA-Z0-9]/?.test(password)) strength += 15;
    return strength;
  };

  const handleChange = (e) => {
    const { name, value } = e?.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors?.[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
    setGlobalError("");

    // Calculate password strength for password field
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.password) {
      newErrors.password = "Password is required";
    } else if (formData?.password?.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/?.test(formData?.password)) {
      newErrors.password = "Password must include uppercase, lowercase, and numbers";
    }

    if (!formData?.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData?.password !== formData?.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setGlobalError("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await updatePassword(formData?.password);
      
      if (error) {
        if (error?.message?.includes('same as the old password')) {
          setGlobalError("New password must be different from your old password");
        } else if (error?.message?.includes('Invalid token')) {
          setGlobalError("Reset link has expired. Please request a new password reset.");
        } else {
          setGlobalError(error?.message || "Failed to reset password. Please try again.");
        }
        setIsLoading(false);
        return;
      }

      // Success
      setResetSuccess(true);
    } catch (err) {
      console.error('Password reset error:', err);
      setGlobalError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const getStrengthColor = () => {
    if (passwordStrength >= 80) return "bg-success/100";
    if (passwordStrength >= 50) return "bg-warning/100";
    return "bg-error/100";
  };

  const getStrengthText = () => {
    if (passwordStrength >= 80) return "Strong";
    if (passwordStrength >= 50) return "Medium";
    return "Weak";
  };

  if (resetSuccess) {
    return (
      <>
        <Helmet>
          <title>Password Reset Successful - Social Code Bank</title>
          <meta name="description" content="Your password has been reset successfully" />
        </Helmet>

        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="bg-card rounded-lg shadow-xl border border-slate-200 p-8">
              {/* Success Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-success/15 rounded-full flex items-center justify-center">
                  <Icon name="CheckCircle2" size={32} color="#16a34a" />
                </div>
              </div>

              {/* Success Message */}
              <h1 className="text-2xl font-bold text-slate-900 text-center mb-3">
                Password Reset Successful!
              </h1>
              <p className="text-slate-600 text-center mb-8">
                Your password has been updated successfully. You can now log in with your new password.
              </p>

              {/* Action Button */}
              <Button
                onClick={() => navigate("/login")}
                variant="default"
                fullWidth
                iconName="LogIn"
                iconPosition="right"
              >
                Continue to Login
              </Button>

              {/* Security Note */}
              <div className="mt-6 p-4 bg-success/10 border border-success/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <Icon name="ShieldCheck" size={16} color="#16a34a" className="flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-success">
                    For security reasons, all other sessions have been logged out. Please log in again with your new password.
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
        <title>Reset Password - HyvHub</title>
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
                <Icon name="Lock" size={32} color="#1e40af" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">
                Set New Password
              </h1>
              <p className="text-slate-600 text-sm">
                Choose a strong password to secure your account.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Global Error Message */}
              {globalError && (
                <div className="bg-error/10 border border-error/20 rounded-lg p-4 flex items-start gap-3">
                  <Icon name="AlertCircle" size={20} color="#dc2626" className="flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-red-800 font-medium">Error</p>
                    <p className="text-sm text-error mt-1">{globalError}</p>
                  </div>
                </div>
              )}

              {/* New Password Input */}
              <div>
                <div className="relative">
                  <Input
                    label="New Password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your new password"
                    value={formData?.password}
                    onChange={handleChange}
                    error={errors?.password}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-9 text-slate-500 hover:text-slate-700"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    <Icon name={showPassword ? "EyeOff" : "Eye"} size={20} />
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {formData?.password && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-600">Password Strength</span>
                      <span className={`text-xs font-medium ${
                        passwordStrength >= 80 ? "text-success" :
                        passwordStrength >= 50 ? "text-warning": "text-error"
                      }`}>
                        {getStrengthText()}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor()}`}
                        style={{ width: `${passwordStrength}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password Input */}
              <div className="relative">
                <Input
                  label="Confirm New Password"
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Re-enter your new password"
                  value={formData?.confirmPassword}
                  onChange={handleChange}
                  error={errors?.confirmPassword}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-9 text-slate-500 hover:text-slate-700"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  <Icon name={showConfirmPassword ? "EyeOff" : "Eye"} size={20} />
                </button>
              </div>

              {/* Password Requirements */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <p className="text-xs font-medium text-slate-700 mb-2">Password must contain:</p>
                <ul className="space-y-1">
                  <li className="flex items-center gap-2 text-xs text-slate-600">
                    <Icon 
                      name={formData?.password?.length >= 8 ? "CheckCircle2" : "Circle"} 
                      size={14} 
                      color={formData?.password?.length >= 8 ? "#16a34a" : "#94a3b8"}
                    />
                    <span>At least 8 characters</span>
                  </li>
                  <li className="flex items-center gap-2 text-xs text-slate-600">
                    <Icon 
                      name={/[A-Z]/?.test(formData?.password) ? "CheckCircle2" : "Circle"} 
                      size={14} 
                      color={/[A-Z]/?.test(formData?.password) ? "#16a34a" : "#94a3b8"}
                    />
                    <span>One uppercase letter</span>
                  </li>
                  <li className="flex items-center gap-2 text-xs text-slate-600">
                    <Icon 
                      name={/[a-z]/?.test(formData?.password) ? "CheckCircle2" : "Circle"} 
                      size={14} 
                      color={/[a-z]/?.test(formData?.password) ? "#16a34a" : "#94a3b8"}
                    />
                    <span>One lowercase letter</span>
                  </li>
                  <li className="flex items-center gap-2 text-xs text-slate-600">
                    <Icon 
                      name={/\d/?.test(formData?.password) ? "CheckCircle2" : "Circle"} 
                      size={14} 
                      color={/\d/?.test(formData?.password) ? "#16a34a" : "#94a3b8"}
                    />
                    <span>One number</span>
                  </li>
                </ul>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="default"
                fullWidth
                loading={isLoading}
                iconName="Check"
                iconPosition="right"
              >
                {isLoading ? "Resetting Password..." : "Reset Password"}
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
              <span>Your data is encrypted and secure</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ResetPassword;