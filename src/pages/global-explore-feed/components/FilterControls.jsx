import React from 'react';

export default function FilterControls({ activeFilters, onFilterChange }) {
  const contentTypes = [
    { value: 'all', label: 'All Content' },
    { value: 'snippets', label: 'Snippets' },
    { value: 'discussions', label: 'Discussions' },
    { value: 'collections', label: 'Collections' }
  ];

  const languages = [
    { value: 'all', label: 'All Languages' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'csharp', label: 'C#' },
    { value: 'ruby', label: 'Ruby' },
    { value: 'go', label: 'Go' },
    { value: 'rust', label: 'Rust' },
    { value: 'typescript', label: 'TypeScript' }
  ];

  const recencyOptions = [
    { value: 'all', label: 'All Time' },
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' }
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Content Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content Type
          </label>
          <select
            value={activeFilters?.contentType}
            onChange={(e) => onFilterChange('contentType', e?.target?.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {contentTypes?.map((type) => (
              <option key={type?.value} value={type?.value}>
                {type?.label}
              </option>
            ))}
          </select>
        </div>

        {/* Language Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Programming Language
          </label>
          <select
            value={activeFilters?.language}
            onChange={(e) => onFilterChange('language', e?.target?.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {languages?.map((lang) => (
              <option key={lang?.value} value={lang?.value}>
                {lang?.label}
              </option>
            ))}
          </select>
        </div>

        {/* Recency Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Recency
          </label>
          <select
            value={activeFilters?.recency}
            onChange={(e) => onFilterChange('recency', e?.target?.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {recencyOptions?.map((option) => (
              <option key={option?.value} value={option?.value}>
                {option?.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}