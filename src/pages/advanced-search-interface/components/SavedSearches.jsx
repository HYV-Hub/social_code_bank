import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

export default function SavedSearches({ savedSearches, onLoad, onDelete }) {
  if (savedSearches?.length === 0) {
    return (
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Saved Searches
        </h3>
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-4">
            <Icon name="Save" size={32} className="text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">
            No saved searches yet
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Saved Searches
      </h3>
      <div className="space-y-3">
        {savedSearches?.map((search) => (
          <div
            key={search?.id}
            className="p-4 bg-background rounded-lg hover:bg-muted transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-medium text-foreground flex-1">
                {search?.name}
              </h4>
              <button
                onClick={() => onDelete(search?.id)}
                className="text-error hover:text-error p-1"
              >
                <Icon name="Trash2" size={16} />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-3 line-clamp-1">
              {search?.query || 'Advanced search'}
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onLoad(search)}
              className="w-full"
            >
              <Icon name="Search" size={14} className="mr-2" />
              Run Search
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}