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
      className="hyv-card p-4 cursor-pointer group"
    >
      {/* Language tag */}
      {snippet?.language && (
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-medium text-accent">{snippet?.language}</span>
        </div>
      )}

      {/* Title */}
      <h3 className="text-sm font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
        {snippet?.title || 'Untitled Snippet'}
      </h3>

      {/* Description */}
      {snippet?.description && (
        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
          {snippet?.description}
        </p>
      )}

      {/* Author Info */}
      {snippet?.author && (
        <div className="flex items-center gap-2 mt-2">
          {snippet?.author?.avatar_url ? (
            <img
              src={snippet?.author?.avatar_url}
              alt={snippet?.author?.username}
              className="w-5 h-5 rounded-full object-cover"
            />
          ) : (
            <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center text-white text-[9px] font-bold">
              {snippet?.author?.username?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          )}
          <span className="text-xs text-muted-foreground truncate">
            {snippet?.author?.username || 'Unknown'}
          </span>
        </div>
      )}

      {/* Meta row */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-border text-[11px] text-muted-foreground">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Heart className="w-3 h-3" /> {snippet?.likes_count || 0}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="w-3 h-3" /> {snippet?.comments_count || 0}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" /> {snippet?.views_count || 0}
          </span>
        </div>
        {addedAt && (
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {new Date(addedAt)?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        )}
      </div>

      {/* Remove button */}
      {canManage && onRemove && (
        <button
          onClick={handleRemove}
          className="mt-2 w-full flex items-center justify-center gap-1 py-1 text-xs text-muted-foreground hover:text-error hover:bg-error/10 rounded transition-colors"
          title="Remove from collection"
        >
          <Trash2 className="w-3 h-3" /> Remove
        </button>
      )}
    </div>
  );
};

export default SnippetCard;
