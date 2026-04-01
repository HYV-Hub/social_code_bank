import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const BugCard = ({ bug, onDragStart, onViewDetails, onAssign, onPriorityChange }) => {
  const priorityColors = {
    critical: 'bg-error/15 text-error border-error/30',
    high: 'bg-warning/15 text-warning border-warning/30',
    medium: 'bg-warning/15 text-warning border-warning/30',
    low: 'bg-primary/15 text-foreground border-primary/30'
  };

  const priorityIcons = {
    critical: 'AlertCircle',
    high: 'ArrowUp',
    medium: 'Minus',
    low: 'ArrowDown'
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, bug)}
      className="bg-card rounded-lg border border-border p-4 mb-3 cursor-move hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-3">
        <h4 className="text-sm font-semibold text-foreground flex-1 pr-2 line-clamp-2">
          {bug?.title}
        </h4>
        <span className={`px-2 py-1 rounded text-xs font-medium border ${priorityColors?.[bug?.priority]}`}>
          <Icon name={priorityIcons?.[bug?.priority]} size={12} className="inline mr-1" />
          {bug?.priority}
        </span>
      </div>
      <div className="flex items-center gap-2 mb-3">
        <Image
          src={bug?.assignee?.avatar || bug?.author?.avatar || `https://ui-avatars.com/api/?name=User&background=random`}
          alt={bug?.assignee?.avatarAlt || bug?.author?.avatarAlt || 'User avatar'}
          className="w-6 h-6 rounded-full object-cover"
        />
        <span className="text-xs text-muted-foreground">
          {bug?.assignee?.name || bug?.author?.name || 'Unassigned'}
        </span>
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
        <span className="flex items-center gap-1">
          <Icon name="Calendar" size={14} />
          {bug?.createdAt ? new Date(bug?.createdAt)?.toLocaleDateString() : bug?.createdDate || 'N/A'}
        </span>
        <span className="flex items-center gap-1">
          <Icon name="MessageSquare" size={14} />
          {bug?.comments || 0}
        </span>
      </div>
      {bug?.tags && bug?.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {bug?.tags?.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      <div className="flex items-center gap-2 pt-3 border-t border-border">
        <button
          onClick={() => onViewDetails(bug)}
          className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded text-xs font-medium hover:bg-primary/15 transition-colors"
        >
          <Icon name="Eye" size={14} />
          View
        </button>
        <button
          onClick={() => onAssign(bug)}
          className="flex items-center justify-center gap-1 px-3 py-1.5 bg-muted text-muted-foreground rounded text-xs font-medium hover:bg-muted transition-colors"
        >
          <Icon name="UserPlus" size={14} />
        </button>
        <button
          onClick={() => onPriorityChange(bug)}
          className="flex items-center justify-center gap-1 px-3 py-1.5 bg-muted text-muted-foreground rounded text-xs font-medium hover:bg-muted transition-colors"
        >
          <Icon name="Flag" size={14} />
        </button>
      </div>
    </div>
  );
};

export default BugCard;