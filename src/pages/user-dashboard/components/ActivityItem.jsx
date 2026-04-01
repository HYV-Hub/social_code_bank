import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import Icon from '../../../components/AppIcon';

const ActivityItem = ({ activity }) => {
  const getActivityIcon = (type) => {
    switch(type) {
      case 'like': return 'Heart';
      case 'comment': return 'MessageSquare';
      case 'follow': return 'UserPlus';
      case 'share': return 'Share2';
      case 'save': return 'Bookmark';
      default: return 'Bell';
    }
  };

  const getActivityColor = (type) => {
    switch(type) {
      case 'like': return 'text-error';
      case 'comment': return 'text-primary';
      case 'follow': return 'text-green-500';
      case 'share': return 'text-purple-500';
      case 'save': return 'text-yellow-500';
      default: return 'text-muted-foreground';
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Recently';
    if (timestamp instanceof Date) {
      return formatDistanceToNow(timestamp, { addSuffix: true });
    }
    return timestamp;
  };

  return (
    <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
      <div className={`p-2 rounded-full ${getActivityColor(activity?.type)}`}>
        <Icon name={getActivityIcon(activity?.type)} size={20} />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <img 
            src={activity?.user?.avatar} 
            alt={activity?.user?.avatarAlt || `Avatar of ${activity?.user?.name}`}
            className="w-6 h-6 rounded-full"
          />
          <span className="font-medium text-foreground">{activity?.user?.name}</span>
          <span className="text-xs text-muted-foreground">
            {formatTimestamp(activity?.timestamp)}
          </span>
        </div>
        
        <p className="text-sm text-muted-foreground mb-2">
          {activity?.action}
        </p>
        
        {activity?.description && (
          <p className="text-sm text-foreground">
            {activity?.description}
          </p>
        )}
        
        {activity?.engagement && (
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Icon name="Heart" size={14} />
              <span className="text-xs">{activity?.engagement?.likes || 0}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Icon name="MessageSquare" size={14} />
              <span className="text-xs">{activity?.engagement?.comments || 0}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityItem;