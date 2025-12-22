import React from 'react';
import { CheckCheck, Trash2, X } from 'lucide-react';
import { notificationService } from '../../../services/notificationService';

export function BulkActions({ selectedIds, onClearSelection, onUpdate }) {
  const handleMarkAllAsRead = async () => {
    try {
      await notificationService?.markAllAsRead();
      onClearSelection();
      onUpdate?.();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds?.length === 0) return;
    
    if (window.confirm(`Delete ${selectedIds?.length} notification(s)?`)) {
      try {
        await notificationService?.deleteMultiple(selectedIds);
        onClearSelection();
        onUpdate?.();
      } catch (error) {
        console.error('Error deleting notifications:', error);
      }
    }
  };

  if (selectedIds?.length === 0) {
    return (
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Select notifications for bulk actions</span>
          <button
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all as read
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border-b border-blue-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-900">
            {selectedIds?.length} selected
          </span>
          <button
            onClick={onClearSelection}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <X className="w-4 h-4" />
            Clear selection
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleDeleteSelected}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete selected
          </button>
        </div>
      </div>
    </div>
  );
}