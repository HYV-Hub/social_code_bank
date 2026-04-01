import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Icon from './AppIcon';
import { notificationService } from '../services/notificationService';

const NAV_ITEMS = [
  { section: 'MAIN', items: [
    { name: 'My Library', icon: 'Library', path: '/user-dashboard' },
    { name: 'Explore', icon: 'Compass', path: '/global-explore-feed' },
    { name: 'Hives', icon: 'Hexagon', path: '/hives' },
    { name: 'Collections', icon: 'FolderOpen', path: '/snippet-collections' },
  ]},
  { section: 'CREATE', items: [
    { name: 'New Snippet', icon: 'Plus', path: '/create-snippet', accent: true },
  ]},
  { section: 'AI TOOLS', items: [
    { name: 'AI Reports', icon: 'Sparkles', path: '/ai-optimization-report' },
    { name: 'Style Match', icon: 'Palette', path: '/ai-style-match-page' },
  ]},
  { section: 'ACCOUNT', items: [
    { name: 'Notifications', icon: 'Bell', path: '/notifications', badge: true },
    { name: 'Settings', icon: 'Settings', path: '/settings' },
  ]},
];

const COMPANY_NAV_ITEMS = [
  { section: 'COMPANY', items: [
    { name: 'Company Home', icon: 'Building', path: '/company-dashboard' },
    { name: 'Company Feed', icon: 'Rss', path: '/company-feed' },
    { name: 'Company Teams', icon: 'Users', path: '/company-teams-page' },
    { name: 'Company Bugs', icon: 'Bug', path: '/bug-board', queryKey: 'company' },
    { name: 'Management', icon: 'Settings', path: '/company-management-dashboard' },
  ]},
  { section: 'NAVIGATE', items: [
    { name: 'Back to Personal', icon: 'ArrowLeft', path: '/user-dashboard' },
  ]},
];

