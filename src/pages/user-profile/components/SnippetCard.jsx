import React from 'react';
import Icon from '../../../components/AppIcon';
import { useNavigate } from 'react-router-dom';

const SnippetCard = ({ snippet }) => {
  const navigate = useNavigate();

  // Navigate to snippet details on click
  const handleCardClick = () => {
    navigate(`/snippet-details?id=${snippet?.id}`);
  };

  // Navigate to snippet details (edit button will be there)
  const handleEditClick = (e) => {
    e?.stopPropagation();
    navigate(`/snippet-details?id=${snippet?.id}`);
  };

  return (
    <div 
      onClick={handleCardClick}
      className="bg-card rounded-lg border border-border p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group"
    >
      {/* Header with actions */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-medium text-foreground group-hover:text-accent transition-colors mb-2">
            {snippet?.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{snippet?.description}</p>
        </div>
        <div className="flex items-center gap-2 ml-4">
          {/* Edit Button - navigates to details page */}
          <button
            onClick={handleEditClick}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title="View snippet details"
          >
            <Icon name="Edit" size={16} className="text-muted-foreground hover:text-foreground" />
          </button>
          
          {/* Visibility Indicator */}
          <div className={`p-2 rounded-lg ${
            snippet?.visibility === 'public' ?'bg-success/10 text-success' :'bg-warning/10 text-warning'
          }`}>
            <Icon 
              name={snippet?.visibility === 'public' ? 'Globe' : 'Lock'} 
              size={16}
            />
          </div>
        </div>
      </div>

      {/* Language Tag */}
      <div className="flex items-center gap-2 mb-4">
        <span className="px-3 py-1 bg-accent/10 text-accent text-xs rounded-full">
          {snippet?.language}
        </span>
      </div>

      {/* Code Preview */}
      <div className="bg-muted rounded-lg p-4 mb-4 overflow-hidden">
        <pre className="text-sm text-muted-foreground line-clamp-3 overflow-x-auto">
          <code>{snippet?.codePreview}</code>
        </pre>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {snippet?.tags?.slice(0, 3)?.map((tag, index) => (
          <span
            key={index}
            className="px-2 py-1 bg-secondary/50 text-xs rounded"
          >
            #{tag}
          </span>
        ))}
        {snippet?.tags?.length > 3 && (
          <span className="px-2 py-1 text-xs text-muted-foreground">
            +{snippet?.tags?.length - 3} more
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Icon name="Heart" size={16} />
          <span>{snippet?.likes}</span>
        </div>
        <div className="flex items-center gap-1">
          <Icon name="MessageSquare" size={16} />
          <span>{snippet?.comments}</span>
        </div>
        <div className="flex items-center gap-1">
          <Icon name="Eye" size={16} />
          <span>{snippet?.views}</span>
        </div>
        <div className="ml-auto text-xs">
          {snippet?.createdAt?.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })}
        </div>
      </div>
    </div>
  );
};

export default SnippetCard;