import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SnippetCard = ({ snippet, onEdit, onShare, onVisibilityChange, onDelete }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    // Navigate to snippet details page
    navigate(`/snippet-details?id=${snippet?.id}`);
  };

  const handleEditClick = (e) => {
    e?.stopPropagation(); // Prevent card click
    if (onEdit) {
      onEdit(snippet?.id);
    }
  };

  const handleDeleteClick = (e) => {
    e?.stopPropagation(); // Prevent card click
    if (onDelete) {
      onDelete(snippet?.id);
    }
  };

  const getVisibilityIcon = (visibility) => {
    switch(visibility) {
      case 'public': return 'Globe';
      case 'company': return 'Building2';
      case 'team': return 'Users';
      case 'private': return 'Lock';
      default: return 'Lock';
    }
  };

  const getLanguageColor = (language) => {
    const colors = {
      'JavaScript': 'bg-warning/100',
      'Python': 'bg-primary',
      'Java': 'bg-error/100',
      'TypeScript': 'bg-primary',
      'Go': 'bg-cyan-500',
      'Rust': 'bg-orange-600',
      'C++': 'bg-pink-500',
      'Ruby': 'bg-red-600'
    };
    return colors?.[language] || 'bg-background0';
  };

  const handleViewAIReport = () => {
    navigate(`/ai-optimization-report?snippetId=${snippet?.id}`);
  };

  return (
    <div 
      onClick={handleCardClick}
      className="bg-card rounded-lg border border-border p-4 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-3 h-3 rounded-full ${getLanguageColor(snippet?.language)}`}></span>
              <span className="text-xs font-medium text-muted-foreground">{snippet?.language}</span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">
                {snippet?.createdAt instanceof Date 
                  ? formatDistanceToNow(snippet?.createdAt, { addSuffix: true })
                  : snippet?.createdAt || 'Recently'}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
              {snippet?.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{snippet?.description}</p>
          </div>
          <div className="flex items-center gap-1 ml-4">
            <Icon name={getVisibilityIcon(snippet?.visibility)} size={18} color="var(--color-muted-foreground)" />
          </div>
        </div>

        <div className="relative bg-muted rounded-lg p-4 mb-4 font-mono text-sm overflow-x-auto">
          <button
            onClick={handleViewAIReport}
            className="absolute top-2 right-2 p-1.5 bg-gradient-to-r from-primary to-secondary hover:from-purple-700 hover:to-blue-700 rounded-md transition-all opacity-0 group-hover:opacity-100"
            title="View AI Optimization Report"
          >
            <Icon name="Sparkles" size={14} className="text-white" />
          </button>
          <pre className="text-foreground whitespace-pre-wrap break-words">
            <code>{snippet?.codePreview}</code>
          </pre>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Icon name="Heart" size={16} />
              <span className="text-sm">{snippet?.likes}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Icon name="MessageSquare" size={16} />
              <span className="text-sm">{snippet?.comments}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Icon name="Eye" size={16} />
              <span className="text-sm">{snippet?.views}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEditClick}
            >
              <Icon name="Edit" size={16} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeleteClick}
            >
              <Icon name="Trash2" size={16} className="text-destructive" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              iconName="Share2" 
              iconSize={16}
              onClick={(e) => {
                e?.stopPropagation();
                onShare?.(snippet?.id);
              }}
            >
              Share
            </Button>
          </div>
        </div>

        {snippet?.tags && snippet?.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
            {snippet?.tags?.map((tag, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md font-medium"
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

export default SnippetCard;