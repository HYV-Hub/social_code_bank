import React from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { useNavigate } from 'react-router-dom';

const UserCard = ({ user, type = 'follower' }) => {
  const navigate = useNavigate();

  const handleViewProfile = () => {
    navigate('/user-profile', { state: { userId: user?.id } });
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4 hover:border-accent/50 transition-all">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0 cursor-pointer" onClick={handleViewProfile}>
          <Image
            src={user?.avatar}
            alt={user?.avatarAlt}
            className="w-12 h-12 rounded-full object-cover"
          />
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-foreground hover:text-accent transition-colors cursor-pointer truncate" onClick={handleViewProfile}>
                {user?.name}
              </h4>
              <p className="text-sm text-muted-foreground truncate">@{user?.username}</p>
            </div>
            {user?.isVerified && (
              <Icon name="BadgeCheck" size={16} className="text-accent flex-shrink-0" />
            )}
          </div>

          {user?.bio && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{user?.bio}</p>
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
            <div className="flex items-center gap-1">
              <Icon name="Code" size={14} />
              <span>{user?.snippetsCount} snippets</span>
            </div>
            <div className="flex items-center gap-1">
              <Icon name="Users" size={14} />
              <span>{user?.followersCount} followers</span>
            </div>
          </div>

          {/* Action Button */}
          <Button
            variant={user?.isFollowing ? "outline" : "default"}
            size="sm"
            fullWidth
            iconName={user?.isFollowing ? "UserCheck" : "UserPlus"}
            iconPosition="left"
          >
            {user?.isFollowing ? "Following" : "Follow"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserCard;