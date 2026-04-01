import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import CodeBlock from '../../../components/ui/CodeBlock';
import { formatTimeAgo } from '../../../utils/formatTime';

const SnippetCard = ({ snippet, onDelete, onEdit, showActions = true }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/snippet-details?id=${snippet?.id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="bg-card rounded-lg border border-border overflow-hidden cursor-pointer transition-all duration-200 hover:border-primary/30 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5 group"
    >
      {/* Code Preview — Hero Section */}
      <div className="relative">
        <CodeBlock
          code={snippet?.codePreview || snippet?.code?.substring(0, 300) || '// No code preview'}
          language={snippet?.language}
          maxLines={6}
          showCopy={false}
          showLineNumbers={false}
          className="border-0 rounded-none"
        />
        {/* Language Badge */}
        <span className="absolute top-2 right-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-primary/90 text-white rounded">
          {snippet?.language || 'code'}
        </span>
      </div>

      {/* Content Section */}
      <div className="p-3">
        {/* Title */}
        <h3 className="font-semibold text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">
          {snippet?.title || 'Untitled Snippet'}
        </h3>

        {/* Description */}
        {snippet?.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
            {snippet?.description}
          </p>
        )}

        {/* AI Tags */}
        {snippet?.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {snippet.tags.slice(0, 3).map((tag, i) => (
              <span key={i} className="px-1.5 py-0.5 text-[10px] font-medium bg-primary/10 text-primary rounded">
                {tag}
              </span>
            ))}
            {snippet.tags.length > 3 && (
              <span className="px-1.5 py-0.5 text-[10px] text-muted-foreground">
                +{snippet.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Stats Row */}
        <div className="flex items-center gap-3 mt-2 pt-2 border-t border-border/50 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Icon name="Heart" size={12} /> {snippet?.likes || snippet?.likesCount || 0}
          </span>
          <span className="flex items-center gap-1">
            <Icon name="MessageSquare" size={12} /> {snippet?.comments || snippet?.commentsCount || 0}
          </span>
          <span className="flex items-center gap-1">
            <Icon name="Eye" size={12} /> {snippet?.views || snippet?.viewsCount || 0}
          </span>
          {snippet?.reuseCount > 0 && (
            <span className="flex items-center gap-1">
              <Icon name="Copy" size={12} /> {snippet.reuseCount}
            </span>
          )}
          <span className="ml-auto text-[10px]">
            {formatTimeAgo(snippet?.createdAt)}
          </span>
        </div>

        {/* Action Buttons (optional, for dashboard) */}
        {showActions && (onEdit || onDelete) && (
          <div className="flex gap-1 mt-2 pt-2 border-t border-border/50">
            {onEdit && (
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(snippet); }}
                className="flex-1 flex items-center justify-center gap-1 py-1 text-xs text-muted-foreground hover:text-primary hover:bg-primary/10 rounded transition-colors"
              >
                <Icon name="Edit" size={12} /> Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(snippet?.id); }}
                className="flex-1 flex items-center justify-center gap-1 py-1 text-xs text-muted-foreground hover:text-error hover:bg-error/10 rounded transition-colors"
              >
                <Icon name="Trash2" size={12} /> Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SnippetCard;
