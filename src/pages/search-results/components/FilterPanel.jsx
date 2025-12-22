import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import Button from '../../../components/ui/Button';

const FilterPanel = ({ filters, setFilters, onApplyFilters, isMobile, isOpen, onClose }) => {
  const contentTypes = [
    { value: 'all', label: 'All Content' },
    { value: 'snippets', label: 'Code Snippets' },
    { value: 'bugs', label: 'Bug Reports' },
    { value: 'users', label: 'Users' },
    { value: 'teams', label: 'Teams' }
  ];

  const languages = [
    { value: 'all', label: 'All Languages' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'cpp', label: 'C++' },
    { value: 'csharp', label: 'C#' },
    { value: 'go', label: 'Go' },
    { value: 'rust', label: 'Rust' }
  ];

  const dateRanges = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'Past Week' },
    { value: 'month', label: 'Past Month' },
    { value: 'year', label: 'Past Year' }
  ];

  const bugStatuses = [
    { value: 'open', label: 'Open' },
    { value: 'in-review', label: 'In Review' },
    { value: 'fix-submitted', label: 'Fix Submitted' },
    { value: 'resolved', label: 'Resolved' }
  ];

  const visibilityOptions = [
    { value: 'public', label: 'Public' },
    { value: 'team', label: 'Team Only' },
    { value: 'company', label: 'Company' },
    { value: 'private', label: 'Private' }
  ];

  const handleReset = () => {
    setFilters({
      contentType: 'all',
      language: 'all',
      dateRange: 'all',
      bugStatus: [],
      visibility: [],
      hasComments: false,
      hasAttachments: false
    });
  };

  const panelContent = (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Filters</h3>
        {isMobile && (
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <Icon name="X" size={20} />
          </button>
        )}
      </div>

      <div className="space-y-4">
        <Select
          label="Content Type"
          options={contentTypes}
          value={filters?.contentType}
          onChange={(value) => setFilters({ ...filters, contentType: value })}
        />

        <Select
          label="Programming Language"
          options={languages}
          value={filters?.language}
          onChange={(value) => setFilters({ ...filters, language: value })}
        />

        <Select
          label="Date Range"
          options={dateRanges}
          value={filters?.dateRange}
          onChange={(value) => setFilters({ ...filters, dateRange: value })}
        />

        {filters?.contentType === 'bugs' && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Bug Status
            </label>
            <div className="space-y-2">
              {bugStatuses?.map((status) => (
                <Checkbox
                  key={status?.value}
                  label={status?.label}
                  checked={filters?.bugStatus?.includes(status?.value)}
                  onChange={(e) => {
                    if (e?.target?.checked) {
                      setFilters({
                        ...filters,
                        bugStatus: [...filters?.bugStatus, status?.value]
                      });
                    } else {
                      setFilters({
                        ...filters,
                        bugStatus: filters?.bugStatus?.filter(s => s !== status?.value)
                      });
                    }
                  }}
                />
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Visibility
          </label>
          <div className="space-y-2">
            {visibilityOptions?.map((option) => (
              <Checkbox
                key={option?.value}
                label={option?.label}
                checked={filters?.visibility?.includes(option?.value)}
                onChange={(e) => {
                  if (e?.target?.checked) {
                    setFilters({
                      ...filters,
                      visibility: [...filters?.visibility, option?.value]
                    });
                  } else {
                    setFilters({
                      ...filters,
                      visibility: filters?.visibility?.filter(v => v !== option?.value)
                    });
                  }
                }}
              />
            ))}
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-border">
          <Checkbox
            label="Has Comments"
            checked={filters?.hasComments}
            onChange={(e) => setFilters({ ...filters, hasComments: e?.target?.checked })}
          />
          <Checkbox
            label="Has Attachments"
            checked={filters?.hasAttachments}
            onChange={(e) => setFilters({ ...filters, hasAttachments: e?.target?.checked })}
          />
        </div>
      </div>

      <div className="flex gap-2 pt-4 border-t border-border">
        <Button
          variant="outline"
          onClick={handleReset}
          className="flex-1"
        >
          Reset
        </Button>
        <Button
          variant="default"
          onClick={() => {
            onApplyFilters();
            if (isMobile) onClose();
          }}
          className="flex-1"
        >
          Apply Filters
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <>
        {isOpen && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40" onClick={onClose} />
        )}
        <div
          className={`fixed top-0 right-0 h-full w-80 bg-card border-l border-border shadow-xl z-50 transform transition-transform duration-300 ${
            isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="h-full overflow-y-auto p-6">
            {panelContent}
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6 sticky top-20">
      {panelContent}
    </div>
  );
};

export default FilterPanel;