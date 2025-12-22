import React from 'react';

import Icon from '../../../components/AppIcon';

const ActivityItem = ({ activity }) => {
  const getActivityIcon = (type) => {
    const iconMap = {
      snippet: 'Code',
      bug_fix: 'Bug',
      comment: 'MessageCircle',
      follow: 'UserPlus',
      like: 'Heart',
      save: 'Bookmark',
      team_join: 'Users'
    };
    return iconMap?.[type] || 'Activity';
  };

  const getActivityColor = (type) => {
    const colorMap = {
      snippet: 'text-primary',
      bug_fix: 'text-success',
      comment: 'text-accent',
      follow: 'text-secondary',
      like: 'text-error',
      save: 'text-warning',
      team_join: 'text-accent'
    };
    return colorMap?.[type] || 'text-muted-foreground';
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex gap-4 p-4 hover:bg-muted/50 rounded-lg transition-colors">
      {/* Icon */}
      <div className={`flex-shrink-0 w-10 h-10 rounded-full bg-muted flex items-center justify-center ${getActivityColor(activity?.type)}`}>
        <Icon name={getActivityIcon(activity?.type)} size={20} />
      </div>
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <p className="text-sm text-foreground">
            <span className="font-medium">{activity?.action}</span>
            {activity?.target && (
              <span className="text-muted-foreground"> {activity?.target}</span>
            )}
          </p>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {formatTimestamp(activity?.timestamp)}
          </span>
        </div>

        {activity?.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
            {activity?.description}
          </p>
        )}

        {/* Code Preview for Snippet Activities */}
        {activity?.codePreview && (
          <div className="bg-slate-900 rounded p-3 mt-2 overflow-hidden">
            <pre className="text-xs text-slate-300 font-mono line-clamp-2">
              <code>{activity?.codePreview}</code>
            </pre>
          </div>
        )}

        {/* Engagement Stats */}
        {activity?.engagement && (
          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            {activity?.engagement?.likes > 0 && (
              <div className="flex items-center gap-1">
                <Icon name="Heart" size={14} />
                <span>{activity?.engagement?.likes}</span>
              </div>
            )}
            {activity?.engagement?.comments > 0 && (
              <div className="flex items-center gap-1">
                <Icon name="MessageCircle" size={14} />
                <span>{activity?.engagement?.comments}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityItem;