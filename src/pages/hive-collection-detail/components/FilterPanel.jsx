import React from 'react';
import { Search, Filter } from 'lucide-react';

const FilterPanel = ({ filters, onFilterChange }) => {
  const languages = [
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
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
    { value: 'sql', label: 'SQL' },
    { value: 'other', label: 'Other' }
  ];

  const handleSearchChange = (e) => {
    onFilterChange({
      ...filters,
      search: e?.target?.value
    });
  };

  const handleLanguageChange = (e) => {
    onFilterChange({
      ...filters,
      language: e?.target?.value
    });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 w-full">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search snippets..."
          value={filters?.search || ''}
          onChange={handleSearchChange}
          className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
        />
      </div>

      {/* Language Filter */}
      <div className="relative sm:w-48">
        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
        <select
          value={filters?.language || 'all'}
          onChange={handleLanguageChange}
          className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent appearance-none bg-card transition-all cursor-pointer"
        >
          {languages?.map(lang => (
            <option key={lang?.value} value={lang?.value}>
              {lang?.label}
            </option>
          ))}
        </select>
      </div>

      {/* Clear Filters */}
      {(filters?.search || filters?.language !== 'all') && (
        <button
          onClick={() => onFilterChange({ search: '', language: 'all' })}
          className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-background transition-colors"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
};

export default FilterPanel;