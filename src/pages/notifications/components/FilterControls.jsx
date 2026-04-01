import React from 'react';
import { Filter } from 'lucide-react';

const notificationTypes = [
  { value: 'all', label: 'All Notifications', count: 0 },
  { value: 'comment', label: 'Comments', count: 0 },
  { value: 'like', label: 'Likes', count: 0 },
  { value: 'follow', label: 'Follows', count: 0 },
  { value: 'mention', label: 'Mentions', count: 0 },
  { value: 'bug_assignment', label: 'Bug Assignments', count: 0 },
  { value: 'team_update', label: 'Team Updates', count: 0 }
];

export function FilterControls({ activeFilter, onFilterChange, notifications, showUnreadOnly, onToggleUnreadOnly }) {
  // Calculate counts for each type
  const getTypeCount = (type) => {
    if (type === 'all') {
      return notifications?.length;
    }
    return notifications?.filter(n => n?.type === type)?.length;
  };

  const getUnreadCount = () => {
    return notifications?.filter(n => !n?.is_read && !n?.isRead)?.length;
  };

  return (
    <div className="bg-card border-b border-border p-4">
      {/* Filter Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-foreground">Filter Notifications</h3>
        </div>
        
        {/* Unread Toggle */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showUnreadOnly}
            onChange={(e) => onToggleUnreadOnly(e?.target?.checked)}
            className="w-4 h-4 text-primary border-border rounded focus:ring-ring"
          />
          <span className="text-sm text-foreground">
            Unread only ({getUnreadCount()})
          </span>
        </label>
      </div>
      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        {notificationTypes?.map((type) => {
          const count = getTypeCount(type?.value);
          const isActive = activeFilter === type?.value;
          
          return (
            <button
              key={type?.value}
              onClick={() => onFilterChange(type?.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-white' :'bg-muted text-foreground hover:bg-muted'
              }`}
            >
              {type?.label}
              {count > 0 && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  isActive ? 'bg-primary' : 'bg-muted'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}