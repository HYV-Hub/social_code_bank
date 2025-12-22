import React, { useState } from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ProfileHeader = ({ user, isOwnProfile, onFollow, onMessage, onEdit }) => {
  const [isFollowing, setIsFollowing] = useState(user?.isFollowing);

  const handleFollowClick = () => {
    setIsFollowing(!isFollowing);
    onFollow(!isFollowing);
  };

  return (
    <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
      {/* Cover Image */}
      <div className="h-48 bg-gradient-to-r from-primary to-accent relative">
        <div className="absolute inset-0 bg-black/10"></div>
      </div>
      {/* Profile Content */}
      <div className="px-6 pb-6">
        {/* Avatar and Actions */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-16 mb-4">
          <div className="flex items-end space-x-4 mb-4 sm:mb-0">
            <div className="relative">
              <Image
                src={user?.avatar}
                alt={user?.avatarAlt}
                className="w-32 h-32 rounded-full border-4 border-card object-cover"
              />
              {user?.isVerified && (
                <div className="absolute bottom-2 right-2 bg-success rounded-full p-1">
                  <Icon name="Check" size={16} color="white" />
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            {isOwnProfile ? (
              <Button variant="outline" iconName="Settings" iconPosition="left" onClick={onEdit}>
                Edit Profile
              </Button>
            ) : (
              <>
                <Button
                  variant={isFollowing ? "outline" : "default"}
                  iconName={isFollowing ? "UserCheck" : "UserPlus"}
                  iconPosition="left"
                  onClick={handleFollowClick}
                >
                  {isFollowing ? "Following" : "Follow"}
                </Button>
                <Button variant="outline" iconName="MessageCircle" iconPosition="left" onClick={onMessage}>
                  Message
                </Button>
                <Button variant="ghost" size="icon">
                  <Icon name="MoreVertical" size={20} />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* User Info */}
        <div className="space-y-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-semibold text-foreground">{user?.name}</h1>
              {user?.role && (
                <span className="px-2 py-1 bg-accent/10 text-accent text-xs font-medium rounded">
                  {user?.role}
                </span>
              )}
            </div>
            <p className="text-muted-foreground">@{user?.username}</p>
          </div>

          {user?.bio && (
            <p className="text-foreground leading-relaxed max-w-3xl">{user?.bio}</p>
          )}

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {user?.company && (
              <div className="flex items-center gap-1">
                <Icon name="Building2" size={16} />
                <span>{user?.company}</span>
              </div>
            )}
            {user?.location && (
              <div className="flex items-center gap-1">
                <Icon name="MapPin" size={16} />
                <span>{user?.location}</span>
              </div>
            )}
            {user?.website && (
              <a href={user?.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-accent transition-colors">
                <Icon name="Link" size={16} />
                <span>{user?.website}</span>
              </a>
            )}
            <div className="flex items-center gap-1">
              <Icon name="Calendar" size={16} />
              <span>Joined {user?.joinedDate}</span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-6 pt-3 border-t border-border">
            <button className="hover:text-accent transition-colors">
              <span className="font-semibold text-foreground">{user?.snippetsCount}</span>
              <span className="text-muted-foreground ml-1">Snippets</span>
            </button>
            <button className="hover:text-accent transition-colors">
              <span className="font-semibold text-foreground">{user?.followersCount}</span>
              <span className="text-muted-foreground ml-1">Followers</span>
            </button>
            <button className="hover:text-accent transition-colors">
              <span className="font-semibold text-foreground">{user?.followingCount}</span>
              <span className="text-muted-foreground ml-1">Following</span>
            </button>
            <div>
              <span className="font-semibold text-foreground">{user?.contributionScore}</span>
              <span className="text-muted-foreground ml-1">Contribution Score</span>
            </div>
          </div>

          {/* Skills/Tags */}
          {user?.skills && user?.skills?.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-3">
              {user?.skills?.map((skill, index) => (
                <span key={index} className="px-3 py-1 bg-muted text-muted-foreground text-sm rounded-full">
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;