export default function AppShell({ children, rightSidebar = null, pageTitle = '' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user, userProfile, signOut } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  // Notification state
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationChannel, setNotificationChannel] = useState(null);

  // Company state
  const [userCompany, setUserCompany] = useState(null);

  // Detect if on a company page
  const isOnCompanyPage = location?.pathname?.startsWith('/company-dashboard') ||
    location?.pathname === '/company-management-dashboard' ||
    location?.pathname === '/member-management-center' ||
    location?.pathname === '/company-feed' ||
    location?.pathname === '/company-teams-page' ||
    location?.pathname === '/team-dashboard' ||
    location?.pathname === '/team-chat' ||
    (location?.pathname === '/bug-board' && searchParams?.get('company')) ||
    (location?.pathname === '/snippet-details' && searchParams?.get('company'));

  const activeNavItems = (isOnCompanyPage && userCompany) ? COMPANY_NAV_ITEMS : NAV_ITEMS;

  const isActive = (path) => {
    if (path?.includes('?')) {
      const [pathname] = path.split('?');
      return location.pathname === pathname;
    }
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // Fetch company details
  useEffect(() => {
    const fetchCompany = async () => {
      if (!userProfile?.company_id) {
        setUserCompany(null);
        return;
      }
      try {
        const { supabase } = await import('../lib/supabase');
        const { data: company } = await supabase
          ?.from('companies')
          ?.select('*')
          ?.eq('id', userProfile.company_id)
          ?.maybeSingle();
        if (company?.id === userProfile.company_id) {
          setUserCompany(company);
        }
      } catch (err) {
        console.error('Company fetch error:', err);
      }
    };
    if (user?.id) fetchCompany();
  }, [userProfile?.company_id, user?.id]);

  // Notification subscription
  useEffect(() => {
    if (!user) { setUnreadCount(0); return; }

    const fetchCount = async () => {
      try {
        if (typeof notificationService?.getUnreadCount === 'function') {
          const count = await notificationService.getUnreadCount();
          setUnreadCount(count);
        }
      } catch (err) { setUnreadCount(0); }
    };

    const setupSub = () => {
      if (!user?.id || typeof notificationService?.subscribeToNotifications !== 'function') return;
      try {
        const channel = notificationService.subscribeToNotifications(user.id, () => fetchCount());
        setNotificationChannel(channel);
      } catch (err) { /* silent */ }
    };

    fetchCount();
    setupSub();

    return () => {
      if (notificationChannel && typeof notificationService?.unsubscribeFromNotifications === 'function') {
        try { notificationService.unsubscribeFromNotifications(notificationChannel); } catch (e) { /* silent */ }
      }
    };
  }, [user]);

  // "/" keyboard shortcut for search
  useEffect(() => {
    const handleSlash = (e) => {
      if (e.key === '/' && !e.ctrlKey && !e.metaKey && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
        e.preventDefault();
        const input = document.querySelector('.hyv-search input');
        if (input) input.focus();
      }
    };
    document.addEventListener('keydown', handleSlash);
    return () => document.removeEventListener('keydown', handleSlash);
  }, []);

  // Close user menu on click outside
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Escape key
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') { setUserMenuOpen(false); setMobileMenuOpen(false); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // Lock body scroll on mobile menu
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [mobileMenuOpen]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  // Sidebar nav renderer (shared between desktop and mobile)
  const renderNav = (collapsed = false) => (
    <nav className="flex-1 overflow-y-auto py-3 px-2">
      {activeNavItems.map((group) => (
        <div key={group.section} className="mb-4">
          {!collapsed && (
            <p className="px-2 mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">{group.section}</p>
          )}
          {group.items.map((item) => (
            <button
              key={item.path}
              onClick={() => { navigate(item.path); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-all duration-100 mb-0.5 ${
                isActive(item.path)
                  ? 'bg-primary/15 text-primary'
                  : item.accent
                    ? 'text-accent hover:bg-accent/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
              } ${collapsed ? 'justify-center' : ''}`}
              title={collapsed ? item.name : undefined}
            >
              <Icon name={item.icon} size={18} className={isActive(item.path) ? 'text-primary' : ''} />
              {!collapsed && <span>{item.name}</span>}
              {item.badge && !collapsed && unreadCount > 0 && (
                <span className="ml-auto px-1.5 py-0.5 text-[10px] font-bold bg-error text-white rounded-full min-w-[18px] text-center">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* ─── LEFT SIDEBAR (Desktop) ─── */}
      <aside className={`hidden lg:flex flex-col border-r border-border bg-[#0b0a14] transition-all duration-200 ${sidebarCollapsed ? '-translate-x-full w-56' : 'translate-x-0 w-56'} fixed top-0 left-0 h-full z-30`}>
        {/* Logo */}
        <div className={`flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'px-4'} h-14 border-b border-border`}>
          <button onClick={() => navigate('/user-dashboard')} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img src="/assets/images/F4A2CCAB-658E-44EE-BE03-CDB69CA24EEB-1764073212026.png" alt="HYVHub" className="h-7 w-7 object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
            {!sidebarCollapsed && <span className="text-base font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">HYVHub</span>}
          </button>
        </div>

        {renderNav(false)}

        {/* Bottom: User + Collapse */}
        <div className="border-t border-border p-2">
          {!sidebarCollapsed && user && (
            <div ref={userMenuRef} className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-white/5 transition-colors mb-1"
              >
                <img
                  src={userProfile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile?.full_name || 'U')}&background=8b5cf6&color=fff&size=32`}
                  alt=""
                  className="w-7 h-7 rounded-full object-cover"
                />
                <div className="text-left flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{userProfile?.full_name || 'User'}</p>
                  <p className="text-[10px] text-muted-foreground truncate">@{userProfile?.username || 'user'}</p>
                </div>
                <Icon name="ChevronDown" size={14} className="text-muted-foreground" />
              </button>

              {/* User dropdown menu */}
              {userMenuOpen && (
                <div className="absolute bottom-full left-0 mb-1 w-full bg-card border border-border rounded-lg shadow-xl py-1 z-50">
                  <button onClick={() => { navigate(`/user-profile/${user.id}`); setUserMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors">
                    <Icon name="User" size={14} /> Profile
                  </button>
                  <button onClick={() => { navigate('/profile-editor'); setUserMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors">
                    <Icon name="Edit" size={14} /> Edit Profile
                  </button>
                  {userCompany && (
                    <button onClick={() => { navigate('/company-dashboard'); setUserMenuOpen(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors">
                      <Icon name="Building" size={14} /> {userCompany.name}
                    </button>
                  )}
                  {!userCompany && (
                    <button onClick={() => { navigate('/company-creation'); setUserMenuOpen(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors">
                      <Icon name="Plus" size={14} /> Create / Join Company
                    </button>
                  )}
                  <div className="border-t border-border my-1" />
                  <button onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-error hover:bg-error/10 transition-colors">
                    <Icon name="LogOut" size={14} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(true)}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors text-xs"
          >
            <Icon name="PanelLeftClose" size={14} />
            {!sidebarCollapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* ─── MOBILE HEADER ─── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[#0b0a14]/90 backdrop-blur-lg border-b border-border h-12 flex items-center justify-between px-4">
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-muted-foreground hover:text-foreground transition-colors">
          <Icon name={mobileMenuOpen ? 'X' : 'Menu'} size={20} />
        </button>
        <button onClick={() => navigate('/user-dashboard')} className="text-sm font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          HYVHub
        </button>
        <button onClick={() => navigate('/notifications')} className="text-muted-foreground hover:text-foreground transition-colors relative">
          <Icon name="Bell" size={20} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-error text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileMenuOpen(false)} />
          <aside className="relative w-64 h-full bg-[#0b0a14] border-r border-border overflow-y-auto flex flex-col">
            <div className="p-4 border-b border-border">
              <span className="text-base font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">HYVHub</span>
            </div>
            {renderNav(false)}
            {user && (
              <div className="border-t border-border p-3">
                <button
                  onClick={() => { navigate(`/user-profile/${user.id}`); setMobileMenuOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <img
                    src={userProfile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile?.full_name || 'U')}&background=8b5cf6&color=fff&size=32`}
                    alt=""
                    className="w-7 h-7 rounded-full object-cover"
                  />
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{userProfile?.full_name || 'User'}</p>
                  </div>
                </button>
                <button onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-2.5 py-2 mt-1 rounded-lg text-sm text-error hover:bg-error/10 transition-colors">
                  <Icon name="LogOut" size={16} /> Sign Out
                </button>
              </div>
            )}
          </aside>
        </div>
      )}

      {/* ─── MAIN CONTENT AREA ─── */}
      <main className={`flex-1 ${sidebarCollapsed ? 'lg:ml-0' : 'lg:ml-56'} transition-all duration-200 mt-12 lg:mt-0`}>
        {/* Top Bar */}
        <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-lg border-b border-border px-4 lg:px-6 h-14 flex items-center gap-4">
          {/* Sidebar toggle for desktop */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
            title={sidebarCollapsed ? 'Show sidebar' : 'Hide sidebar'}
          >
            <Icon name={sidebarCollapsed ? 'PanelLeftOpen' : 'PanelLeftClose'} size={18} />
          </button>
          {pageTitle && <h1 className="text-sm font-semibold text-foreground hidden lg:block whitespace-nowrap">{pageTitle}</h1>}

          {/* Global Search */}
          <div className="flex-1 max-w-xl" role="search">
            <div className="hyv-search w-full flex items-center gap-2 bg-muted border border-border rounded-lg px-3 py-2">
              <Icon name="Search" size={16} className="text-muted-foreground flex-shrink-0" />
              <input
                type="text"
                placeholder="Search snippets, tags, hives..."
                className="flex-1 bg-transparent text-sm text-foreground placeholder-muted-foreground focus:outline-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.target.value.trim()) {
                    navigate(`/search-results?q=${encodeURIComponent(e.target.value.trim())}`);
                    e.target.value = '';
                  }
                }}
              />
              <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono bg-background text-muted-foreground border border-border">/</kbd>
            </div>
          </div>

          {/* Quick actions */}
          <button
            onClick={() => navigate('/create-snippet')}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors"
          >
            <Icon name="Plus" size={14} />
            New
          </button>

          {/* Notification bell (desktop) */}
          <button
            onClick={() => navigate('/notifications')}
            className="hidden lg:flex relative text-muted-foreground hover:text-foreground transition-colors"
          >
            <Icon name="Bell" size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-error text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Page content with optional right sidebar */}
        <div className="flex">
          <div className="flex-1 min-w-0">
            {children}
          </div>
          {rightSidebar && (
            <aside className="hidden xl:block w-72 flex-shrink-0 border-l border-border p-4 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto">
              {rightSidebar}
            </aside>
          )}
        </div>
      </main>
    </div>
  );
}
