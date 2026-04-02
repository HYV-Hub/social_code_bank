import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import { useAuth } from '../../contexts/AuthContext';
import { snippetService } from '../../services/snippetService';
import { formatTimeAgo } from '../../utils/formatTime';

export default function ExpandedSnippetCard({ snippet, onLike, onFork }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  const qualityScore = snippet?.aiQualityScore || snippet?.ai_quality_score || 0;
  const tags = snippet?.aiTags || snippet?.ai_tags || [];
  const purposeTags = snippet?.aiAnalysisData?.purposeTags || snippet?.ai_analysis_data?.purposeTags || [];
  const summary = snippet?.aiAnalysisData?.summary || snippet?.ai_analysis_data?.summary || '';
  const recentComment = snippet?.recentComment || null;
  const reuseCount = snippet?.reuseCount || snippet?.reuse_count || 0;

  const scoreColor = qualityScore >= 80 ? 'text-success border-success' :
    qualityScore >= 60 ? 'text-warning border-warning' : 'text-error border-error';

  const handleCopy = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(snippet?.code);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
      if (snippet?.id) snippetService.logReuse?.(snippet.id, 'copy');
    } catch (err) {
      console.warn('Copy failed:', err);
    }
  };

  const handleFork = (e) => {
    e.stopPropagation();
    if (onFork) onFork(snippet);
  };

  const handleLike = (e) => {
    e.stopPropagation();
    setLiked(!liked);
    if (onLike) onLike(snippet?.id, !liked);
  };

  return (
    <div
      className="hyv-card overflow-hidden cursor-pointer group"
      onClick={() => navigate(`/snippet-details?id=${snippet?.id}`)}
    >
      {/* ─── HEADER ─── */}
      <div className="flex items-start justify-between p-4 pb-2.5 gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
            {purposeTags?.slice(0, 2)?.map((tag, i) => (
              <span key={`p-${i}`} className="hyv-tag-ai text-[10px] py-0">{tag}</span>
            ))}
            {tags?.slice(0, 2)?.map((tag, i) => (
              <span key={`t-${i}`} className="hyv-tag text-[10px] py-0">{tag}</span>
            ))}
          </div>
          <h3 className="text-[15px] font-medium text-foreground truncate group-hover:text-primary transition-colors">
            {snippet?.title}
          </h3>
          {snippet?.description && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">{snippet.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border">
            {snippet?.language}
          </span>
          {qualityScore > 0 && (
            <div className={`w-9 h-9 rounded-full border-2 ${scoreColor} flex items-center justify-center`}>
              <span className={`text-xs font-medium ${scoreColor.split(' ')[0]}`}>{qualityScore}</span>
            </div>
          )}
        </div>
      </div>

      {/* ─── BODY: Code Left + Details Right ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px]">
        <div className="border-t border-r border-border lg:border-r-border">
          <pre className="m-0 p-4 font-mono text-[11px] leading-relaxed text-[#c4b5fd] overflow-hidden"
            style={{
              background: '#12111e',
              maxHeight: '180px',
              maskImage: 'linear-gradient(to bottom, black 65%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, black 65%, transparent 100%)',
            }}>
            <code>{snippet?.code?.substring(0, 800)}</code>
          </pre>
        </div>

        <div className="border-t border-border p-3 flex flex-col gap-2.5 bg-[#0b0a14]">
          {summary && (
            <div className="bg-accent/5 border border-accent/10 rounded-md p-2.5">
              <p className="text-[10px] font-medium text-accent flex items-center gap-1 mb-1">
                <Icon name="Sparkles" size={11} /> AI summary
              </p>
              <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-3">{summary}</p>
            </div>
          )}

          {tags?.length > 0 && (
            <div>
              <p className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider mb-1">Tags</p>
              <div className="flex flex-wrap gap-1">
                {tags?.slice(0, 8)?.map((tag, i) => (
                  <span key={i} className="hyv-tag text-[10px] py-0 cursor-pointer"
                    onClick={(e) => { e.stopPropagation(); navigate(`/search-results?q=${encodeURIComponent(tag)}`); }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <img
              src={snippet?.user?.avatar || snippet?.author?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(snippet?.user?.name || 'U')}&background=8b5cf6&color=fff&size=24`}
              alt="" className="w-6 h-6 rounded-full object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium text-foreground truncate">
                @{snippet?.user?.username || snippet?.author?.username || 'user'}
              </p>
              <p className="text-[10px] text-muted-foreground">{formatTimeAgo(snippet?.createdAt || snippet?.created_at)}</p>
            </div>
          </div>

          {recentComment && (
            <div className="bg-muted rounded-md p-2.5">
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-[7px] font-medium text-white">
                    {recentComment?.user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <span className="text-[10px] font-medium text-muted-foreground">
                  @{recentComment?.user?.username}
                </span>
                <span className="text-[10px] text-muted-foreground/60">
                  {formatTimeAgo(recentComment?.createdAt)}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                {recentComment?.content}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ─── FOOTER: Actions ─── */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-[#0b0a14]">
        <div className="flex items-center gap-4">
          <button onClick={handleLike} className={`flex items-center gap-1.5 text-xs transition-colors ${liked ? 'text-error' : 'text-muted-foreground hover:text-error'}`}>
            <Icon name="Heart" size={14} className={liked ? 'fill-current' : ''} />
            {snippet?.likesCount || snippet?.likes_count || 0}
          </button>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Icon name="MessageSquare" size={14} />
            {snippet?.commentsCount || snippet?.comments_count || 0}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-accent">
            <Icon name="Copy" size={14} />
            {reuseCount} reused
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-[11px] font-medium hover:bg-primary/90 transition-colors">
            <Icon name={copyFeedback ? 'Check' : 'Copy'} size={12} />
            {copyFeedback ? 'Copied!' : 'Copy'}
          </button>
          <button onClick={handleFork}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-primary/30 text-primary rounded-md text-[11px] font-medium hover:bg-primary/10 transition-colors">
            <Icon name="GitFork" size={12} />
            Fork
          </button>
          <button onClick={(e) => e.stopPropagation()}
            className="flex items-center px-2 py-1.5 border border-border text-muted-foreground rounded-md hover:text-foreground hover:border-border transition-colors">
            <Icon name="Share2" size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
