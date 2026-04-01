import React from 'react';
import AppNavigation from './AppNavigation';
import AppSidebar from './AppSidebar';
import { useAuth } from '../contexts/AuthContext';

const PageShell = ({ children, fullWidth = false, noPadding = false, className = '' }) => {
  const { user } = useAuth();
  const hasSidebar = !!user;

  return (
    <div className="min-h-screen bg-background">
      <AppNavigation />
      {hasSidebar && <AppSidebar />}
      <main
        className={`pt-14 ${hasSidebar ? 'md:pl-14' : ''} ${className}`}
      >
        {noPadding ? (
          children
        ) : (
          <div className={`${fullWidth ? '' : 'max-w-7xl mx-auto'} px-4 sm:px-6 lg:px-8 py-6`}>
            {children}
          </div>
        )}
      </main>
    </div>
  );
};

export default PageShell;
