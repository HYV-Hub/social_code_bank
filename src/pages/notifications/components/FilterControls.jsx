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
    return notifications?.filter(n => !n?.isRead)?.length;
  };

  return (
    <div className="bg-white border-b border-gray-200 p-4">
      {/* Filter Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filter Notifications</h3>
        </div>
        
        {/* Unread Toggle */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showUnreadOnly}
            onChange={(e) => onToggleUnreadOnly(e?.target?.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">
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
                  ? 'bg-blue-600 text-white' :'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type?.label}
              {count > 0 && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  isActive ? 'bg-blue-500' : 'bg-gray-300'
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