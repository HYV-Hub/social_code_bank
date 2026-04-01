import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import { formatTimeAgo } from '../../../utils/formatTime';

export default function CompactListItem({ item, onTagClick }) {
  const navigate = useNavigate();
  if (item?.type !== 'snippet') return null;

  const snippet = item?.data;
  const qualityScore = snippet?.ai_quality_score;

  return (
    <div
      onClick={() => navigate(`/snippet-details?id=${snippet?.id}`)}
      className="hyv-card px-4 py-2.5 cursor-pointer flex items-center gap-4 group"
    >
      {/* Title */}
      <h3 className="text-sm font-medium text-foreground truncate flex-1 min-w-0 group-hover:text-primary transition-colors">
        {snippet?.title}
      </h3>

      {/* Language */}
      <span className="px-2 py-0.5 text-[11px] font-mono bg-muted text-foreground rounded flex-shrink-0">
        {snippet?.language}
      </span>

      {/* Tags (hidden on small screens) */}
      <div className="hidden md:flex items-center gap-1 flex-shrink-0">
        {snippet?.ai_tags?.slice(0, 2).map((tag, i) => (
          <button
            key={i}
            onClick={(e) => { e.stopPropagation(); onTagClick?.(tag); }}
            className="hyv-tag text-[10px]"
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-3 text-[11px] text-muted-foreground flex-shrink-0">
        <span className="flex items-center gap-1"><Icon name="Heart" size={11} /> {snippet?.likes_count || 0}</span>
        <span className="flex items-center gap-1"><Icon name="GitFork" size={11} /> {snippet?.reuse_count || 0}</span>
        {qualityScore > 0 && (
          <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
            qualityScore >= 80 ? 'bg-success/15 text-success' :
            qualityScore >= 50 ? 'bg-warning/15 text-warning' : 'bg-muted text-muted-foreground'
          }`}>
            {qualityScore}
          </span>
        )}
      </div>

      {/* Author (hidden on small screens) */}
      <div className="hidden lg:flex items-center gap-1.5 flex-shrink-0">
        <img
          src={snippet?.author?.avatar_url || `https://ui-avatars.com/api/?name=U&background=8b5cf6&color=fff&size=20`}
          alt="" className="w-4 h-4 rounded-full"
        />
        <span className="text-[11px] text-muted-foreground truncate max-w-[80px]">
          {snippet?.author?.username || snippet?.author?.full_name}
        </span>
      </div>

      {/* Time */}
      <span className="text-[11px] text-muted-foreground flex-shrink-0">
        {formatTimeAgo(snippet?.created_at)}
      </span>
    </div>
  );
}
