import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import CodeBlock from '../../../components/ui/CodeBlock';
import { formatTimeAgo } from '../../../utils/formatTime';

const SnippetResultCard = ({ snippet, searchQuery, onLike, onSave }) => {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);

  const handleClick = () => {
    navigate(`/snippet-details?id=${snippet?.id}`);
  };

  const handleLike = (e) => {
    e.stopPropagation();
    setLiked(!liked);
    onLike?.(snippet?.id);
  };

  return (
    <div
      onClick={handleClick}
      className="bg-card rounded-lg border border-border overflow-hidden cursor-pointer transition-all duration-200 hover:border-primary/30 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5 group"
    >
      {/* Code Preview */}
      <div className="relative">
        <CodeBlock
          code={snippet?.code?.substring(0, 400) || snippet?.codePreview || '// No preview'}
          language={snippet?.language}
          maxLines={6}
          showCopy={false}
          showLineNumbers={false}
          className="border-0 rounded-none"
        />
        <span className="absolute top-2 right-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-primary/90 text-white rounded">
          {snippet?.language || 'code'}
        </span>
      </div>

      {/* Content */}
      <div className="p-3">
        {/* Author Row */}
        <div className="flex items-center gap-2 mb-2">
          <img
            src={snippet?.user?.avatar || snippet?.author?.avatar || '/assets/images/no_image.png'}
            alt=""
            className="w-5 h-5 rounded-full object-cover"
          />
          <span className="text-xs text-muted-foreground">
            {snippet?.user?.name || snippet?.author?.name || 'Anonymous'}
          </span>
          <span className="text-xs text-muted-foreground ml-auto">
            {formatTimeAgo(snippet?.createdAt || snippet?.created_at)}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">
          {snippet?.title}
        </h3>

        {/* Description */}
        {snippet?.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
            {snippet?.description}
          </p>
        )}

        {/* AI Tags */}
        {(snippet?.aiTags?.length > 0 || snippet?.tags?.length > 0) && (
          <div className="flex flex-wrap gap-1 mt-2">
            {(snippet.aiTags || snippet.tags || []).slice(0, 4).map((tag, i) => (
              <span key={i} className="px-1.5 py-0.5 text-[10px] font-medium bg-primary/10 text-primary rounded">
                {tag}
              </span>
            ))}
            {(snippet.aiTags || snippet.tags || []).length > 4 && (
              <span className="px-1.5 py-0.5 text-[10px] text-muted-foreground">
                +{(snippet.aiTags || snippet.tags).length - 4}
              </span>
            )}
          </div>
        )}

        {/* AI Quality Score */}
        {snippet?.aiQualityScore > 0 && (
          <div className="flex items-center gap-1.5 mt-2">
            <Icon name="Sparkles" size={12} className="text-accent" />
            <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-accent rounded-full"
                style={{ width: `${Math.min(snippet.aiQualityScore, 100)}%` }}
              />
            </div>
            <span className="text-[10px] text-accent font-medium">{snippet.aiQualityScore}%</span>
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-3 mt-2 pt-2 border-t border-border/50 text-xs text-muted-foreground">
          <button onClick={handleLike} className={`flex items-center gap-1 transition-colors ${liked ? 'text-error' : 'hover:text-error'}`}>
            <Icon name="Heart" size={12} className={liked ? 'fill-current' : ''} /> {snippet?.likesCount || snippet?.likes || 0}
          </button>
          <span className="flex items-center gap-1">
            <Icon name="MessageSquare" size={12} /> {snippet?.commentsCount || snippet?.comments || 0}
          </span>
          <span className="flex items-center gap-1">
            <Icon name="Eye" size={12} /> {snippet?.viewsCount || snippet?.views || 0}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SnippetResultCard;
