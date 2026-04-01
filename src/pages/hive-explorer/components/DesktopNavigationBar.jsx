import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';


export default function DesktopNavigationBar({ 
  hiveId, 
  activeTab, 
  onTabChange, 
  canManageHive,
  snippetCount,
  memberCount,
  collectionCount,
  onQuickAction
}) {
  const navigate = useNavigate();
  const [showTooltip, setShowTooltip] = useState(null);

  const navigationItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: 'Home',
      description: 'View activity feed',
      shortcut: '1'
    },
    {
      id: 'snippets',
      label: 'Snippets',
      icon: 'Code',
      description: 'Browse code snippets',
      count: snippetCount,
      shortcut: '2'
    },
    {
      id: 'collections',
      label: 'Collections',
      icon: 'FolderOpen',
      description: 'View collections',
      count: collectionCount,
      shortcut: '3'
    },
    {
      id: 'members',
      label: 'Members',
      icon: 'Users',
      description: 'Manage members',
      count: memberCount,
      shortcut: '4'
    }
  ];

  if (canManageHive) {
    navigationItems?.push({
      id: 'settings',
      label: 'Settings',
      icon: 'Settings',
      description: 'Hive settings',
      shortcut: '5'
    });
  }

  const quickActions = [
    {
      id: 'create-snippet',
      label: 'New Snippet',
      icon: 'Plus',
      action: () => navigate(`/hive-snippet-editor?hive=${hiveId}`),
      primary: true
    },
    {
      id: 'search',
      label: 'Search',
      icon: 'Search',
      action: () => onQuickAction?.('search')
    },
    {
      id: 'notifications',
      label: 'Activity',
      icon: 'Bell',
      action: () => onQuickAction?.('notifications')
    }
  ];

  // Keyboard shortcuts handler
  React.useEffect(() => {
    const handleKeyPress = (e) => {
      // Only trigger if no input is focused
      if (e?.target?.tagName === 'INPUT' || e?.target?.tagName === 'TEXTAREA') return;

      const key = e?.key;
      const item = navigationItems?.find(item => item?.shortcut === key);
      if (item) {
        e?.preventDefault();
        onTabChange(item?.id);
      }

      // Quick actions
      if (e?.ctrlKey || e?.metaKey) {
        if (key === 'k') {
          e?.preventDefault();
          onQuickAction?.('search');
        }
        if (key === 'n') {
          e?.preventDefault();
          navigate(`/hive-snippet-editor?hive=${hiveId}`);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [navigationItems, hiveId, navigate, onTabChange, onQuickAction]);

  return (
    <div className="hidden lg:block fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur-lg shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Main Navigation */}
          <div className="flex items-center gap-2">
            {navigationItems?.map((item) => (
              <button
                key={item?.id}
                onClick={() => onTabChange(item?.id)}
                onMouseEnter={() => setShowTooltip(item?.id)}
                onMouseLeave={() => setShowTooltip(null)}
                className={`relative group flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  activeTab === item?.id
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Icon name={item?.icon} size={18} />
                <span>{item?.label}</span>
                
                {item?.count > 0 && (
                  <span className={`px-2 py-0.5 text-xs rounded-full font-semibold ${
                    activeTab === item?.id
                      ? 'bg-card/20 text-white' :'bg-purple-100 text-primary'
                  }`}>
                    {item?.count}
                  </span>
                )}

                {/* Keyboard shortcut badge */}
                <kbd className={`hidden xl:inline-flex items-center justify-center h-5 w-5 text-xs rounded border ${
                  activeTab === item?.id
                    ? 'border-white/20 text-white/70' :'border-border text-muted-foreground group-hover:border-muted-foreground'
                }`}>
                  {item?.shortcut}
                </kbd>

                {/* Tooltip */}
                {showTooltip === item?.id && (
                  <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 px-3 py-2 bg-card text-white text-xs rounded-lg shadow-xl whitespace-nowrap pointer-events-none">
                    {item?.description}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                      <div className="w-2 h-2 bg-card transform rotate-45"></div>
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="h-8 w-px bg-muted"></div>

          {/* Quick Actions */}
          <div className="flex items-center gap-3">
            {quickActions?.map((action) => (
              <button
                key={action?.id}
                onClick={action?.action}
                onMouseEnter={() => setShowTooltip(action?.id)}
                onMouseLeave={() => setShowTooltip(null)}
                className={`relative group flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all transform hover:scale-105 ${
                  action?.primary
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg hover:shadow-xl'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Icon name={action?.icon} size={18} />
                <span className="hidden xl:inline">{action?.label}</span>

                {/* Tooltip with keyboard shortcut */}
                {showTooltip === action?.id && (
                  <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 px-3 py-2 bg-card text-white text-xs rounded-lg shadow-xl whitespace-nowrap pointer-events-none">
                    <div className="flex items-center gap-2">
                      <span>{action?.label}</span>
                      {action?.id === 'create-snippet' && (
                        <kbd className="px-2 py-0.5 bg-card rounded border border-border">
                          ⌘N
                        </kbd>
                      )}
                      {action?.id === 'search' && (
                        <kbd className="px-2 py-0.5 bg-card rounded border border-border">
                          ⌘K
                        </kbd>
                      )}
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                      <div className="w-2 h-2 bg-card transform rotate-45"></div>
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Keyboard Shortcuts Info */}
          <button
            onClick={() => onQuickAction?.('shortcuts')}
            onMouseEnter={() => setShowTooltip('shortcuts')}
            onMouseLeave={() => setShowTooltip(null)}
            className="relative text-muted-foreground hover:text-muted-foreground transition-colors"
          >
            <Icon name="Keyboard" size={20} />
            
            {showTooltip === 'shortcuts' && (
              <div className="absolute bottom-full mb-2 right-0 px-4 py-3 bg-card text-white text-xs rounded-lg shadow-xl whitespace-nowrap pointer-events-none w-64">
                <div className="font-semibold mb-2">Keyboard Shortcuts</div>
                <div className="space-y-1 text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Navigate tabs</span>
                    <kbd className="px-2 py-0.5 bg-card rounded border border-border">1-5</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Search</span>
                    <kbd className="px-2 py-0.5 bg-card rounded border border-border">⌘K</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>New Snippet</span>
                    <kbd className="px-2 py-0.5 bg-card rounded border border-border">⌘N</kbd>
                  </div>
                </div>
                <div className="absolute top-full right-4 transform -mt-1">
                  <div className="w-2 h-2 bg-card transform rotate-45"></div>
                </div>
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}