import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, MessageCircle, Heart, UserPlus, AtSign, AlertCircle, Users, Code, Check, X } from 'lucide-react';
import { notificationService } from '../../../services/notificationService';
import Icon from '../../../components/AppIcon';


const getNotificationIcon = (type) => {
  const icons = {
    comment: MessageCircle,
    like: Heart,
    follow: UserPlus,
    mention: AtSign,
    bug_assignment: AlertCircle,
    team_update: Users,
    snippet_share: Code
  };
  return icons?.[type] || Bell;
};

const getPriorityColor = (priority) => {
  const colors = {
    low: 'text-gray-500',
    normal: 'text-blue-500',
    high: 'text-orange-500',
    urgent: 'text-red-500'
  };
  return colors?.[priority] || 'text-gray-500';
};

const getTypeColor = (type) => {
  const colors = {
    comment: 'bg-blue-100 text-blue-600',
    like: 'bg-pink-100 text-pink-600',
    follow: 'bg-green-100 text-green-600',
    mention: 'bg-purple-100 text-purple-600',
    bug_assignment: 'bg-red-100 text-red-600',
    team_update: 'bg-indigo-100 text-indigo-600',
    snippet_share: 'bg-yellow-100 text-yellow-600'
  };
  return colors?.[type] || 'bg-gray-100 text-gray-600';
};

const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date?.toLocaleDateString();
};

export function NotificationCard({ notification, onUpdate, onDelete }) {
  const navigate = useNavigate();
  const Icon = getNotificationIcon(notification?.type);

  const handleClick = async () => {
    if (!notification?.isRead) {
      try {
        await notificationService?.markAsRead(notification?.id);
        onUpdate?.();
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
    if (notification?.actionUrl) {
      navigate(notification?.actionUrl);
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
    try {
      await notificationService?.delete(notification?.id);
      onDelete?.(notification?.id);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors ${
        !notification?.isRead ? 'bg-blue-50' : 'bg-white'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Avatar/Icon */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getTypeColor(notification?.type)}`}>
          <Icon className="w-5 h-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-semibold text-gray-900 truncate">
                  {notification?.title}
                </h3>
                {notification?.priority !== 'normal' && (
                  <span className={`text-xs font-medium ${getPriorityColor(notification?.priority)}`}>
                    {notification?.priority?.toUpperCase()}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                {notification?.message}
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                {notification?.actorName && (
                  <span className="font-medium text-gray-700">{notification?.actorName}</span>
                )}
                <span>•</span>
                <span>{formatTimeAgo(notification?.createdAt)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {!notification?.isRead && (
                <button
                  onClick={handleMarkAsRead}
                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  title="Mark as read"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={handleDelete}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                title="Delete"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Unread indicator */}
      {!notification?.isRead && (
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r"></div>
      )}
    </div>
  );
}