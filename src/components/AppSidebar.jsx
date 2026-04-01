import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from './AppIcon';
import { useAuth } from '../contexts/AuthContext';

const navItems = [
  { icon: 'LayoutDashboard', label: 'Dashboard', path: '/user-dashboard' },
  { icon: 'Compass', label: 'Explore', path: '/search-results' },
  { icon: 'Code', label: 'Snippets', path: '/snippet-collections' },
  { icon: 'Hexagon', label: 'Hives', path: '/teams-landing-page' },
  { icon: 'Bug', label: 'Bugs', path: '/bug-board' },
  { icon: 'MessageSquare', label: 'Chat', path: '/team-chat' },
];

const bottomItems = [
  { icon: 'Settings', label: 'Settings', path: '/settings' },
];

const AppSidebar = () => {
  const [expanded, setExpanded] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const isActive = (path) => {
    if (path === '/user-dashboard' && location.pathname === '/user-dashboard') return true;
    if (path !== '/user-dashboard' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <aside
      className={`fixed left-0 top-14 bottom-0 z-40 bg-card/95 backdrop-blur-lg border-r border-border/50 transition-all duration-200 overflow-hidden hidden md:flex flex-col ${
        expanded ? 'w-56' : 'w-14'
      }`}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      {/* Main nav items */}
      <nav className="flex-1 flex flex-col gap-1 px-2 py-3">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-3 px-2.5 py-2.5 rounded-lg transition-all duration-150 group relative ${
                active
                  ? 'bg-primary/15 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
              title={!expanded ? item.label : undefined}
            >
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r" />
              )}
              <Icon name={item.icon} size={18} className="flex-shrink-0" />
              {expanded && (
                <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom items */}
      <div className="border-t border-border/50 px-2 py-3">
        {bottomItems.map((item) => {
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-3 px-2.5 py-2.5 rounded-lg transition-all duration-150 w-full ${
                active
                  ? 'bg-primary/15 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
              title={!expanded ? item.label : undefined}
            >
              <Icon name={item.icon} size={18} className="flex-shrink-0" />
              {expanded && (
                <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
              )}
            </button>
          );
        })}
      </div>
    </aside>
  );
};

export default AppSidebar;
