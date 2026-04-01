import React from 'react';
import Icon from '../../../components/AppIcon';

const languages = [
  { value: 'all', label: 'All Languages' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'cpp', label: 'C++' },
  { value: 'csharp', label: 'C#' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'php', label: 'PHP' },
  { value: 'sql', label: 'SQL' },
  { value: 'swift', label: 'Swift' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'bash', label: 'Bash' },
];

const sortOptions = [
  { value: 'recent', label: 'Most Recent', icon: 'Clock' },
  { value: 'popular', label: 'Most Popular', icon: 'TrendingUp' },
  { value: 'views', label: 'Most Viewed', icon: 'Eye' },
  { value: 'likes', label: 'Most Liked', icon: 'Heart' },
];

const FilterSidebar = ({ filters, onFilterChange }) => {
  const activeLanguage = filters?.language || 'all';
  const activeSort = filters?.sortBy || 'recent';

  return (
    <div className="p-4 space-y-6">
      {/* Sort */}
      <div>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Sort By</h3>
        <div className="space-y-1">
          {sortOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => onFilterChange?.({ sortBy: opt.value })}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                activeSort === opt.value
                  ? 'bg-primary/15 text-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Icon name={opt.icon} size={14} />
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Language */}
      <div>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Language</h3>
        <div className="space-y-0.5 max-h-64 overflow-y-auto">
          {languages.map(lang => (
            <button
              key={lang.value}
              onClick={() => onFilterChange?.({ language: lang.value === 'all' ? null : lang.value })}
              className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
                activeLanguage === lang.value || (!activeLanguage && lang.value === 'all')
                  ? 'bg-primary/15 text-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Icon name="Code" size={12} />
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      {/* Visibility */}
      <div>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Visibility</h3>
        <div className="space-y-1">
          {['all', 'public', 'private', 'team'].map(vis => (
            <button
              key={vis}
              onClick={() => onFilterChange?.({ visibility: vis === 'all' ? null : vis })}
              className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-sm capitalize transition-colors ${
                (filters?.visibility || 'all') === vis
                  ? 'bg-primary/15 text-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Icon name={vis === 'public' ? 'Globe' : vis === 'private' ? 'Lock' : vis === 'team' ? 'Users' : 'Grid'} size={12} />
              {vis}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;
