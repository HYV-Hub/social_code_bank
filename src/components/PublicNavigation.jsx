import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from './AppIcon';
import { AppImage } from './AppImage';
import { Link } from 'react-router-dom';

const PublicNavigation = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Features", href: "/features" },
    { label: "Pricing", href: "/pricing" },
    { label: "Docs", href: "/documentation-hub" },
    { label: "About", href: "/about-us" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <AppImage 
                src="public/assets/images/F4A2CCAB-658E-44EE-BE03-CDB69CA24EEB-1764073212026.png" 
                alt="HYVhub Logo - Technology-themed bee character with hexagonal honeycomb circuit pattern"
                className="w-10 h-10 object-contain"
              />
              <span className="text-xl font-bold text-foreground">HYVhub</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link to="/" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                Home
              </Link>
              <Link to="/features" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                Features
              </Link>
              <Link to="/pricing" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                Pricing
              </Link>
              <Link to="/documentation-hub" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                Docs
              </Link>
              <Link to="/about-us" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                About
              </Link>
              <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                Contact
              </Link>
            </nav>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <button 
              onClick={() => navigate('/login')}
              className="px-4 py-2 text-muted-foreground hover:text-primary font-medium transition-colors"
            >
              Sign In
            </button>
            <button 
              onClick={() => navigate('/register')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary transition-colors font-medium"
            >
              <Icon name="Rocket" size={18} />
              Get Started Free
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-muted"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <Icon name={mobileMenuOpen ? "X" : "Menu"} size={24} />
          </button>
        </div>

        {/* Mobile Menu */}
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
                <button 
                  onClick={() => {
                    navigate('/login');
                    setMobileMenuOpen(false);
                  }}
                  className="px-4 py-2 border border-border text-muted-foreground rounded-lg hover:bg-muted font-medium"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => {
                    navigate('/register');
                    setMobileMenuOpen(false);
                  }}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary font-medium"
                >
                  <Icon name="Rocket" size={18} />
                  Get Started Free
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default PublicNavigation;