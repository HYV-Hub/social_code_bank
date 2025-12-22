import React from 'react';
import Icon from '../../../components/AppIcon';

const SortControls = ({ sortBy, setSortBy }) => {
  const sortOptions = [
    { value: 'relevance', label: 'Relevance', icon: 'Target' },
    { value: 'recent', label: 'Most Recent', icon: 'Clock' },
    { value: 'popular', label: 'Most Popular', icon: 'TrendingUp' },
    { value: 'author', label: 'Author A-Z', icon: 'User' }
  ];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm font-medium text-muted-foreground">Sort by:</span>
      <div className="flex gap-2">
        {sortOptions?.map((option) => (
          <button
            key={option?.value}
            onClick={() => setSortBy(option?.value)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
              sortBy === option?.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            <Icon name={option?.icon} size={14} />
            {option?.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SortControls;