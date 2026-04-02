import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import { formatTimeAgo } from '../../../utils/formatTime';

export default function FeedItemCard({ item, onLike, onSave, onTagClick }) {
  const navigate = useNavigate();

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [saved, setSaved] = useState(false);

  // ─── Snippet Card: Intent-First Design ───
  const renderSnippetCard = () => {
    const snippet = item?.data;
    const purposeTag = snippet?.ai_analysis_data?.purposeTags?.[0] || snippet?.snippet_type || 'code';
    const qualityScore = snippet?.ai_quality_score;

    return (
      <div
        onClick={() => navigate(`/snippet-details?id=${snippet?.id}`)}
        className="hyv-card overflow-hidden cursor-pointer group flex flex-col"
      >
        {/* Top accent bar */}
        <div className="h-1 bg-gradient-to-r from-primary via-secondary to-accent" />

        <div className="p-4 flex-1 flex flex-col">
        {/* Row 1: Purpose + Language + Quality */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-accent/15 text-accent rounded">
              {purposeTag}
            </span>
            <span className="px-2 py-0.5 text-[11px] font-mono bg-muted text-foreground rounded">
              {snippet?.language}
            </span>
            {snippet?.snippet_type && snippet.snippet_type !== 'code' && (
              <span className="px-2 py-0.5 text-[11px] font-mono bg-muted text-muted-foreground rounded">
                {snippet.snippet_type}
              </span>
            )}
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

        {/* Title — the hero */}
        <h3 className="text-sm font-semibold text-foreground line-clamp-2 mb-1 group-hover:text-primary transition-colors">
          {snippet?.title}
        </h3>

        {/* Description */}
        {snippet?.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2 leading-relaxed">
            {snippet.description}
          </p>
        )}

        {/* AI tags — the visual identity */}
        {snippet?.ai_tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {snippet.ai_tags.slice(0, 4).map((tag, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); onTagClick?.(tag); }}
                className="hyv-tag text-[10px] hover:ring-1 hover:ring-primary/50 transition-all"
              >
                {tag}
              </button>
            ))}
            {snippet.ai_tags.length > 4 && (
              <span className="px-1.5 py-0.5 text-[10px] text-muted-foreground">
                +{snippet.ai_tags.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Spacer to push stats to bottom */}
        <div className="flex-1" />

        {/* Social proof row — interactive */}
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-2 border-t border-border/50">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLiked(!liked);
              setLikeCount(prev => liked ? prev - 1 : prev + 1);
              onLike?.(snippet?.id);
            }}
            className={`flex items-center gap-1 transition-colors ${liked ? 'text-error' : 'hover:text-error'}`}
          >
            <Icon name="Heart" size={12} className={liked ? 'fill-current' : ''} />
            {(snippet?.likes_count || 0) + likeCount}
          </button>
          <span className="flex items-center gap-1">
            <Icon name="GitFork" size={12} /> {snippet?.reuse_count || 0}
          </span>
          <span className="flex items-center gap-1">
            <Icon name="Eye" size={12} /> {snippet?.views_count || 0}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSaved(!saved);
              onSave?.(snippet?.id);
            }}
            className={`ml-auto flex items-center gap-1 transition-colors ${saved ? 'text-primary' : 'hover:text-primary'}`}
          >
            <Icon name="Bookmark" size={12} className={saved ? 'fill-current' : ''} />
            {saved ? 'Saved' : 'Save'}
          </button>
        </div>

        {/* Author + time */}
        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border">
          <img
            src={snippet?.author?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(snippet?.author?.full_name || 'U')}&background=8b5cf6&color=fff&size=24`}
            alt=""
            className="w-5 h-5 rounded-full object-cover"
          />
          <span className="text-xs text-muted-foreground truncate flex-1">
            {snippet?.author?.full_name || snippet?.author?.username}
          </span>
          <span className="text-[11px] text-muted-foreground">
            {formatTimeAgo(snippet?.created_at)}
          </span>
        </div>
        </div>
      </div>
    );
  };

  // ─── Discussion Card ───
  const renderDiscussionCard = () => {
    const bug = item?.data;
    return (
      <div
        onClick={() => navigate(`/bug-board?id=${bug?.id}`)}
        className="hyv-card p-4 cursor-pointer group"
      >
        <span className="inline-block px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-warning/15 text-warning rounded mb-2">
          Discussion
        </span>

        <h3 className="text-sm font-semibold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
          {bug?.title}
        </h3>

        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{bug?.description}</p>

        <div className="flex items-center gap-2 mb-3">
          <span className={`px-2 py-0.5 text-[10px] font-medium rounded ${
            bug?.bug_status === 'resolved' ? 'bg-success/15 text-success' :
            bug?.bug_status === 'in_progress' ? 'bg-primary/15 text-primary' : 'bg-muted text-foreground'
          }`}>
            {bug?.bug_status?.replace('_', ' ')}
          </span>
          <span className={`px-2 py-0.5 text-[10px] font-medium rounded ${
            bug?.priority === 'high' || bug?.priority === 'critical' ? 'bg-error/15 text-error' :
            bug?.priority === 'medium' ? 'bg-warning/15 text-warning' : 'bg-muted text-foreground'
          }`}>
            {bug?.priority}
          </span>
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <img
            src={bug?.reporter?.avatar_url || `https://ui-avatars.com/api/?name=U&background=8b5cf6&color=fff&size=24`}
            alt="" className="w-5 h-5 rounded-full object-cover"
          />
          <span className="text-xs text-muted-foreground truncate flex-1">
            {bug?.reporter?.full_name || bug?.reporter?.username}
          </span>
          <span className="text-[11px] text-muted-foreground">
            {formatTimeAgo(bug?.created_at)}
          </span>
        </div>
      </div>
    );
  };

  // ─── Collection Card ───
  const renderCollectionCard = () => {
    const collection = item?.data;
    return (
      <div
        onClick={() => navigate(`/collection-details?id=${collection?.id}`)}
        className="hyv-card p-4 cursor-pointer group"
      >
        <span className="inline-block px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-success/15 text-success rounded mb-2">
          Collection
        </span>

        <h3 className="text-sm font-semibold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
          {collection?.name}
        </h3>

        {collection?.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{collection?.description}</p>
        )}

        {collection?.hive?.name && (
          <div className="flex items-center gap-1.5 mb-3 text-xs text-muted-foreground">
            <Icon name="Hexagon" size={12} />
            <span>{collection.hive.name}</span>
          </div>
        )}

        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <img
            src={collection?.creator?.avatar_url || `https://ui-avatars.com/api/?name=U&background=8b5cf6&color=fff&size=24`}
            alt="" className="w-5 h-5 rounded-full object-cover"
          />
          <span className="text-xs text-muted-foreground truncate flex-1">
            {collection?.creator?.full_name || collection?.creator?.username}
          </span>
          <span className="text-[11px] text-muted-foreground">
            {formatTimeAgo(collection?.created_at)}
          </span>
        </div>
      </div>
    );
  };

  switch (item?.type) {
    case 'snippet':
      return renderSnippetCard();
    case 'discussion':
      return renderDiscussionCard();
    case 'collection':
      return renderCollectionCard();
    default:
      return null;
  }
}
