import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/Image';
import Link from '../../../components/Link';

const RecentEngagement = ({ likes = [], saves = [] }) => {
  // CRITICAL FIX: Handle empty engagement data properly
  const hasLikes = likes?.length > 0;
  const hasSaves = saves?.length > 0;
  
  if (!hasLikes && !hasSaves) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Icon name="Users" size={20} className="text-purple-600" />
          Recent Engagement
        </h3>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Icon name="Users" size={24} className="text-gray-400" />
          </div>
          <p className="text-gray-600">No engagement yet</p>
          <p className="text-sm text-gray-500 mt-1">Be the first to like or save this snippet!</p>
        </div>
      </div>
    );
  }

  // Format timestamp for display
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Icon name="Users" size={20} className="text-purple-600" />
        Recent Engagement
      </h3>

      <div className="space-y-6">
        {/* Recent Likes Section */}
        {hasLikes && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Icon name="Heart" size={16} className="text-red-500" />
              <h4 className="text-sm font-semibold text-gray-700">Recent Likes</h4>
              <span className="text-xs text-gray-500">({likes?.length})</span>
            </div>
            <div className="space-y-2">
              {likes?.slice(0, 5)?.map((like) => (
                <Link 
                  key={like?.id}
                  to={`/user-profile/${like?.id}`}
                  className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors group"
                >
                  <Image
                    src={like?.avatar}
                    alt={like?.avatarAlt}
                    className="w-8 h-8 rounded-full object-cover border-2 border-gray-200 group-hover:border-red-400"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate group-hover:text-red-600">
                      {like?.name}
                    </p>
                    <p className="text-xs text-gray-500">@{like?.username}</p>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {formatTimestamp(like?.timestamp)}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recent Saves Section */}
        {hasSaves && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Icon name="Bookmark" size={16} className="text-purple-500" />
              <h4 className="text-sm font-semibold text-gray-700">Recent Saves</h4>
              <span className="text-xs text-gray-500">({saves?.length})</span>
            </div>
            <div className="space-y-2">
              {saves?.slice(0, 5)?.map((save) => (
                <Link 
                  key={save?.id}
                  to={`/user-profile/${save?.id}`}
                  className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors group"
                >
                  <Image
                    src={save?.avatar}
                    alt={save?.avatarAlt}
                    className="w-8 h-8 rounded-full object-cover border-2 border-gray-200 group-hover:border-purple-400"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate group-hover:text-purple-600">
                      {save?.name}
                    </p>
                    <p className="text-xs text-gray-500">@{save?.username}</p>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {formatTimestamp(save?.timestamp)}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentEngagement;