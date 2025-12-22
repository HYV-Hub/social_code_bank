import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import Icon from "../../../components/AppIcon";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";

export default function LoginForm() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e?.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!formData?.email || !formData?.password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await signIn(formData?.email, formData?.password);
      
      if (result?.error) {
        const errorMessage = result?.error?.message || "Login failed. Please check your credentials.";
        setError(errorMessage);
        console.error("Login error:", result?.error);
      } else if (result?.data?.user) {
        navigate("/user-dashboard");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err?.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = () => {
    navigate("/o-auth-login");
  };

  return (
    <div className="w-full">
      {/* Global Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <Icon name="AlertCircle" size={20} color="#dc2626" className="flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-red-800 font-medium">Authentication Failed</p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Input */}
        <Input
          label="Email Address"
          type="email"
          name="email"
          placeholder="your.email@example.com"
          value={formData?.email}
          onChange={handleChange}
          required
        />

        {/* Password Input */}
        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Enter your password"
            value={formData?.password}
            onChange={handleChange}
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

        {/* Forgot Password Link */}
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={() => navigate("/forgot-password")}
            className="text-sm text-slate-600 hover:text-slate-800 hover:underline font-medium"
          >
            Forgot Password?
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
            loading
              ? "bg-slate-400 text-slate-200 cursor-not-allowed" :"bg-slate-700 text-white hover:bg-slate-800 shadow-sm"
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Signing In...
            </span>
          ) : (
            "Sign In"
          )}
        </button>
      </form>

      {/* Help Text */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
        <div className="flex items-start gap-2">
          <Icon name="Info" size={18} color="#3b82f6" className="flex-shrink-0 mt-0.5" />
          <div className="text-xs text-slate-700">
            <p className="font-medium mb-1">Need Help?</p>
            <p className="text-slate-600">If you don't have an account yet, click "Create Account" below to get started.</p>
          </div>
        </div>
      </div>
    </div>
  );
}