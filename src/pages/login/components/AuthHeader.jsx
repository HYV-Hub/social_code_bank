import React from "react";
import { useNavigate } from "react-router-dom";
import { AppImage } from '../../../components/AppImage';

const AuthHeader = () => {
  const navigate = useNavigate();

  return (
    <div className="text-center mb-8">
      {/* Logo */}
      <button
        onClick={() => navigate("/")}
        className="inline-flex items-center justify-center w-20 h-20 bg-card rounded-xl shadow-lg mb-4 hover:shadow-xl transition-shadow border border-border p-2"
        aria-label="HyvHub Home"
      >
        <AppImage 
          src="publicpublic/assets/images/F4A2CCAB-658E-44EE-BE03-CDB69CA24EEB-1764149456122.png" 
          alt="HyvHub Logo - Bee with honeycomb hexagon pattern representing productivity and technology"
          className="w-full h-full object-contain"
        />
      </button>

      {/* Title */}
      <h1 className="text-3xl font-bold text-foreground mb-2">
        Welcome Back to HyvHub
      </h1>
      <p className="text-muted-foreground">
        Sign in to access your code snippets and collaborate with your team
      </p>
    </div>
  );
};

export default AuthHeader;