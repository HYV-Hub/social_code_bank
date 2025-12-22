import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

export default function SearchForm({ searchQuery, onQueryChange, onSearch, loading }) {
  const handleSubmit = (e) => {
    e?.preventDefault();
    onSearch();
  };

  const contentTypes = [
    { value: 'all', label: 'All Content' },
    { value: 'snippets', label: 'Snippets' },
    { value: 'hives', label: 'Hives' },
    { value: 'collections', label: 'Collections' },
    { value: 'bugs', label: 'Discussions' }
  ];

  const languages = [
    { value: '', label: 'Any Language' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'csharp', label: 'C#' },
    { value: 'ruby', label: 'Ruby' },
    { value: 'go', label: 'Go' },
    { value: 'rust', label: 'Rust' },
    { value: 'typescript', label: 'TypeScript' }
  ];

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="space-y-6">
        {/* Main Search Query */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Query
          </label>
          <div className="relative">
            <Input
              type="text"
              value={searchQuery?.query}
              onChange={(e) => onQueryChange({ ...searchQuery, query: e?.target?.value })}
              placeholder="Search for snippets, hives, collections..."
              className="pr-10"
            />
            <Icon
              name="Search"
              size={20}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
          </div>
        </div>

        {/* Content Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content Type
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {contentTypes?.map((type) => (
              <button
                key={type?.value}
                type="button"
                onClick={() => onQueryChange({ ...searchQuery, contentType: type?.value })}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  searchQuery?.contentType === type?.value
                    ? 'bg-purple-600 text-white' :'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type?.label}
              </button>
            ))}
          </div>
        </div>

        {/* Language Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Programming Language
          </label>
          <select
            value={searchQuery?.language}
            onChange={(e) => onQueryChange({ ...searchQuery, language: e?.target?.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {languages?.map((lang) => (
              <option key={lang?.value} value={lang?.value}>
                {lang?.label}
              </option>
            ))}
          </select>
        </div>

        {/* Author Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Author Name
          </label>
          <Input
            type="text"
            value={searchQuery?.authorName}
            onChange={(e) => onQueryChange({ ...searchQuery, authorName: e?.target?.value })}
            placeholder="Search by author username or name"
          />
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From Date
            </label>
            <Input
              type="date"
              value={searchQuery?.dateRange?.from || ''}
              onChange={(e) =>
                onQueryChange({
                  ...searchQuery,
                  dateRange: { ...searchQuery?.dateRange, from: e?.target?.value }
                })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              To Date
            </label>
            <Input
              type="date"
              value={searchQuery?.dateRange?.to || ''}
              onChange={(e) =>
                onQueryChange({
                  ...searchQuery,
                  dateRange: { ...searchQuery?.dateRange, to: e?.target?.value }
                })
              }
            />
          </div>
        </div>

        {/* Engagement Thresholds */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Minimum Engagement
          </label>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Views</label>
              <Input
                type="number"
                min="0"
                value={searchQuery?.engagementMin?.views}
                onChange={(e) =>
                  onQueryChange({
                    ...searchQuery,
                    engagementMin: {
                      ...searchQuery?.engagementMin,
                      views: parseInt(e?.target?.value || '0')
                    }
                  })
                }
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Likes</label>
              <Input
                type="number"
                min="0"
                value={searchQuery?.engagementMin?.likes}
                onChange={(e) =>
                  onQueryChange({
                    ...searchQuery,
                    engagementMin: {
                      ...searchQuery?.engagementMin,
                      likes: parseInt(e?.target?.value || '0')
                    }
                  })
                }
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Comments</label>
              <Input
                type="number"
                min="0"
                value={searchQuery?.engagementMin?.comments}
                onChange={(e) =>
                  onQueryChange({
                    ...searchQuery,
                    engagementMin: {
                      ...searchQuery?.engagementMin,
                      comments: parseInt(e?.target?.value || '0')
                    }
                  })
                }
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* Search Button */}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Searching...
            </>
          ) : (
            <>
              <Icon name="Search" size={18} className="mr-2" />
              Search
            </>
          )}
        </Button>
      </div>
    </form>
  );
}