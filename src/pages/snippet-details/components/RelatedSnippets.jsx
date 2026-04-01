import React from 'react';
import Icon from '../../../components/AppIcon';


import { useNavigate } from 'react-router-dom';

export default function RelatedSnippets({ snippets = [] }) {
  const navigate = useNavigate();

  if (snippets?.length === 0) {
    return null;
  }

  return (
    <div className="bg-card rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4">Related Snippets</h3>
      <div className="space-y-4">
        {snippets?.map((snippet) => (
          <div
            key={snippet?.id}
            onClick={() => navigate(`/snippet-details/${snippet?.id}`)}
            className="flex items-start space-x-4 p-4 hover:bg-background rounded-lg cursor-pointer transition-colors"
          >
            <img
              src={snippet?.author?.avatar || '/assets/images/no_image.png'}
              alt={snippet?.author?.name || 'User'}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-foreground truncate">
                {snippet?.title}
              </h4>
              <p className="text-sm text-muted-foreground">
                by {snippet?.author?.name || 'Anonymous'}
              </p>
              <div className="flex items-center space-x-4 mt-2">
                <span className="text-sm text-muted-foreground flex items-center">
                  <Icon name="Heart" size={12} />
                  <span>{snippet?.likes}</span>
                </span>
                {snippet?.tags && snippet?.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {snippet?.tags?.slice(0, 2)?.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-1 bg-muted text-foreground rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}