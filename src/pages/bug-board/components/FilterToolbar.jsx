import React from 'react';
import Icon from '../../../components/AppIcon';

const FilterToolbar = ({ filters, onFilterChange, onClearFilters, teamMembers, onCreateBug }) => {
  const priorities = [
    { value: 'all', label: 'All Priorities' },
    { value: 'critical', label: 'Critical' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' }
  ];

  const languages = [
    { value: 'all', label: 'All Languages' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'csharp', label: 'C#' },
    { value: 'ruby', label: 'Ruby' },
    { value: 'go', label: 'Go' },
    { value: 'php', label: 'PHP' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <div className="bg-card rounded-lg border border-border p-4 mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Bar */}
        <div className="flex-1">
          <div className="relative">
            <Icon
              name="Search"
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              placeholder="Search bugs..."
              value={filters?.search || ''}
              onChange={(e) => onFilterChange('search', e?.target?.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            />
          </div>
        </div>

        {/* Priority Filter */}
        <div className="w-full lg:w-48">
          <select
            value={filters?.priority || 'all'}
            onChange={(e) => onFilterChange('priority', e?.target?.value)}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          >
            {priorities?.map((priority) => (
              <option key={priority?.value} value={priority?.value}>
                {priority?.label}
              </option>
            ))}
          </select>
        </div>

        {/* Language Filter */}
        <div className="w-full lg:w-48">
          <select
            value={filters?.language || 'all'}
            onChange={(e) => onFilterChange('language', e?.target?.value)}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          >
            {languages?.map((lang) => (
              <option key={lang?.value} value={lang?.value}>
                {lang?.label}
              </option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={onClearFilters}
            className="px-4 py-2 border border-border rounded-lg text-muted-foreground hover:bg-muted transition-colors flex items-center gap-2"
          >
            <Icon name="X" size={18} />
            Clear
          </button>
          <button
            onClick={onCreateBug}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary transition-colors flex items-center gap-2"
          >
            <Icon name="Plus" size={18} />
            New Bug
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterToolbar;