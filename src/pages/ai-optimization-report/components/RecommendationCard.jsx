import React, { useState } from 'react';
import { ChevronDown, ChevronUp, AlertTriangle, Zap, Clock } from 'lucide-react';

const RecommendationCard = ({ recommendation }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'text-error bg-error/10 border-error/20',
      medium: 'text-warning bg-warning/10 border-warning/20',
      low: 'text-primary bg-primary/10 border-primary/20'
    };
    return colors?.[priority] || colors?.low;
  };

  const getPriorityIcon = (priority) => {
    if (priority === 'high') return <AlertTriangle className="w-4 h-4" />;
    if (priority === 'medium') return <Zap className="w-4 h-4" />;
    return <Clock className="w-4 h-4" />;
  };

  return (
    <div className="bg-card rounded-lg shadow-lg overflow-hidden border border-border">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-6 flex items-start justify-between hover:bg-background transition-colors"
      >
        <div className="flex-1 text-left">
          <div className="flex items-center space-x-3 mb-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getPriorityColor(recommendation?.priority)}`}>
              {getPriorityIcon(recommendation?.priority)}
              <span>{recommendation?.priority?.toUpperCase()}</span>
            </span>
            <span className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-xs font-medium">
              Effort: {recommendation?.effort}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {recommendation?.title}
          </h3>
          <p className="text-muted-foreground">{recommendation?.description}</p>
        </div>
        <div className="ml-4">
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="border-t bg-background p-6">
          <h4 className="text-sm font-semibold text-foreground mb-3">Implementation Steps:</h4>
          <ol className="space-y-3">
            {recommendation?.steps?.map((step, index) => (
              <li key={index} className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-medium">
                  {index + 1}
                </span>
                <p className="text-sm text-foreground pt-0.5">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
};

export default RecommendationCard;