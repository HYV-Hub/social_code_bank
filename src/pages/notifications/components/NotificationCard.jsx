import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, MessageCircle, Heart, UserPlus, AtSign, AlertCircle, Users, Code, Check, X } from 'lucide-react';
import { notificationService } from '../../../services/notificationService';
import { formatTimeAgo as formatTimeAgoUtil } from '../../../utils/formatTime';


const getNotificationIcon = (type) => {
  const icons = {
    comment: MessageCircle,
    like: Heart,
    follow: UserPlus,
    mention: AtSign,
    bug_assignment: AlertCircle,
    team_update: Users,
    snippet_share: Code,
    fork: Code,
  };
  return icons?.[type] || Bell;
};

const getPriorityColor = (priority) => {
  const colors = {
    low: 'text-muted-foreground',
    normal: 'text-primary',
    medium: 'text-primary',
    high: 'text-warning',
    urgent: 'text-error'
  };
  return colors?.[priority] || 'text-muted-foreground';
};

const getTypeColor = (type) => {
  const colors = {
    comment: 'bg-primary/15 text-primary',
    like: 'bg-error/15 text-error',
    follow: 'bg-success/15 text-success',
    mention: 'bg-primary/15 text-primary',
    bug_assignment: 'bg-error/15 text-error',
    team_update: 'bg-secondary/15 text-secondary',
    snippet_share: 'bg-warning/15 text-warning',
    fork: 'bg-accent/15 text-accent',
  };
  return colors?.[type] || 'bg-muted text-muted-foreground';
};

const formatTimeAgo = formatTimeAgoUtil;

export function NotificationCard({ notification, onUpdate, onDelete }) {
  const navigate = useNavigate();
  const IconComponent = getNotificationIcon(notification?.type);

  // Handle both camelCase and snake_case field names from DB
  const isRead = notification?.is_read ?? notification?.isRead ?? false;
  const createdAt = notification?.created_at || notification?.createdAt;
  const actorName = notification?.actor_name || notification?.actorName;
  const actionUrl = notification?.action_url || notification?.actionUrl;

  const handleClick = async () => {
    if (!isRead) {
      try {
        await notificationService?.markAsRead(notification?.id);
        onUpdate?.();
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
    if (actionUrl) {
      navigate(actionUrl);
    }
  };

  const handleMarkAsRead = async (e) => {
    e?.stopPropagation();
    try {
      await notificationService?.markAsRead(notification?.id);
      onUpdate?.();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleDelete = async (e) => {
    e?.stopPropagation();
    onDelete?.(notification?.id);
  };

  return (
    <div
      onClick={handleClick}
      className={`relative p-4 border-b border-border hover:bg-background cursor-pointer transition-colors ${
        !isRead ? 'bg-primary/5' : 'bg-card'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getTypeColor(notification?.type)}`}>
          <IconComponent className="w-5 h-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-semibold text-foreground truncate">
                  {notification?.title}
                </h3>
                {notification?.priority && notification?.priority !== 'normal' && notification?.priority !== 'medium' && (
                  <span className={`text-xs font-medium ${getPriorityColor(notification?.priority)}`}>
                    {notification?.priority?.toUpperCase()}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                {notification?.message}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {actorName && (
                  <>
                    <span className="font-medium text-foreground">{actorName}</span>
                    <span>·</span>
                  </>
                )}
                <span>{formatTimeAgo(createdAt)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              {!isRead && (
                <button
                  onClick={handleMarkAsRead}
                  className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded transition-colors"
                  title="Mark as read"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={handleDelete}
                className="p-1.5 text-muted-foreground hover:text-error hover:bg-error/10 rounded transition-colors"
                title="Delete"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Unread indicator */}
      {!isRead && (
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-primary rounded-r"></div>
      )}
    </div>
  );
}
