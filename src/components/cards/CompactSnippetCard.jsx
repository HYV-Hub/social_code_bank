import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import { snippetService } from '../../services/snippetService';
import { formatTimeAgo } from '../../utils/formatTime';

export default function CompactSnippetCard({ snippet, onLike }) {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);

  const qualityScore = snippet?.aiQualityScore || snippet?.ai_quality_score || 0;
  const tags = snippet?.aiTags || snippet?.ai_tags || [];
  const purposeTags = snippet?.aiAnalysisData?.purposeTags || snippet?.ai_analysis_data?.purposeTags || [];
  const reuseCount = snippet?.reuseCount || snippet?.reuse_count || 0;
  const firstPurposeTag = purposeTags?.[0] || tags?.[0] || null;

  const scoreColor = qualityScore >= 80 ? 'text-success' :
    qualityScore >= 60 ? 'text-warning' : 'text-error';

  return (
    <div
      className="hyv-card overflow-hidden cursor-pointer group"
      onClick={() => navigate(`/snippet-details?id=${snippet?.id}`)}
    >
      {/* Header: tags + language + score */}
      <div className="p-3 pb-1.5">
        <div className="flex items-center gap-1.5 mb-1.5">
          {firstPurposeTag && (
            <span className="text-[10px] font-medium text-accent bg-accent/10 px-1.5 py-px rounded">
              {firstPurposeTag}
            </span>
          )}
          <span className="text-[10px] font-mono text-muted-foreground">{snippet?.language}</span>
          {qualityScore > 0 && (
            <span className="ml-auto flex items-center gap-0.5">
              <span className={`text-[10px] font-medium ${scoreColor}`}>{qualityScore}</span>
              <Icon name="Sparkles" size={10} className={scoreColor} />
            </span>
          )}
        </div>
        <h3 className="text-[13px] font-medium text-foreground truncate group-hover:text-primary transition-colors">
          {snippet?.title}
        </h3>
        {snippet?.description && (
          <p className="text-[11px] text-muted-foreground truncate mt-0.5">{snippet.description}</p>
        )}
      </div>

      {/* Code preview */}
      <pre className="m-0 px-3 py-2 font-mono text-[10px] leading-relaxed text-[#a5a0b8] overflow-hidden"
        style={{
          background: '#12111e',
          maxHeight: '72px',
          maskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)',
        }}>
        <code>{snippet?.code?.substring(0, 300)}</code>
      </pre>

      {/* Footer: stats + author */}
      <div className="flex items-center justify-between px-3 py-2 border-t border-border">
        <div className="flex items-center gap-2.5 text-[11px] text-muted-foreground">
          <button onClick={(e) => { e.stopPropagation(); setLiked(!liked); if (onLike) onLike(snippet?.id, !liked); }}
            className={`flex items-center gap-1 transition-colors ${liked ? 'text-error' : 'hover:text-error'}`}>
            <Icon name="Heart" size={12} className={liked ? 'fill-current' : ''} />
            {snippet?.likesCount || snippet?.likes_count || 0}
          </button>
          <span className="flex items-center gap-1">
            <Icon name="MessageSquare" size={12} />
            {snippet?.commentsCount || snippet?.comments_count || 0}
          </span>
          {reuseCount > 0 && (
            <span className="flex items-center gap-1 text-accent">
              <Icon name="Copy" size={12} />
              {reuseCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <img
            src={snippet?.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(snippet?.user?.name || 'U')}&background=8b5cf6&color=fff&size=18`}
            alt="" className="w-[18px] h-[18px] rounded-full object-cover"
          />
          <span className="text-[10px] text-muted-foreground">
            {formatTimeAgo(snippet?.createdAt || snippet?.created_at)}
          </span>
        </div>
      </div>
    </div>
  );
}
