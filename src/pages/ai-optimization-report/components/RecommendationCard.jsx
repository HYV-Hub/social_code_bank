import React, { useState } from 'react';
import { ChevronDown, ChevronUp, AlertTriangle, Zap, Clock } from 'lucide-react';

const RecommendationCard = ({ recommendation }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'text-red-600 bg-red-50 border-red-200',
      medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      low: 'text-blue-600 bg-blue-50 border-blue-200'
    };
    return colors?.[priority] || colors?.low;
  };

  const getPriorityIcon = (priority) => {
    if (priority === 'high') return <AlertTriangle className="w-4 h-4" />;
    if (priority === 'medium') return <Zap className="w-4 h-4" />;
    return <Clock className="w-4 h-4" />;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-6 flex items-start justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex-1 text-left">
          <div className="flex items-center space-x-3 mb-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getPriorityColor(recommendation?.priority)}`}>
              {getPriorityIcon(recommendation?.priority)}
              <span>{recommendation?.priority?.toUpperCase()}</span>
            </span>
            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
              Effort: {recommendation?.effort}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {recommendation?.title}
          </h3>
          <p className="text-gray-600">{recommendation?.description}</p>
        </div>
        <div className="ml-4">
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="border-t bg-gray-50 p-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Implementation Steps:</h4>
          <ol className="space-y-3">
            {recommendation?.steps?.map((step, index) => (
              <li key={index} className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-medium">
                  {index + 1}
                </span>
                <p className="text-sm text-gray-700 pt-0.5">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
};

export default RecommendationCard;