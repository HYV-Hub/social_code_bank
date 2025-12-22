import React from 'react';
import Icon from '../../../components/AppIcon';
import { useNavigate } from 'react-router-dom';

export default function ActivityFeed({ activities = [], loading = false }) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3]?.map(i => (
          <div key={i} className="animate-pulse">
            <div className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!activities || activities?.length === 0) {
    return (
      <div className="text-center py-12">
        <Icon name="Activity" size={48} className="mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600">No recent activity</p>
      </div>
    );
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case 'snippet_added':
        return { name: 'Code', color: 'text-blue-600', bg: 'bg-blue-100' };
      case 'member_joined':
        return { name: 'UserPlus', color: 'text-green-600', bg: 'bg-green-100' };
      case 'comment_added':
        return { name: 'MessageCircle', color: 'text-purple-600', bg: 'bg-purple-100' };
      default:
        return { name: 'Activity', color: 'text-gray-600', bg: 'bg-gray-100' };
    }
  };

  const getActivityMessage = (activity) => {
    const username = activity?.user?.username || 'Someone';
    
    switch (activity?.type) {
      case 'snippet_added':
        return (
          <>
            <span className="font-medium text-gray-900">{username}</span>
            {' added a new snippet: '}
            <button
              onClick={() => navigate(`/snippet-details?id=${activity?.snippet?.id}`)}
              className="font-medium text-purple-600 hover:text-purple-700 hover:underline"
            >
              {activity?.snippet?.title}
            </button>
          </>
        );
      case 'member_joined':
        return (
          <>
            <span className="font-medium text-gray-900">{username}</span>
            {' joined the hive'}
          </>
        );
      case 'comment_added':
        return (
          <>
            <span className="font-medium text-gray-900">{username}</span>
            {' commented on '}
            <button
              onClick={() => navigate(`/snippet-details?id=${activity?.snippet?.id}`)}
              className="font-medium text-purple-600 hover:text-purple-700 hover:underline"
            >
              {activity?.snippet?.title}
            </button>
          </>
        );
      default:
        return 'Activity occurred';
    }
  };

  return (
    <div className="space-y-3">
      {activities?.map((activity) => {
        const iconConfig = getActivityIcon(activity?.type);
        
        return (
          <div
            key={activity?.id}
            className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow bg-white"
          >
            {/* Activity Icon */}
            <div className={`flex-shrink-0 w-10 h-10 rounded-full ${iconConfig?.bg} flex items-center justify-center`}>
              <Icon name={iconConfig?.name} size={20} className={iconConfig?.color} />
            </div>
            {/* Activity Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-700">
                {getActivityMessage(activity)}
              </p>
              <p className="text-xs text-gray-500 mt-1">{activity?.timeAgo}</p>
            </div>
            {/* User Avatar */}
            {activity?.user?.avatar_url ? (
              <img
                src={activity?.user?.avatar_url}
                alt={activity?.user?.username}
                className="w-8 h-8 rounded-full flex-shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                <Icon name="User" size={16} className="text-gray-500" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}