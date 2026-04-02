import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import { formatTimeAgo } from '../../../utils/formatTime';

const SnippetCard = ({ snippet, onDelete, onEdit, showActions = true }) => {
  const navigate = useNavigate();
  const qualityScore = snippet?.aiQualityScore || snippet?.ai_quality_score || 0;
  const purposeTag = snippet?.aiAnalysisData?.purposeTags?.[0] || snippet?.ai_analysis_data?.purposeTags?.[0] || snippet?.snippetType || snippet?.snippet_type || 'code';
  const tags = snippet?.tags || snippet?.ai_tags || [];
  const language = snippet?.language || 'code';

  const handleClick = () => {
    navigate(`/snippet-details?id=${snippet?.id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="bg-card rounded-lg border border-border overflow-hidden cursor-pointer transition-all duration-200 hover:border-primary/30 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5 group flex flex-col"
    >
      {/* Top accent bar */}
      <div className="h-1 bg-gradient-to-r from-primary via-secondary to-accent" />

      <div className="p-4 flex-1 flex flex-col">
        {/* Row 1: Purpose tag + Language + Quality */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-accent/15 text-accent rounded">
              {purposeTag}
            </span>
            <span className="px-2 py-0.5 text-[11px] font-mono bg-muted text-foreground rounded">
              {language}
            </span>
          </div>
          {qualityScore > 0 && (
            <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded flex items-center gap-0.5 ${
              qualityScore >= 80 ? 'bg-success/15 text-success' :
              qualityScore >= 50 ? 'bg-warning/15 text-warning' :
              qualityScore < 40 ? 'bg-error/15 text-error' : 'bg-muted text-muted-foreground'
            }`}>
              {qualityScore >= 80 && <Icon name="BadgeCheck" size={10} />}
              {qualityScore < 40 && <Icon name="AlertTriangle" size={10} />}
              {qualityScore}
            </span>
          )}
        </div>

        {/* Row 2: Title */}
        <h3 className="font-semibold text-sm text-foreground line-clamp-2 group-hover:text-primary transition-colors mb-1">
          {snippet?.title || 'Untitled Snippet'}
        </h3>

        {/* Row 3: Description */}
        {snippet?.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2 leading-relaxed">
            {snippet?.description}
          </p>
        )}

        {/* Row 4: AI Tags */}
        {tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {tags.slice(0, 4).map((tag, i) => (
              <span key={i} className="px-1.5 py-0.5 text-[10px] font-medium bg-primary/10 text-primary rounded">
                {tag}
              </span>
            ))}
            {tags.length > 4 && (
              <span className="px-1.5 py-0.5 text-[10px] text-muted-foreground">+{tags.length - 4}</span>
            )}
          </div>
        )}

        {/* Spacer to push stats to bottom */}
        <div className="flex-1" />

        {/* Row 5: Engagement stats */}
        <div className="flex items-center gap-3 pt-2 border-t border-border/50 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Icon name="Heart" size={12} /> {snippet?.likes || snippet?.likesCount || snippet?.likes_count || 0}
          </span>
          <span className="flex items-center gap-1">
            <Icon name="MessageSquare" size={12} /> {snippet?.comments || snippet?.commentsCount || snippet?.comments_count || 0}
          </span>
          <span className="flex items-center gap-1">
            <Icon name="Eye" size={12} /> {snippet?.views || snippet?.viewsCount || snippet?.views_count || 0}
          </span>
          {(snippet?.reuseCount || snippet?.reuse_count) > 0 && (
            <span className="flex items-center gap-1">
              <Icon name="GitFork" size={12} /> {snippet?.reuseCount || snippet?.reuse_count}
            </span>
          )}
          <span className="ml-auto text-[10px]">
            {formatTimeAgo(snippet?.createdAt || snippet?.created_at)}
          </span>
        </div>

        {/* Action Buttons */}
        {showActions && (onEdit || onDelete) && (
          <div className="flex gap-1 mt-2 pt-2 border-t border-border/50">
            {onEdit && (
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(snippet); }}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs text-muted-foreground hover:text-primary hover:bg-primary/10 rounded transition-colors"
              >
                <Icon name="Edit" size={12} /> Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(snippet?.id); }}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs text-muted-foreground hover:text-error hover:bg-error/10 rounded transition-colors"
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
