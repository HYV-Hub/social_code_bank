import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';

const Footer = () => {
  const currentYear = new Date()?.getFullYear();

  const footerLinks = {
    product: [
      { name: 'Documentation', path: '/documentation-hub' },
      { name: 'Help Center', path: '/help-center' },
      { name: 'Enterprise', path: '/enterprise-signup' },
    ],
    company: [
      { name: 'About Us', path: '/about-us' },
      { name: 'Contact', path: '/contact' },
      { name: 'Blog', path: '/blog' },
    ],
    legal: [
      { name: 'Privacy Policy', path: '/privacy-policy' },
      { name: 'Terms of Service', path: '/terms-of-service' },
      { name: 'Cookie Policy', path: '/cookie-policy' },
    ],
    support: [
      { name: 'Help Center', path: '/help-center' },
      { name: 'Community', path: '/community' },
      { name: 'Contact Support', path: '/contact' },
    ],
  };

  return (
    <footer className="bg-slate-900 text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Logo Section */}
        <div className="mb-8">
          <img 
            src="public/assets/images/F4A2CCAB-658E-44EE-BE03-CDB69CA24EEB-1764073212026.png"
            alt="HyvHub logo featuring hexagonal design with blue/teal circuit board patterns and bee character"
            className="h-12 w-auto object-contain"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company */}
          <div>
            <h3 className="font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about-us" className="text-blue-200 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-blue-200 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold text-white mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/documentation-hub" className="text-blue-200 hover:text-white transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link to="/help-center" className="text-blue-200 hover:text-white transition-colors">
                  Help Center
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/terms-of-service" className="text-blue-200 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="text-blue-200 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="font-semibold text-white mb-4">Connect</h3>
            <ul className="space-y-2">
              <li>
                <a href="https://github.com/hyvhub" target="_blank" rel="noopener noreferrer" 
                   className="text-blue-200 hover:text-white transition-colors flex items-center gap-2">
                  <Icon name="Github" size={16} />
                  GitHub
                </a>
              </li>
              <li>
                <a href="https://twitter.com/hyvhub" target="_blank" rel="noopener noreferrer"
                   className="text-blue-200 hover:text-white transition-colors flex items-center gap-2">
                  <Icon name="Twitter" size={16} />
                  Twitter
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-blue-700 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-blue-200 text-sm">
            © {currentYear} HyvHub Ltd. All rights reserved. | GDPR Compliant | UK & Ireland
          </p>
          <div className="flex items-center gap-6 text-sm text-blue-200">
            <Link to="/terms-of-service" className="hover:text-white transition-colors">
              Terms
            </Link>
            <Link to="/privacy-policy" className="hover:text-white transition-colors">
              Privacy
            </Link>
            <Link to="/help-center" className="hover:text-white transition-colors">
              Help
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;