import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const BugResultCard = ({ bug, searchQuery }) => {
  const navigate = useNavigate();
  const [showFullError, setShowFullError] = useState(false);

  const highlightText = (text) => {
    if (!searchQuery) return text;
    const parts = text?.split(new RegExp(`(${searchQuery})`, 'gi'));
    return parts?.map((part, i) =>
      part?.toLowerCase() === searchQuery?.toLowerCase() ? (
        <mark key={i} className="bg-accent/30 text-foreground font-medium">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const getStatusColor = (status) => {
    const colors = {
      open: 'bg-error/10 text-error border-error/30',
      'in-review': 'bg-warning/10 text-warning border-warning/30',
      'fix-submitted': 'bg-primary/10 text-primary border-primary/30',
      resolved: 'bg-success/10 text-success border-success/30'
    };
    return colors?.[status] || colors?.open;
  };

  const getPriorityIcon = (priority) => {
    const icons = {
      critical: 'AlertCircle',
      high: 'AlertTriangle',
      medium: 'Info',
      low: 'Minus'
    };
    return icons?.[priority] || 'Info';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      critical: 'text-error bg-error/10',
      high: 'text-warning bg-warning/10',
      medium: 'text-warning bg-warning/10',
      low: 'text-muted-foreground bg-muted'
    };
    return colors?.[priority] || colors?.medium;
  };

  const handleErrorToggle = (e) => {
    e?.stopPropagation();
    setShowFullError(!showFullError);
  };

  const formatErrorStack = (error) => {
    if (!error) return '';
    const lines = error?.split('\n');
    const maxLines = showFullError ? lines?.length : 3;
    return lines?.slice(0, maxLines);
  };

  const errorLines = formatErrorStack(bug?.error_stack || bug?.errorPreview || '');

  return (
    <div
      onClick={() => navigate(`/bug-board?bugId=${bug?.id}`)}
      className="bg-card border border-border rounded-lg hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group"
    >
      {/* Header Section */}
      <div className="p-6 pb-4">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-xl bg-error/10 border border-error/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Icon name="Bug" size={24} className="text-error" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-3">
              <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                {highlightText(bug?.title)}
              </h3>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide border ${getStatusColor(bug?.status)}`}>
                  {bug?.status?.replace('-', ' ')}
                </span>
                <div className={`p-2 rounded-lg ${getPriorityColor(bug?.priority)}`}>
                  <Icon
                    name={getPriorityIcon(bug?.priority)}
                    size={16}
                  />
                </div>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
              {highlightText(bug?.description)}
            </p>
          </div>
        </div>
      </div>

      {/* Environment & Error Section */}
      <div className="px-6 pb-4">
        <div className="bg-muted/30 rounded-lg border border-border overflow-hidden">
          <div className="px-4 py-2 bg-muted/50 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Icon name="Monitor" size={14} className="text-muted-foreground" />
                <span className="text-xs font-medium text-foreground">Environment:</span>
                <span className="text-xs text-muted-foreground font-mono">
                  {bug?.environment || 'Not specified'}
                </span>
              </div>
              {bug?.language && (
                <>
                  <span className="text-muted-foreground">•</span>
                  <div className="flex items-center gap-2">
                    <Icon name="Code2" size={14} className="text-muted-foreground" />
                    <span className="text-xs text-muted-foreground font-mono">
                      {bug?.language}
                    </span>
                  </div>
                </>
              )}
            </div>
            {errorLines?.length > 0 && (
              <button
                onClick={handleErrorToggle}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                <Icon name={showFullError ? "ChevronUp" : "ChevronDown"} size={12} />
                {showFullError ? "Show Less" : "Show More"}
              </button>
            )}
          </div>

          {errorLines?.length > 0 && (
            <div className="relative bg-card overflow-x-auto">
              <pre className="p-4 text-xs">
                <code className="text-error font-mono leading-relaxed">
                  {errorLines?.map((line, index) => (
                    <div key={index} className="hover:bg-card/50 transition-colors">
                      {line || '\n'}
                    </div>
                  ))}
                </code>
              </pre>
              {!showFullError && errorLines?.length >= 3 && (
                <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-foreground to-transparent pointer-events-none" />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Comments Preview Section */}
      {bug?.recent_comments && bug?.recent_comments?.length > 0 && (
        <div className="px-6 pb-4">
          <div className="bg-muted/30 rounded-lg border border-border overflow-hidden">
            <div className="px-4 py-2 bg-muted/50 border-b border-border">
              <div className="flex items-center gap-2">
                <Icon name="MessageSquare" size={14} className="text-muted-foreground" />
                <span className="text-xs font-medium text-foreground">Recent Comments</span>
                <span className="text-xs text-muted-foreground">
                  ({bug?.comments_count || bug?.comments || 0} total)
                </span>
              </div>
            </div>
            <div className="p-3 space-y-3">
              {bug?.recent_comments?.slice(0, 2)?.map((comment, index) => (
                <div key={index} className="flex gap-3">
                  <Image
                    src={comment?.user?.avatar_url}
                    alt={`${comment?.user?.username || comment?.user?.full_name || 'User'}'s avatar`}
                    className="w-6 h-6 rounded-full flex-shrink-0 mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-xs font-medium text-foreground">
                        {comment?.user?.username || comment?.user?.full_name || 'Anonymous'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {comment?.created_at_relative || comment?.created_at}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {comment?.content}
                    </p>
                  </div>
                </div>
              ))}
              {bug?.comments_count > 2 && (
                <button
                  onClick={(e) => {
                    e?.stopPropagation();
                    navigate(`/bug-board?bugId=${bug?.id}`);
                  }}
                  className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1 mt-2"
                >
                  View all {bug?.comments_count} comments
                  <Icon name="ChevronRight" size={12} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer Section */}
      <div className="px-6 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Image
                src={bug?.reporter?.avatar_url || bug?.reporterAvatar}
                alt={`${bug?.reporter?.username || bug?.reporter?.full_name || bug?.reporter || 'Reporter'}'s avatar`}
                className="w-7 h-7 rounded-full ring-2 ring-background"
              />
              <div className="flex flex-col">
                <span className="font-medium text-foreground text-xs">
                  {bug?.reporter?.username || bug?.reporter?.full_name || bug?.reporter || 'Anonymous'}
                </span>
                <span className="text-xs text-muted-foreground">Reporter</span>
              </div>
            </div>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">{bug?.created_at_relative || bug?.reportedAt}</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
              <Icon name="MessageSquare" size={16} />
              <span className="font-medium">{bug?.comments_count || bug?.comments || 0}</span>
            </span>
            {(bug?.fix_submitted || bug?.fixSubmitted) && (
              <span className="flex items-center gap-1.5 text-sm text-success font-medium">
                <Icon name="CheckCircle2" size={16} />
                Fix Available
              </span>
            )}
            {bug?.upvotes_count !== undefined && (
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-success transition-colors">
                <Icon name="ThumbsUp" size={16} />
                <span className="font-medium">{bug?.upvotes_count || 0}</span>
              </span>
            )}
          </div>
        </div>

        {/* Tags */}
        {bug?.tags && bug?.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {bug?.tags?.map((tag, index) => (
              <span
                key={index}
                className="px-2.5 py-1 bg-error/5 hover:bg-error/10 border border-error/10 rounded-full text-xs text-error font-medium transition-colors cursor-pointer"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BugResultCard;