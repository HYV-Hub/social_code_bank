import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const TeamResultCard = ({ team, searchQuery }) => {
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
        <div className="flex-shrink-0">
          <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon name="Users" size={32} className="text-primary" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div>
              <h3
                onClick={() => navigate('/team-chat')}
                className="text-lg font-semibold text-foreground hover:text-primary transition-colors cursor-pointer"
              >
                {highlightText(team?.name)}
              </h3>
              <p className="text-sm text-muted-foreground">{team?.company}</p>
            </div>
            <Button
              variant={team?.isMember ? 'outline' : 'default'}
              size="sm"
              iconName={team?.isMember ? 'Check' : 'UserPlus'}
              iconPosition="left"
              disabled={team?.isPrivate && !team?.isMember}
            >
              {team?.isMember ? 'Member' : team?.isPrivate ? 'Private' : 'Join'}
            </Button>
          </div>

          {team?.description && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {highlightText(team?.description)}
            </p>
          )}

          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
            <span className="flex items-center gap-1">
              <Icon name={team?.isPrivate ? 'Lock' : 'Globe'} size={14} />
              {team?.isPrivate ? 'Private' : 'Public'}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Icon name="Users" size={14} />
              {team?.memberCount} members
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Icon name="Code2" size={14} />
              {team?.snippetCount} snippets
            </span>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <div className="flex -space-x-2">
              {team?.members?.slice(0, 5)?.map((member, index) => (
                <Image
                  key={index}
                  src={member?.avatar}
                  alt={member?.avatarAlt}
                  className="w-8 h-8 rounded-full border-2 border-card"
                />
              ))}
              {team?.memberCount > 5 && (
                <div className="w-8 h-8 rounded-full bg-muted border-2 border-card flex items-center justify-center">
                  <span className="text-xs font-medium text-muted-foreground">
                    +{team?.memberCount - 5}
                  </span>
                </div>
              )}
            </div>
            {team?.teamLead && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground ml-2">
                <Icon name="Crown" size={14} className="text-warning" />
                <span>Led by {team?.teamLead}</span>
              </div>
            )}
          </div>

          {team?.technologies && team?.technologies?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {team?.technologies?.map((tech, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-muted rounded text-xs text-muted-foreground"
                >
                  {tech}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamResultCard;