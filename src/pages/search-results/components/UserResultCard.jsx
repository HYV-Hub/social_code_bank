import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const UserResultCard = ({ user, searchQuery }) => {
  const navigate = useNavigate();

  const highlightText = (text) => {
    if (!searchQuery) return text;
    const parts = text?.split(new RegExp(`(${searchQuery})`, 'gi'));
    return parts?.map((part, i) =>
      part?.toLowerCase() === searchQuery?.toLowerCase() ? (
        <mark key={i} className="bg-accent/30 text-foreground font-medium">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-all">
      <div className="flex items-start gap-4">
        <div
          onClick={() => navigate(`/user-profile/${user?.id}`)}
          className="flex-shrink-0 cursor-pointer"
        >
          <Image
            src={user?.avatar}
            alt={user?.avatarAlt}
            className="w-16 h-16 rounded-full"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div>
              <h3
                onClick={() => navigate(`/user-profile/${user?.id}`)}
                className="text-lg font-semibold text-foreground hover:text-primary transition-colors cursor-pointer"
              >
                {highlightText(user?.name)}
              </h3>
              <p className="text-sm text-muted-foreground">@{user?.username}</p>
            </div>
            <Button
              variant={user?.isFollowing ? 'outline' : 'default'}
              size="sm"
              iconName={user?.isFollowing ? 'UserMinus' : 'UserPlus'}
              iconPosition="left"
            >
              {user?.isFollowing ? 'Following' : 'Follow'}
            </Button>
          </div>

          {user?.bio && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {highlightText(user?.bio)}
            </p>
          )}

          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
            {user?.role && (
              <>
                <span className="flex items-center gap-1">
                  <Icon name="Briefcase" size={14} />
                  {user?.role}
                </span>
                <span>•</span>
              </>
            )}
            {user?.company && (
              <>
                <span className="flex items-center gap-1">
                  <Icon name="Building2" size={14} />
                  {user?.company}
                </span>
                <span>•</span>
              </>
            )}
            <span className="flex items-center gap-1">
              <Icon name="MapPin" size={14} />
              {user?.location}
            </span>
          </div>

          <div className="flex items-center gap-4 text-sm mb-3">
            <span className="text-foreground font-medium">
              {user?.snippets} <span className="text-muted-foreground font-normal">snippets</span>
            </span>
            <span className="text-foreground font-medium">
              {user?.followers} <span className="text-muted-foreground font-normal">followers</span>
            </span>
            <span className="text-foreground font-medium">
              {user?.following} <span className="text-muted-foreground font-normal">following</span>
            </span>
          </div>

          {user?.skills && user?.skills?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {user?.skills?.map((skill, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium"
                >
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

export default UserResultCard;