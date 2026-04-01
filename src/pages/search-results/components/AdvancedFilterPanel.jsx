import React, { useState } from 'react';

import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/ui/Icon';

export default function AdvancedFilterPanel({ filters, onFilterChange, onClear, isOpen }) {
  const [expandedCategories, setExpandedCategories] = useState({});

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({ ...prev, [category]: !prev?.[category] }));
  };

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

  const sortOptions = [
    { value: 'relevance', label: 'Most Relevant' },
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'likes', label: 'Most Liked' },
    { value: 'views', label: 'Most Viewed' }
  ];

  const contentTypeOptions = [
    { value: 'all', label: 'All Content' },
    { value: 'snippets', label: 'Snippets Only' },
    { value: 'bugs', label: 'Bugs Only' },
    { value: 'users', label: 'Users Only' },
    { value: 'teams', label: 'Teams Only' }
  ];

  const statusOptions = [
    { value: 'open', label: 'Open' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'closed', label: 'Closed' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' }
  ];

  // 🎯 SOFTWARE-RELATED FILTER CATEGORIES (matching AI tags)

  // Framework/Library Tags
  const frameworkOptions = {
    frontend: [
      { value: 'react', label: 'React' },
      { value: 'vue', label: 'Vue.js' },
      { value: 'angular', label: 'Angular' },
      { value: 'svelte', label: 'Svelte' },
      { value: 'next.js', label: 'Next.js' },
      { value: 'nuxt', label: 'Nuxt' },
      { value: 'gatsby', label: 'Gatsby' }
    ],
    backend: [
      { value: 'express', label: 'Express' },
      { value: 'django', label: 'Django' },
      { value: 'flask', label: 'Flask' },
      { value: 'fastapi', label: 'FastAPI' },
      { value: 'spring', label: 'Spring' },
      { value: 'rails', label: 'Rails' },
      { value: 'laravel', label: 'Laravel' }
    ],
    styling: [
      { value: 'tailwind', label: 'Tailwind CSS' },
      { value: 'bootstrap', label: 'Bootstrap' },
      { value: 'material-ui', label: 'Material-UI' },
      { value: 'styled-components', label: 'Styled Components' },
      { value: 'sass', label: 'Sass/SCSS' }
    ],
    state: [
      { value: 'redux', label: 'Redux' },
      { value: 'zustand', label: 'Zustand' },
      { value: 'mobx', label: 'MobX' },
      { value: 'recoil', label: 'Recoil' },
      { value: 'jotai', label: 'Jotai' }
    ]
  };

  // UX/UI Component Tags
  const uxComponentOptions = [
    { value: 'navigation', label: 'Navigation/Navbar' },
    { value: 'modal', label: 'Modal/Dialog' },
    { value: 'dropdown', label: 'Dropdown' },
    { value: 'preloader', label: 'Preloader/Loading' },
    { value: 'animation', label: 'Animation' },
    { value: 'carousel', label: 'Carousel/Slider' },
    { value: 'form', label: 'Form' },
    { value: 'input', label: 'Input Field' },
    { value: 'button', label: 'Button' },
    { value: 'table', label: 'Table' },
    { value: 'chart', label: 'Chart/Graph' },
    { value: 'gallery', label: 'Gallery' },
    { value: 'card', label: 'Card' },
    { value: 'toast', label: 'Toast/Notification' },
    { value: 'tooltip', label: 'Tooltip' },
    { value: 'sidebar', label: 'Sidebar' },
    { value: 'tabs', label: 'Tabs' }
  ];

  // Purpose Tags (what code does)
  const purposeOptions = [
    { value: 'api-call', label: 'API Call' },
    { value: 'component', label: 'Component' },
    { value: 'middleware', label: 'Middleware' },
    { value: 'database-query', label: 'Database Query' },
    { value: 'utility-function', label: 'Utility Function' },
    { value: 'authentication', label: 'Authentication' },
    { value: 'authorization', label: 'Authorization' },
    { value: 'validation', label: 'Validation' },
    { value: 'error-handling', label: 'Error Handling' },
    { value: 'data-processing', label: 'Data Processing' },
    { value: 'file-handling', label: 'File Handling' }
  ];

  // Behavioral Tags (how code behaves)
  const behavioralOptions = [
    { value: 'async-flow', label: 'Async/Await' },
    { value: 'state-management', label: 'State Management' },
    { value: 'event-handling', label: 'Event Handling' },
    { value: 'caching', label: 'Caching' },
    { value: 'debouncing', label: 'Debouncing' },
    { value: 'throttling', label: 'Throttling' },
    { value: 'lazy-loading', label: 'Lazy Loading' },
    { value: 'memoization', label: 'Memoization' }
  ];

  // Database Tags
  const databaseOptions = [
    { value: 'sql-query', label: 'SQL Query' },
    { value: 'nosql-query', label: 'NoSQL Query' },
    { value: 'prisma-schema', label: 'Prisma' },
    { value: 'mongodb', label: 'MongoDB' },
    { value: 'postgresql', label: 'PostgreSQL' },
    { value: 'mysql', label: 'MySQL' },
    { value: 'orm', label: 'ORM' },
    { value: 'migration', label: 'Migration' },
    { value: 'indexing', label: 'Indexing' }
  ];

  // Security Tags
  const securityOptions = [
    { value: 'input-sanitization', label: 'Input Sanitization' },
    { value: 'auth-required', label: 'Auth Required' },
    { value: 'encryption', label: 'Encryption' },
    { value: 'xss-protection', label: 'XSS Protection' },
    { value: 'csrf-protection', label: 'CSRF Protection' },
    { value: 'sql-injection-safe', label: 'SQL Injection Safe' }
  ];

  // Performance Tags
  const performanceOptions = [
    { value: 'optimization', label: 'Optimized' },
    { value: 'virtualization', label: 'Virtualization' },
    { value: 'lazy-evaluation', label: 'Lazy Evaluation' },
    { value: 'batch-processing', label: 'Batch Processing' },
    { value: 'memory-efficient', label: 'Memory Efficient' }
  ];

  // Difficulty Level
  const difficultyOptions = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ];

  const handleTagToggle = (tag) => {
    const currentTags = filters?.aiTags || [];
    const newTags = currentTags?.includes(tag)
      ? currentTags?.filter(t => t !== tag)
      : [...currentTags, tag];
    onFilterChange('aiTags', newTags);
  };

  if (!isOpen) return null;

  return (
    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-border p-4 space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-border">
        <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
          <Icon name="Filter" size={18} className="text-primary" />
          Filter Options
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          iconName="X"
          className="text-error hover:text-error hover:bg-error/10"
        >
          Clear Filters
        </Button>
      </div>

      {/* COMPACT HORIZONTAL LAYOUT FOR KEY FILTERS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Sort By */}
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">
            Sort By
          </label>
          <Select
            value={filters?.sortBy || 'relevance'}
            onChange={(value) => onFilterChange('sortBy', value)}
            options={sortOptions}
          />
        </div>

        {/* Content Type */}
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">
            Content Type
          </label>
          <Select
            value={filters?.contentType || 'all'}
            onChange={(value) => onFilterChange('contentType', value)}
            options={contentTypeOptions}
          />
        </div>

        {/* Language Filter */}
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">
            Language
          </label>
          <Select
            value={filters?.language || 'all'}
            onChange={(value) => onFilterChange('language', value)}
            options={languageOptions}
          />
        </div>

        {/* Date Range Quick Filters */}
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">
            📅 Date Range
          </label>
          <Select
            value={filters?.dateRange || 'all'}
            onChange={(value) => onFilterChange('dateRange', value === 'all' ? null : value)}
            options={[
              { value: 'all', label: 'All Time' },
              { value: '24h', label: 'Last 24 hours' },
              { value: '7d', label: 'Last 7 days' },
              { value: '30d', label: 'Last 30 days' },
              { value: '90d', label: 'Last 90 days' }
            ]}
          />
        </div>
      </div>

      {/* 🎯 EXPANDABLE ADVANCED SECTIONS */}
      <div className="border-t pt-3 space-y-2">
        {/* AI TAG FILTERS - SOFTWARE CATEGORIES */}

        {/* Frameworks & Libraries */}
        <div className="bg-card rounded-md border border-border overflow-hidden">
          <button
            onClick={() => toggleCategory('frameworks')}
            className="flex items-center justify-between w-full px-3 py-2 text-xs font-medium text-foreground hover:bg-background transition-colors"
          >
            <span>🔧 Frameworks & Libraries</span>
            <span className={`transform transition-transform ${expandedCategories?.frameworks ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>
          
          {expandedCategories?.frameworks && (
            <div className="px-3 pb-2 space-y-2 bg-background">
              {/* Frontend Frameworks */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Frontend</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
                  {frameworkOptions?.frontend?.map((option) => (
                    <Checkbox
                      key={option?.value}
                      label={option?.label}
                      checked={filters?.aiTags?.includes(option?.value)}
                      onChange={() => handleTagToggle(option?.value)}
                    />
                  ))}
                </div>
              </div>

              {/* Backend Frameworks */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Backend</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
                  {frameworkOptions?.backend?.map((option) => (
                    <Checkbox
                      key={option?.value}
                      label={option?.label}
                      checked={filters?.aiTags?.includes(option?.value)}
                      onChange={() => handleTagToggle(option?.value)}
                    />
                  ))}
                </div>
              </div>

              {/* Styling Libraries */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Styling</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
                  {frameworkOptions?.styling?.map((option) => (
                    <Checkbox
                      key={option?.value}
                      label={option?.label}
                      checked={filters?.aiTags?.includes(option?.value)}
                      onChange={() => handleTagToggle(option?.value)}
                    />
                  ))}
                </div>
              </div>

              {/* State Management */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">State Management</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
                  {frameworkOptions?.state?.map((option) => (
                    <Checkbox
                      key={option?.value}
                      label={option?.label}
                      checked={filters?.aiTags?.includes(option?.value)}
                      onChange={() => handleTagToggle(option?.value)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* UX/UI Components */}
        <div className="bg-card rounded-md border border-border overflow-hidden">
          <button
            onClick={() => toggleCategory('ux')}
            className="flex items-center justify-between w-full px-3 py-2 text-xs font-medium text-foreground hover:bg-background transition-colors"
          >
            <span>🎨 UX/UI Components</span>
            <span className={`transform transition-transform ${expandedCategories?.ux ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>
          
          {expandedCategories?.ux && (
            <div className="px-3 pb-2 bg-background">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
                {uxComponentOptions?.map((option) => (
                  <Checkbox
                    key={option?.value}
                    label={option?.label}
                    checked={filters?.aiTags?.includes(option?.value)}
                    onChange={() => handleTagToggle(option?.value)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Purpose/Functionality */}
        <div className="bg-card rounded-md border border-border overflow-hidden">
          <button
            onClick={() => toggleCategory('purpose')}
            className="flex items-center justify-between w-full px-3 py-2 text-xs font-medium text-foreground hover:bg-background transition-colors"
          >
            <span>🎯 Purpose/Functionality</span>
            <span className={`transform transition-transform ${expandedCategories?.purpose ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>
          
          {expandedCategories?.purpose && (
            <div className="px-3 pb-2 bg-background">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
                {purposeOptions?.map((option) => (
                  <Checkbox
                    key={option?.value}
                    label={option?.label}
                    checked={filters?.aiTags?.includes(option?.value)}
                    onChange={() => handleTagToggle(option?.value)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Behavioral Patterns */}
        <div className="bg-card rounded-md border border-border overflow-hidden">
          <button
            onClick={() => toggleCategory('behavioral')}
            className="flex items-center justify-between w-full px-3 py-2 text-xs font-medium text-foreground hover:bg-background transition-colors"
          >
            <span>⚡ Behavioral Patterns</span>
            <span className={`transform transition-transform ${expandedCategories?.behavioral ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>
          
          {expandedCategories?.behavioral && (
            <div className="px-3 pb-2 bg-background">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
                {behavioralOptions?.map((option) => (
                  <Checkbox
                    key={option?.value}
                    label={option?.label}
                    checked={filters?.aiTags?.includes(option?.value)}
                    onChange={() => handleTagToggle(option?.value)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Database */}
        <div className="bg-card rounded-md border border-border overflow-hidden">
          <button
            onClick={() => toggleCategory('database')}
            className="flex items-center justify-between w-full px-3 py-2 text-xs font-medium text-foreground hover:bg-background transition-colors"
          >
            <span>🗄️ Database</span>
            <span className={`transform transition-transform ${expandedCategories?.database ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>
          
          {expandedCategories?.database && (
            <div className="px-3 pb-2 bg-background">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
                {databaseOptions?.map((option) => (
                  <Checkbox
                    key={option?.value}
                    label={option?.label}
                    checked={filters?.aiTags?.includes(option?.value)}
                    onChange={() => handleTagToggle(option?.value)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Security */}
        <div className="bg-card rounded-md border border-border overflow-hidden">
          <button
            onClick={() => toggleCategory('security')}
            className="flex items-center justify-between w-full px-3 py-2 text-xs font-medium text-foreground hover:bg-background transition-colors"
          >
            <span>🔒 Security</span>
            <span className={`transform transition-transform ${expandedCategories?.security ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>
          
          {expandedCategories?.security && (
            <div className="px-3 pb-2 bg-background">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
                {securityOptions?.map((option) => (
                  <Checkbox
                    key={option?.value}
                    label={option?.label}
                    checked={filters?.aiTags?.includes(option?.value)}
                    onChange={() => handleTagToggle(option?.value)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Performance */}
        <div className="bg-card rounded-md border border-border overflow-hidden">
          <button
            onClick={() => toggleCategory('performance')}
            className="flex items-center justify-between w-full px-3 py-2 text-xs font-medium text-foreground hover:bg-background transition-colors"
          >
            <span>⚡ Performance</span>
            <span className={`transform transition-transform ${expandedCategories?.performance ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>
          
          {expandedCategories?.performance && (
            <div className="px-3 pb-2 bg-background">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
                {performanceOptions?.map((option) => (
                  <Checkbox
                    key={option?.value}
                    label={option?.label}
                    checked={filters?.aiTags?.includes(option?.value)}
                    onChange={() => handleTagToggle(option?.value)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Difficulty Level */}
        <div className="bg-card rounded-md border border-border overflow-hidden">
          <label className="block text-xs font-medium text-foreground mb-2 px-3 py-2">
            📊 Difficulty Level
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-1 px-3 pb-2">
            {difficultyOptions?.map((option) => (
              <Checkbox
                key={option?.value}
                label={option?.label}
                checked={filters?.aiTags?.includes(option?.value)}
                onChange={() => handleTagToggle(option?.value)}
              />
            ))}
          </div>
        </div>

        {/* Bug Status (only for bugs) */}
        {(filters?.contentType === 'bugs' || filters?.contentType === 'all') && (
          <div className="bg-card rounded-md border border-border overflow-hidden">
            <label className="block text-xs font-medium text-foreground mb-2 px-3 py-2">
              Bug Status
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-1 px-3 pb-2">
              {statusOptions?.map((option) => (
                <Checkbox
                  key={option?.value}
                  label={option?.label}
                  checked={filters?.bugStatus?.includes(option?.value)}
                  onChange={(checked) => {
                    const newStatuses = checked
                      ? [...(filters?.bugStatus || []), option?.value]
                      : (filters?.bugStatus || [])?.filter(s => s !== option?.value);
                    onFilterChange('bugStatus', newStatuses);
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Bug Priority (only for bugs) */}
        {(filters?.contentType === 'bugs' || filters?.contentType === 'all') && (
          <div className="bg-card rounded-md border border-border overflow-hidden">
            <label className="block text-xs font-medium text-foreground mb-2 px-3 py-2">
              Bug Priority
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-1 px-3 pb-2">
              {priorityOptions?.map((option) => (
                <Checkbox
                  key={option?.value}
                  label={option?.label}
                  checked={filters?.bugPriority?.includes(option?.value)}
                  onChange={(checked) => {
                    const newPriorities = checked
                      ? [...(filters?.bugPriority || []), option?.value]
                      : (filters?.bugPriority || [])?.filter(p => p !== option?.value);
                    onFilterChange('bugPriority', newPriorities);
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Selected Tags Summary */}
      {filters?.aiTags?.length > 0 && (
        <div className="border-t pt-3">
          <p className="text-xs font-medium text-foreground mb-2">
            Selected Tags ({filters?.aiTags?.length})
          </p>
          <div className="flex flex-wrap gap-1">
            {filters?.aiTags?.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-1 bg-primary/15 text-foreground text-xs rounded-full"
              >
                {tag}
                <button
                  onClick={() => handleTagToggle(tag)}
                  className="hover:text-foreground font-bold"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}