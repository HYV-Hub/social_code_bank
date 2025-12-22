import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const EmptyState = ({ searchQuery, onClearFilters }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
        <Icon name="Search" size={48} className="text-muted-foreground" />
      </div>
      
      <h3 className="text-2xl font-semibold text-foreground mb-2">
        No results found
      </h3>
      
      <p className="text-muted-foreground text-center max-w-md mb-6">
        We couldn't find any results for "{searchQuery}". Try adjusting your search terms or filters.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="outline"
          iconName="RotateCcw"
          iconPosition="left"
          onClick={onClearFilters}
        >
          Clear Filters
        </Button>
        <Button
          variant="default"
          iconName="Plus"
          iconPosition="left"
          onClick={() => window.location.href = '/create-snippet'}
        >
          Create Snippet
        </Button>
      </div>

      <div className="mt-8 text-sm text-muted-foreground">
        <p className="mb-2 font-medium">Search tips:</p>
        <ul className="space-y-1 list-disc list-inside">
          <li>Check your spelling</li>
          <li>Try more general keywords</li>
          <li>Use fewer filters</li>
          <li>Search for related terms</li>
        </ul>
      </div>
    </div>
  );
};

export default EmptyState;