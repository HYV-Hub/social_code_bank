import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const AdvancedFilterPanel = ({ onApplyFilters, onClearFilters, initialFilters = {} }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState({
    contentType: initialFilters?.contentType || 'all', // 'all', 'snippets', 'bugs'
    searchQuery: initialFilters?.searchQuery || '',
    aiTags: initialFilters?.aiTags || '',
    language: initialFilters?.language || 'all',
    hasFixedCode: initialFilters?.hasFixedCode || 'all', // 'all', 'yes', 'no'
    bugStatus: initialFilters?.bugStatus || 'all',
    bugPriority: initialFilters?.bugPriority || 'all',
    sortBy: initialFilters?.sortBy || 'recent'
  });

  const languageOptions = [
    { value: 'all', label: 'All Languages' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
    { value: 'csharp', label: 'C#' },
    { value: 'ruby', label: 'Ruby' },
    { value: 'go', label: 'Go' },
    { value: 'rust', label: 'Rust' },
    { value: 'php', label: 'PHP' },
    { value: 'sql', label: 'SQL' }
  ];

  const bugStatusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'open', label: 'Open' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'closed', label: 'Closed' }
  ];

  const bugPriorityOptions = [
    { value: 'all', label: 'All Priorities' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' }
  ];

  const sortByOptions = [
    { value: 'recent', label: 'Most Recent' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'views', label: 'Most Viewed' }
  ];

  const contentTypeOptions = [
    { value: 'all', label: 'All Content' },
    { value: 'snippets', label: 'Snippets Only' },
    { value: 'bugs', label: 'Bugs Only' }
  ];

  const hasFixedCodeOptions = [
    { value: 'all', label: 'All' },
    { value: 'yes', label: 'Has Fix' },
    { value: 'no', label: 'No Fix Yet' }
  ];

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    onApplyFilters?.(filters);
    setIsExpanded(false);
  };

  const handleClear = () => {
    const clearedFilters = {
      contentType: 'all',
      searchQuery: '',
      aiTags: '',
      language: 'all',
      hasFixedCode: 'all',
      bugStatus: 'all',
      bugPriority: 'all',
      sortBy: 'recent'
    };
    setFilters(clearedFilters);
    onClearFilters?.();
  };

  const activeFilterCount = Object.entries(filters)?.filter(
    ([key, value]) => value && value !== 'all' && value !== ''
  )?.length;

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Filter Header */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <Icon name="Filter" size={20} className="text-accent" />
          <div>
            <h3 className="font-semibold text-foreground">Advanced Filters</h3>
            <p className="text-xs text-muted-foreground">
              Filter snippets and bug fixes by tags, language, and more
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {activeFilterCount > 0 && (
            <span className="px-2 py-1 text-xs font-medium bg-accent/10 text-accent rounded-full">
              {activeFilterCount} active
            </span>
          )}
          <Icon 
            name={isExpanded ? "ChevronUp" : "ChevronDown"} 
            size={20} 
            className="text-muted-foreground"
          />
        </div>
      </div>

      {/* Filter Content */}
      {isExpanded && (
        <div className="border-t border-border p-4 space-y-4 bg-muted/20">
          {/* Content Type Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Content Type
              </label>
              <Select
                options={contentTypeOptions}
                value={filters?.contentType}
                onChange={(value) => handleFilterChange('contentType', value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Sort By
              </label>
              <Select
                options={sortByOptions}
                value={filters?.sortBy}
                onChange={(value) => handleFilterChange('sortBy', value)}
              />
            </div>
          </div>

          {/* Search Fields */}
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <Icon name="Search" size={16} className="inline mr-2" />
                Search by Title or Description
              </label>
              <Input
                type="text"
                placeholder="Search for keywords..."
                value={filters?.searchQuery}
                onChange={(e) => handleFilterChange('searchQuery', e?.target?.value)}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <Icon name="Tag" size={16} className="inline mr-2" />
                AI Tags (comma-separated)
              </label>
              <Input
                type="text"
                placeholder="e.g., react, async, performance"
                value={filters?.aiTags}
                onChange={(e) => handleFilterChange('aiTags', e?.target?.value)}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter multiple tags separated by commas
              </p>
            </div>
          </div>

          {/* Language and Fix Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Programming Language
              </label>
              <Select
                options={languageOptions}
                value={filters?.language}
                onChange={(value) => handleFilterChange('language', value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Fixed Code Status
              </label>
              <Select
                options={hasFixedCodeOptions}
                value={filters?.hasFixedCode}
                onChange={(value) => handleFilterChange('hasFixedCode', value)}
              />
            </div>
          </div>

          {/* Bug-Specific Filters (show when contentType is 'bugs' or 'all') */}
          {(filters?.contentType === 'bugs' || filters?.contentType === 'all') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  <Icon name="Bug" size={16} className="inline mr-2" />
                  Bug Status
                </label>
                <Select
                  options={bugStatusOptions}
                  value={filters?.bugStatus}
                  onChange={(value) => handleFilterChange('bugStatus', value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  <Icon name="AlertCircle" size={16} className="inline mr-2" />
                  Bug Priority
                </label>
                <Select
                  options={bugPriorityOptions}
                  value={filters?.bugPriority}
                  onChange={(value) => handleFilterChange('bugPriority', value)}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button
              variant="ghost"
              onClick={handleClear}
              className="text-muted-foreground"
            >
              Clear All
            </Button>
            <Button
              onClick={handleApply}
              className="bg-accent hover:bg-accent/90"
            >
              <Icon name="Check" size={16} className="mr-2" />
              Apply Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedFilterPanel;