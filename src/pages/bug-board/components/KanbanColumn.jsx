import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

export default function KanbanColumn({ status, title, bugs, onDrop, onDragOver, onViewDetails, isBugFix = false }) {
  const handleDragStart = (e, bug) => {
    e?.dataTransfer?.setData('bugId', bug?.id);
    e?.dataTransfer?.setData('isBugFix', isBugFix?.toString());
  };

  const getStatusColor = () => {
    if (isBugFix) {
      switch (status) {
        case 'open': return 'bg-blue-100 text-blue-800';
        case 'in_progress': return 'bg-purple-100 text-purple-800';
        case 'resolved': return 'bg-green-100 text-green-800';
        case 'closed': return 'bg-gray-100 text-gray-800';
        default: return 'bg-slate-100 text-slate-800';
      }
    }
    
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    
    try {
      // Handle if date is already a Date object
      if (date instanceof Date) {
        return date?.toISOString()?.split('T')?.[0];
      }
      
      // Handle if date is a string
      if (typeof date === 'string') {
        return date?.split('T')?.[0];
      }
      
      // Handle timestamp
      if (typeof date === 'number') {
        return new Date(date)?.toISOString()?.split('T')?.[0];
      }
      
      return 'N/A';
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'N/A';
    }
  };

  return (
    <div
      className="flex-shrink-0 w-80 bg-slate-50 rounded-lg p-4"
      onDrop={(e) => onDrop?.(e, status)}
      onDragOver={onDragOver}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-slate-800">{title}</h3>
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor()}`}>
            {bugs?.length || 0}
          </span>
          {isBugFix && (
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
              Fixes
            </span>
          )}
        </div>
      </div>
      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        {bugs?.map((bug) => (
          <div
            key={bug?.id}
            draggable
            onDragStart={(e) => handleDragStart(e, bug)}
            onClick={() => onViewDetails?.(bug)}
            className="bg-white rounded-lg p-4 shadow-sm border border-slate-200 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Icon name="AlertCircle" size={16} className="text-slate-500" />
                <h4 className="font-medium text-slate-800">{bug?.title}</h4>
              </div>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor()}`}>
                {bug?.status}
              </span>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Icon name="Clock" size={16} className="text-slate-500" />
                <span className="text-sm text-slate-600">{formatDate(bug?.createdAt)}</span>
              </div>
              
              {bug?.description && (
                <p className="text-sm text-slate-600 line-clamp-2">
                  {bug?.description}
                </p>
              )}
            </div>
          </div>
        ))}
        
        {bugs?.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            <p className="text-sm">No {isBugFix ? 'fixes' : 'bugs'} {title?.toLowerCase()}</p>
          </div>
        )}
      </div>
    </div>
  );
}