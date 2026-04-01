import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import { AppImage } from '../../../components/AppImage';

const NavigationBar = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Contact", href: "/contact" },
    { label: "Login", href: "/login" },
  ];

  const handleSignIn = () => {
    navigate('/login');
  };

  const handleSignUp = () => {
    navigate('/register');
  };

  return (
    <nav className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <AppImage 
                src="public/assets/images/F4A2CCAB-658E-44EE-BE03-CDB69CA24EEB-1764073212026.png" 
                alt="HyvHub Logo - Technology-themed bee character with hexagonal honeycomb circuit pattern representing innovation and collaboration"
                className="w-10 h-10 object-contain"
              />
              <span className="text-xl font-bold text-foreground hidden sm:block">HyvHub</span>
            </div>

            <div className="hidden md:flex items-center gap-6">
              {navLinks?.map((link) => (
                <button
                  key={link?.label}
                  onClick={() => navigate(link?.href)}
                  className="text-muted-foreground hover:text-primary font-medium transition-colors"
                >
                  {link?.label}
                </button>
              ))}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={handleSignIn}
            >
              Sign In
            </Button>
            <Button 
              variant="default"
              iconName="Rocket"
              iconPosition="right"
              onClick={handleSignUp}
            >
              Get Started Free
            </Button>
          </div>

          <button
            className="md:hidden p-2 rounded-lg hover:bg-muted"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <Icon name={mobileMenuOpen ? "X" : "Menu"} size={24} />
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-4">
              {navLinks?.map((link) => (
                <button
                  key={link?.label}
                  onClick={() => {
                    navigate(link?.href);
                    setMobileMenuOpen(false);
                  }}
                  className="text-muted-foreground hover:text-primary font-medium py-2 text-left"
                >
                  {link?.label}
                </button>
              ))}
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                <Button 
                  variant="outline" 
                  fullWidth
                  onClick={() => {
                    handleSignIn();
                    setMobileMenuOpen(false);
                  }}
                >
                  Sign In
                </Button>
                <Button 
                  variant="default"
                  fullWidth
                  iconName="Rocket"
                  iconPosition="right"
                  onClick={() => {
                    handleSignUp();
                    setMobileMenuOpen(false);
                  }}
                >
                  Get Started Free
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavigationBar;