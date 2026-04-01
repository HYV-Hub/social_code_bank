import React from 'react';
import AppNavigation from './AppNavigation';
import { useAuth } from '../contexts/AuthContext';

const PageShell = ({ children, sidebar, fullWidth = false, noPadding = false, className = '' }) => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <AppNavigation />
      <div className={`pt-14 ${className}`}>
        {sidebar ? (
          <div className="flex">
            <aside className="hidden lg:block w-56 flex-shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto border-r border-border bg-card">
              {sidebar}
            </aside>
            <main className="flex-1 min-w-0">
              {noPadding ? children : (
                <div className={`${fullWidth ? '' : 'max-w-7xl mx-auto'} px-4 sm:px-6 lg:px-8 py-6`}>
                  {children}
                </div>
              )}
            </main>
          </div>
        ) : (
          <main className="flex-1">
            {noPadding ? children : (
              <div className={`${fullWidth ? '' : 'max-w-7xl mx-auto'} px-4 sm:px-6 lg:px-8 py-6`}>
                {children}
              </div>
            )}
          </main>
        )}
      </div>
    </div>
  );
};

export default PageShell;
