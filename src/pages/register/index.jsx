import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import RoleCard from "./components/RoleCard";
import PasswordStrengthMeter from "./components/PasswordStrengthMeter";
import CompanyCreationFields from "./components/CompanyCreationFields";
import PublicNavigation from "../../components/PublicNavigation";


export default function RegisterPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    username: "",
    bio: "",
    role: "", // Will store: 'user' or 'company_admin'
    companyName: "",
    companySlug: "",
    companyWebsite: "",
    companyDescription: "",
    inviteCode: ""
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRoleSelect = (selectedRole) => {
    // Map UI roles to database roles
    const roleMapping = {
      'developer': 'user',
      'company': 'company_admin'
    };
    
    setFormData(prev => ({ ...prev, role: roleMapping?.[selectedRole] || selectedRole }));
    setError("");
  };

  const handleChange = (e) => {
    const { name, value } = e?.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError("");
    setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    if (!formData?.email || !formData?.password || !formData?.fullName || !formData?.role) {
      setError("Please fill in all required fields and select an account type");
      return false;
    }

    if (formData?.password !== formData?.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    if (formData?.password?.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex?.test(formData?.email)) {
      setError("Please enter a valid email address");
      return false;
    }

    if (formData?.role === "company_admin" && !formData?.companyName) {
      setError("Company name is required for company accounts");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Prepare company data if role is company_admin
      const companyData = formData?.role === "company_admin" ? {
        name: formData?.companyName,
        slug: formData?.companySlug,
        website: formData?.companyWebsite,
        description: formData?.companyDescription
      } : null;

      const result = await signUp(
        formData?.email,
        formData?.password,
        formData?.fullName,
        formData?.role,
        companyData,
        formData?.role === "user" ? formData?.inviteCode : null
      );

      if (result?.error) {
        // Enhanced error handling for rate limiting and other auth errors
        const errorMessage = result?.error?.message || "Registration failed. Please try again.";
        
        // Check for rate limiting errors
        if (errorMessage?.toLowerCase()?.includes("rate limit") || 
            errorMessage?.toLowerCase()?.includes("too many requests")) {
          setError(
            "Too many signup attempts detected. For security reasons, please wait 5-10 minutes before trying again. " +
            "If you've already created an account, try logging in instead or use the 'Forgot Password' option."
          );
        } else if (errorMessage?.toLowerCase()?.includes("user already registered")) {
          setError(
            "This email is already registered. Please try logging in instead, or use 'Forgot Password' if you need to reset your credentials."
          );
        } else if (errorMessage?.toLowerCase()?.includes("invalid email")) {
          setError("Please provide a valid email address.");
        } else if (errorMessage?.toLowerCase()?.includes("weak password")) {
          setError("Password is too weak. Please use a stronger password with at least 8 characters, including uppercase, lowercase, and numbers.");
        } else {
          // Generic error with helpful context
          setError(`Registration error: ${errorMessage}. Please try again or contact support if the issue persists.`);
        }
        
        console.error("Signup error details:", result?.error);
      } else {
        setSuccess("Registration successful! Please check your email to verify your account before signing in.");
        // Clear form
        setFormData({
          email: "",
          password: "",
          confirmPassword: "",
          fullName: "",
          username: "",
          bio: "",
          role: "",
          companyName: "",
          companySlug: "",
          companyWebsite: "",
          companyDescription: "",
          inviteCode: ""
        });
        
        // Navigate after delay
        setTimeout(() => {
          navigate("/email-verification");
        }, 2000);
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError(
        "An unexpected error occurred. This might be due to network issues or server unavailability. " + "Please check your internet connection and try again in a few minutes."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Register - HYVhub</title>
      </Helmet>

      <PublicNavigation />

      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">Join HYVhub</h1>
            <p className="text-muted-foreground">Start sharing and discovering code snippets</p>
          </div>

          {/* Registration Form */}
          <div className="bg-card rounded-lg shadow-xl border border-border p-8">
            {/* Error/Success Messages */}
            {error && (
              <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-lg">
                <p className="text-error text-sm">{error}</p>
              </div>
            )}
            
            {success && (
              <div className="mb-6 p-4 bg-success/10 border border-success/20 rounded-lg">
                <p className="text-success text-sm">{success}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Account Type Selection */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-3">
                  Select Account Type *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <RoleCard
                    role="developer"
                    title="Developer"
                    description="Individual developer account"
                    icon="👨‍💻"
                    isSelected={formData?.role === "user"}
                    onSelect={() => handleRoleSelect("developer")}
                  />
                  <RoleCard
                    role="company"
                    title="Company"
                    description="Create a company account and manage your team"
                    icon="🏢"
                    isSelected={formData?.role === "company_admin"}
                    onSelect={() => handleRoleSelect("company")}
                  />
                </div>
              </div>

              {/* Basic Information */}
              <div className="space-y-4">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-muted-foreground mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData?.fullName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-muted-foreground mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData?.username}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                    placeholder="johndoe"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">Optional - If not provided, will be generated from your email</p>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-muted-foreground mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData?.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                    placeholder="john@example.com"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-muted-foreground mb-2">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData?.bio}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
                    placeholder="Tell us about yourself..."
                  />
                  <p className="mt-1 text-xs text-muted-foreground">Optional - Share a brief description about yourself</p>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-muted-foreground mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData?.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                    placeholder="••••••••"
                    required
                  />
                  <PasswordStrengthMeter password={formData?.password} />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-muted-foreground mb-2">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData?.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {/* Conditional Fields Based on Role */}
              {formData?.role === "company_admin" && (
                <CompanyCreationFields
                  companyName={formData?.companyName}
                  setCompanyName={(value) => setFormData(prev => ({ ...prev, companyName: value }))}
                  companySlug={formData?.companySlug}
                  setCompanySlug={(value) => setFormData(prev => ({ ...prev, companySlug: value }))}
                  companyWebsite={formData?.companyWebsite}
                  setCompanyWebsite={(value) => setFormData(prev => ({ ...prev, companyWebsite: value }))}
                  companyDescription={formData?.companyDescription}
                  setCompanyDescription={(value) => setFormData(prev => ({ ...prev, companyDescription: value }))}
                  errors={errors}
                  onChange={handleChange}
                />
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !formData?.role}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
                  loading || !formData?.role
                    ? "bg-muted text-muted-foreground cursor-not-allowed" :"bg-primary text-white hover:bg-primary/90 shadow-sm"
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Account...
                  </span>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="text-primary hover:text-primary font-medium">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}