import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import Icon from "../../components/AppIcon";
import PublicNavigation from "../../components/PublicNavigation";

import LoginForm from "./components/LoginForm";
import CompanyInviteSection from "./components/CompanyInviteSection";
import AuthHeader from "./components/AuthHeader";

const Login = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("credentials");

  return (
    <>
      <Helmet>
        <title>Sign In - Social Code Bank</title>
        <meta name="description" content="Sign in to your Social Code Bank account to access code snippets, bug tracking, and team collaboration tools." />
      </Helmet>

      <PublicNavigation />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo and Header */}
          <AuthHeader />

          {/* Main Authentication Card */}
          <div className="bg-card rounded-lg shadow-xl border border-slate-200 overflow-hidden">
            {/* Tab Navigation */}
            <div className="flex border-b border-slate-200">
              <button
                onClick={() => setActiveTab("credentials")}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === "credentials" ?"text-slate-700 border-b-2 border-slate-600 bg-slate-50" :"text-slate-600 hover:text-slate-800 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Icon name="Mail" size={18} />
                  <span>Email Sign In</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab("invite")}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === "invite" ?"text-slate-700 border-b-2 border-slate-600 bg-slate-50" :"text-slate-600 hover:text-slate-800 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Icon name="Building2" size={18} />
                  <span>Company Invite</span>
                </div>
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-8">
              {activeTab === "credentials" ? (
                <LoginForm />
              ) : (
                <CompanyInviteSection />
              )}
            </div>

            {/* OAuth Options */}
            <div className="px-8 pb-6">
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-slate-500">Or continue with</span>
                </div>
              </div>
              
              <button
                onClick={() => navigate("/o-auth-login")}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-colors"
              >
                <Icon name="Github" size={18} />
                <span>GitHub / Google</span>
              </button>
            </div>

            {/* Footer Links */}
            <div className="px-8 py-6 bg-slate-50 border-t border-slate-200">
              <div className="text-center">
                <p className="text-sm text-slate-600">
                  Don't have an account?{" "}
                  <button
                    onClick={() => navigate("/register")}
                    className="text-primary font-medium hover:text-primary hover:underline"
                  >
                    Create Account
                  </button>
                </p>
              </div>
            </div>
          </div>

          {/* Additional Links */}
          <div className="mt-6 text-center space-y-2">
            <button
              onClick={() => navigate("/public-homepage")}
              className="text-sm text-slate-600 hover:text-slate-800 hover:underline"
            >
              Back to Homepage
            </button>
          </div>

          {/* Trust Signals */}
          <div className="mt-8 flex items-center justify-center gap-6 text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <Icon name="Shield" size={14} />
              <span>SSL Secured</span>
            </div>
            <div className="flex items-center gap-1">
              <Icon name="Lock" size={14} />
              <span>256-bit Encryption</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;