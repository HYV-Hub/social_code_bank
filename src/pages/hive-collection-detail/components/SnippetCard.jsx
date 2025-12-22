import React from 'react';
import { Clock, Eye, Heart, MessageCircle, Trash2 } from 'lucide-react';

const SnippetCard = ({ snippet, onRemove, addedBy, addedAt, canManage, onClick }) => {
  const handleRemove = (e) => {
    e?.stopPropagation();
    if (onRemove && window.confirm('Remove this snippet from the collection?')) {
      onRemove();
    }
  };

  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100 hover:border-blue-300 hover:scale-105"
    >
      {/* Enhanced Snippet Header with gradient accent */}
      <div className="h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600"></div>
      
      <div className="p-6">
        {/* Title and Language Badge */}
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 flex-1 pr-2">
            {snippet?.title || 'Untitled Snippet'}
          </h3>
          {snippet?.language && (
            <span className="px-3 py-1.5 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 text-xs font-bold rounded-lg whitespace-nowrap">
              {snippet?.language}
            </span>
          )}
        </div>

        {/* Description */}
        {snippet?.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
            {snippet?.description}
          </p>
        )}

        {/* Author Info */}
        {snippet?.author && (
          <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition-colors">
            {snippet?.author?.avatar_url ? (
              <img
                src={snippet?.author?.avatar_url}
                alt={snippet?.author?.username}
                className="w-8 h-8 rounded-full border-2 border-white shadow-md"
              />
            ) : (
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md">
                {snippet?.author?.username?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 font-medium">Author</p>
              <p className="text-sm text-gray-900 font-semibold truncate">
                {snippet?.author?.username || 'Unknown'}
              </p>
            </div>
          </div>
        )}

        {/* Enhanced Engagement Metrics */}
        <div className="flex items-center gap-3 text-sm text-gray-600 mb-4 pb-4 border-b border-gray-100">
          <span className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg group-hover:bg-red-50 transition-colors">
            <Heart className="w-4 h-4 text-red-500" />
            <span className="font-semibold">{snippet?.likes_count || 0}</span>
          </span>
          <span className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition-colors">
            <MessageCircle className="w-4 h-4 text-blue-500" />
            <span className="font-semibold">{snippet?.comments_count || 0}</span>
          </span>
          <span className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg group-hover:bg-purple-50 transition-colors">
            <Eye className="w-4 h-4 text-purple-500" />
            <span className="font-semibold">{snippet?.views_count || 0}</span>
          </span>
        </div>

        {/* Added Info */}
        {addedAt && (
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
            <Clock className="w-4 h-4" />
            <span>Added {new Date(addedAt)?.toLocaleDateString()}</span>
          </div>
        )}

        {/* Enhanced Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onClick}
            className="flex-1 px-4 py-2.5 text-sm bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 font-semibold shadow-md hover:shadow-lg transition-all"
          >
            View Details →
          </button>
          {canManage && onRemove && (
            <button
              onClick={handleRemove}
              className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-all border border-red-200 hover:border-red-300"
              title="Remove from collection"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SnippetCard;