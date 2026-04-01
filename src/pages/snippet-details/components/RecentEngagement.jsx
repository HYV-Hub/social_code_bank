import React from 'react';
import Icon from '../../../components/AppIcon';
import { formatTimeAgo } from '../../../utils/formatTime';
import Image from '../../../components/Image';
import Link from '../../../components/Link';

const RecentEngagement = ({ likes = [], saves = [] }) => {
  // CRITICAL FIX: Handle empty engagement data properly
  const hasLikes = likes?.length > 0;
  const hasSaves = saves?.length > 0;
  
  if (!hasLikes && !hasSaves) {
    return (
      <div className="hyv-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Icon name="Users" size={20} className="text-primary" />
          Recent Engagement
        </h3>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
            <Icon name="Users" size={24} className="text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">No engagement yet</p>
          <p className="text-sm text-muted-foreground mt-1">Be the first to like or save this snippet!</p>
        </div>
      </div>
    );
  }

  const formatTimestamp = formatTimeAgo;

  return (
    <div className="hyv-card p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <Icon name="Users" size={20} className="text-primary" />
        Recent Engagement
      </h3>

      <div className="space-y-6">
        {/* Recent Likes Section */}
        {hasLikes && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Icon name="Heart" size={16} className="text-error" />
              <h4 className="text-sm font-semibold text-foreground">Recent Likes</h4>
              <span className="text-xs text-muted-foreground">({likes?.length})</span>
            </div>
            <div className="space-y-2">
              {likes?.slice(0, 5)?.map((like) => (
                <Link 
                  key={like?.id}
                  to={`/user-profile/${like?.id}`}
                  className="flex items-center gap-3 p-2 hover:bg-background rounded-lg transition-colors group"
                >
                  <Image
                    src={like?.avatar}
                    alt={like?.avatarAlt}
                    className="w-8 h-8 rounded-full object-cover border-2 border-border group-hover:border-error"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate group-hover:text-error">
                      {like?.name}
                    </p>
                    <p className="text-xs text-muted-foreground">@{like?.username}</p>
                  </div>
                  <span className="text-xs text-muted-foreground flex-shrink-0">
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
              <Icon name="Bookmark" size={16} className="text-primary" />
              <h4 className="text-sm font-semibold text-foreground">Recent Saves</h4>
              <span className="text-xs text-muted-foreground">({saves?.length})</span>
            </div>
            <div className="space-y-2">
              {saves?.slice(0, 5)?.map((save) => (
                <Link 
                  key={save?.id}
                  to={`/user-profile/${save?.id}`}
                  className="flex items-center gap-3 p-2 hover:bg-background rounded-lg transition-colors group"
                >
                  <Image
                    src={save?.avatar}
                    alt={save?.avatarAlt}
                    className="w-8 h-8 rounded-full object-cover border-2 border-border group-hover:border-primary"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate group-hover:text-primary">
                      {save?.name}
                    </p>
                    <p className="text-xs text-muted-foreground">@{save?.username}</p>
                  </div>
                  <span className="text-xs text-muted-foreground flex-shrink-0">
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