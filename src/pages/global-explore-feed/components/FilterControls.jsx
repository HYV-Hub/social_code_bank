import React from 'react';
import Icon from '../../../components/AppIcon';

const SORT_OPTIONS = [
  { value: 'trending', label: 'Trending', icon: 'TrendingUp' },
  { value: 'newest', label: 'Newest', icon: 'Clock' },
  { value: 'most_reused', label: 'Most Reused', icon: 'GitFork' },
  { value: 'top_rated', label: 'Top Rated', icon: 'Sparkles' },
];

const LANGUAGES = [
  { value: 'all', label: 'All' },
  { value: 'javascript', label: 'JS' },
  { value: 'typescript', label: 'TS' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'csharp', label: 'C#' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'php', label: 'PHP' },
  { value: 'sql', label: 'SQL' },
];

const CONTENT_TYPES = [
  { value: 'all', label: 'All' },
  { value: 'snippets', label: 'Snippets' },
  { value: 'discussions', label: 'Discussions' },
  { value: 'collections', label: 'Collections' },
];

export default function FilterControls({
  categories = [],
  activeCategory,
  onCategoryClick,
  activeLanguage = 'all',
  onLanguageChange,
  activeContentType = 'all',
  onContentTypeChange,
  sortBy = 'trending',
  onSortChange,
  activeTagFilter,
  onTagClear,
}) {
  return (
    <div className="space-y-3 mb-6">
      {/* Sort + content type + active tag */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5">
          {SORT_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => onSortChange(opt.value)}
              className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
                sortBy === opt.value
                  ? 'bg-primary text-white'
                  : 'bg-card text-muted-foreground hover:text-foreground border border-border'
              }`}
            >
              <Icon name={opt.icon} size={12} />
              {opt.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {activeTagFilter && (
            <button onClick={onTagClear} className="hyv-tag-ai flex items-center gap-1 text-[11px]">
              <Icon name="X" size={10} /> {activeTagFilter}
            </button>
          )}
          <div className="flex items-center gap-1">
            {CONTENT_TYPES.map(ct => (
              <button
                key={ct.value}
                onClick={() => onContentTypeChange(ct.value)}
                className={`px-2 py-1 text-[11px] font-medium rounded transition-colors ${
                  activeContentType === ct.value
                    ? 'bg-accent/15 text-accent'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {ct.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Category chips */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => onCategoryClick(null)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              !activeCategory
                ? 'bg-primary/15 text-primary border border-primary/30'
                : 'bg-card text-muted-foreground border border-border hover:text-foreground'
            }`}
          >
            All
          </button>
          {categories.map(c => (
            <button
              key={c.category}
              onClick={() => onCategoryClick(c.category === activeCategory ? null : c.category)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeCategory === c.category
                  ? 'bg-primary/15 text-primary border border-primary/30'
                  : 'bg-card text-muted-foreground border border-border hover:text-foreground'
              }`}
            >
              {c.category} <span className="opacity-50 ml-0.5">{c.count}</span>
            </button>
          ))}
        </div>
      )}

      {/* Language chips */}
      <div className="flex flex-wrap gap-1">
        {LANGUAGES.map(lang => (
          <button
            key={lang.value}
            onClick={() => onLanguageChange(lang.value)}
            className={`px-2 py-0.5 text-[11px] font-mono rounded transition-colors ${
              activeLanguage === lang.value
                ? 'bg-primary/20 text-primary border border-primary/30'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            {lang.label}
          </button>
        ))}
      </div>
    </div>
  );
}
