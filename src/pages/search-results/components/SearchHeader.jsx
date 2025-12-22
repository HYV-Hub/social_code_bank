import React, { useState, useEffect } from 'react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import { exploreService } from '../../../services/exploreService';

const SearchHeader = ({ query, searchQuery, setSearchQuery, onSearch, resultCount, resultCounts }) => {
  const [tagSuggestions, setTagSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  // Load tag suggestions when query changes
  useEffect(() => {
    const loadTagSuggestions = async () => {
      if (!searchQuery || searchQuery?.length < 2) {
        setTagSuggestions([]);
        return;
      }

      try {
        setIsLoadingSuggestions(true);
        const suggestions = await exploreService?.getTagSuggestions(searchQuery, 5);
        setTagSuggestions(suggestions || []);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error loading tag suggestions:', error);
      } finally {
        setIsLoadingSuggestions(false);
      }
    };

    // Debounce the suggestion loading
    const timeoutId = setTimeout(loadTagSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleKeyPress = (e) => {
    if (e?.key === 'Enter') {
      setShowSuggestions(false);
      onSearch();
    }
  };

  const handleTagClick = (tag) => {
    setSearchQuery(tag);
    setShowSuggestions(false);
    onSearch();
  };

  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">
            {query ? `Search Results for "${query}"` : 'Explore Code Snippets'}
          </h1>
          <p className="text-blue-100 text-lg">
            {resultCount > 0 
              ? `Found ${resultCount} result${resultCount !== 1 ? 's' : ''}`
              : 'Discover and learn from the community'
            }
          </p>
        </div>

        <div className="relative max-w-3xl mx-auto">
          <div className="relative">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e?.target?.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search snippets, bugs, users, teams... (e.g., 'bespoke gallery')"
              className="w-full pl-12 pr-24 py-4 text-lg rounded-xl border-2 border-blue-400 focus:border-white focus:ring-4 focus:ring-blue-300 bg-white/95 text-gray-900 placeholder-gray-500"
            />
            <Icon 
              name="Search" 
              size={24} 
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <Button
              onClick={() => {
                setShowSuggestions(false);
                onSearch();
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-6"
              size="lg"
            >
              Search
            </Button>
          </div>

          {/* 🎯 TAG SUGGESTIONS DROPDOWN */}
          {showSuggestions && tagSuggestions?.length > 0 && (
            <div className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
              <div className="p-3 bg-gray-50 border-b border-gray-200">
                <p className="text-sm font-medium text-gray-700">
                  💡 Suggested tags for "{searchQuery}"
                </p>
              </div>
              <ul className="max-h-64 overflow-y-auto">
                {isLoadingSuggestions ? (
                  <li className="px-4 py-3 text-center text-gray-500">
                    <Icon name="Loader" size={20} className="animate-spin inline mr-2" />
                    Loading suggestions...
                  </li>
                ) : (
                  tagSuggestions?.map((suggestion, index) => (
                    <li
                      key={index}
                      onClick={() => handleTagClick(suggestion?.tag)}
                      className="px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon 
                            name={suggestion?.isSuggested ? "Sparkles" : "Tag"} 
                            size={16} 
                            className={suggestion?.isSuggested ? "text-yellow-500" : "text-blue-500"}
                          />
                          <span className="text-gray-900 font-medium">
                            {suggestion?.tag}
                          </span>
                          {suggestion?.isSuggested && (
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                              AI Suggested
                            </span>
                          )}
                        </div>
                        {suggestion?.count > 0 && (
                          <span className="text-sm text-gray-500">
                            {suggestion?.count} snippet{suggestion?.count !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}
        </div>

        {/* Result counts by type */}
        {resultCounts && (
          <div className="mt-6 flex items-center justify-center gap-6 text-sm">
            {resultCounts?.snippets > 0 && (
              <div className="flex items-center gap-1">
                <Icon name="Code" size={16} />
                <span>{resultCounts?.snippets} Snippets</span>
              </div>
            )}
            {resultCounts?.bugs > 0 && (
              <div className="flex items-center gap-1">
                <Icon name="Bug" size={16} />
                <span>{resultCounts?.bugs} Bugs</span>
              </div>
            )}
            {resultCounts?.users > 0 && (
              <div className="flex items-center gap-1">
                <Icon name="Users" size={16} />
                <span>{resultCounts?.users} Users</span>
              </div>
            )}
            {resultCounts?.teams > 0 && (
              <div className="flex items-center gap-1">
                <Icon name="Users" size={16} />
                <span>{resultCounts?.teams} Teams</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchHeader;