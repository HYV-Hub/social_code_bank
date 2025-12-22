import React from "react";
import Image from "../../../components/AppImage";
import Icon from "../../../components/AppIcon";

const ActivityFeedItem = ({ activity }) => {
  const getActivityIcon = (type) => {
    const icons = {
      snippet: "Code",
      bug: "Bug",
      member: "UserPlus",
      comment: "MessageSquare",
      approval: "CheckCircle",
      edit: "Edit"
    };
    return icons?.[type] || "Activity";
  };

  const getActivityColor = (type) => {
    const colors = {
      snippet: "bg-primary/10 text-primary",
      bug: "bg-error/10 text-error",
      member: "bg-success/10 text-success",
      comment: "bg-accent/10 text-accent",
      approval: "bg-success/10 text-success",
      edit: "bg-warning/10 text-warning"
    };
    return colors?.[type] || "bg-muted text-muted-foreground";
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffMs = now - activityTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return activityTime?.toLocaleDateString();
  };

  return (
    <div className="flex items-start gap-4 p-4 hover:bg-muted/50 rounded-lg transition-colors">
      <div className={`p-2 rounded-lg ${getActivityColor(activity?.type)}`}>
        <Icon name={getActivityIcon(activity?.type)} size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4 mb-1">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Image
              src={activity?.userAvatar}
              alt={activity?.userAvatarAlt}
              className="w-6 h-6 rounded-full object-cover flex-shrink-0"
            />
            <p className="text-sm text-foreground">
              <span className="font-semibold">{activity?.userName}</span>
              {" "}
              <span className="text-muted-foreground">{activity?.action}</span>
            </p>
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {formatTimestamp(activity?.timestamp)}
          </span>
        </div>
        
        {activity?.content && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {activity?.content}
          </p>
        )}
        
        {activity?.metadata && (
          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            {activity?.metadata?.language && (
              <span className="flex items-center gap-1">
                <Icon name="Code" size={12} />
                {activity?.metadata?.language}
              </span>
            )}
            {activity?.metadata?.team && (
              <span className="flex items-center gap-1">
                <Icon name="Users" size={12} />
                {activity?.metadata?.team}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityFeedItem;