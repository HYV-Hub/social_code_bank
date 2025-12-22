import React from 'react';
import Icon from '../../../components/AppIcon';

export default function HiveNavigationSidebar({ 
  activeTab, 
  onTabChange, 
  snippetsCount, 
  collectionsCount, 
  membersCount, 
  joinRequestsCount, 
  userRole,
  onClose 
}) {
  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: 'Home' },
    { id: 'snippets', label: 'Snippets', icon: 'Code', count: snippetsCount },
    { id: 'collections', label: 'Collections', icon: 'FolderOpen', count: collectionsCount },
    { id: 'members', label: 'Members', icon: 'Users', count: membersCount },
    { id: 'activity', label: 'Activity', icon: 'Activity' },
  ];

  // Add admin/owner only sections
  if (userRole === 'owner' || userRole === 'admin') {
    navigationItems?.push(
      { 
        id: 'requests', 
        label: 'Join Requests', 
        icon: 'UserPlus', 
        count: joinRequestsCount, 
        highlight: joinRequestsCount > 0 
      },
      { 
        id: 'settings', 
        label: 'Hive Settings', 
        icon: 'Settings' 
      }
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 h-full overflow-y-auto">
      {/* Mobile header */}
      <div className="flex items-center justify-between lg:hidden mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Navigation</h3>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Icon name="X" size={20} />
        </button>
      </div>

      <h3 className="hidden lg:block text-sm font-semibold text-gray-900 mb-3">Navigation</h3>
      <div className="space-y-1">
        {navigationItems?.map((tab) => (
          <button
            key={tab?.id}
            onClick={() => {
              onTabChange(tab?.id);
              onClose?.();
            }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${
              activeTab === tab?.id
                ? 'bg-purple-50 text-purple-700 font-medium shadow-sm'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <Icon name={tab?.icon} size={18} />
              <span>{tab?.label}</span>
            </div>
            {tab?.count !== undefined && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                tab?.highlight 
                  ? 'bg-red-100 text-red-700 animate-pulse' :'bg-gray-100 text-gray-600'
              }`}>
                {tab?.count}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}