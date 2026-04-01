import React, { useState } from 'react';
import { Tag, ChevronDown, ChevronUp } from 'lucide-react';

export default function TagCloud({ tags }) {
  const [showAllTags, setShowAllTags] = useState(false);
  
  // Handle both flat array and object format for backward compatibility
  const allTags = Array.isArray(tags) 
    ? tags 
    : [
        ...(tags?.primary || []),
        ...(tags?.secondary || []),
        ...(tags?.frameworks || [])
      ];

  if (!allTags || allTags?.length === 0) {
    return null;
  }

  // Categorize tags by type for better organization
  const categorizedTags = {
    language: [],
    framework: [],
    purpose: [],
    behavioral: [],
    difficulty: [],
    ui: [],
    security: [],
    performance: [],
    database: []
  };

  // Common framework/library keywords
  const frameworkKeywords = ['react', 'vue', 'angular', 'next', 'express', 'django', 'flask', 'prisma', 'supabase', 'tailwind', 'redux', 'framer'];
  const purposeKeywords = ['api-call', 'component', 'middleware', 'database-query', 'utility', 'authentication', 'validation', 'error-handling'];
  const behavioralKeywords = ['async', 'state-management', 'event-handling', 'caching', 'debouncing', 'memoization', 'lazy'];
  const difficultyKeywords = ['beginner', 'intermediate', 'advanced'];
  const uiKeywords = ['modal', 'dropdown', 'slider', 'form', 'button', 'input', 'table', 'chart', 'gallery', 'card', 'navigation'];
  const securityKeywords = ['sanitization', 'auth-required', 'encryption', 'token', 'xss', 'csrf', 'injection', 'secure'];
  const performanceKeywords = ['optimization', 'heavy-loop', 'memoization', 'virtualization', 'parallel', 'memory', 'cpu'];
  const databaseKeywords = ['sql', 'nosql', 'query', 'orm', 'migration', 'mongodb', 'prisma-schema', 'indexing'];

  // Language tags (common programming languages)
  const languageKeywords = ['javascript', 'typescript', 'python', 'java', 'go', 'rust', 'c++', 'c#', 'php', 'ruby', 'swift', 'kotlin'];

  // Define metadataKeywords that was missing
  const metadataKeywords = ['metadata', 'version', 'author', 'date', 'timestamp', 'id', 'uuid', 'deprecated', 'experimental'];

  allTags?.forEach(tag => {
    const lowerTag = tag?.toLowerCase();
    
    if (languageKeywords?.some(keyword => lowerTag?.includes(keyword))) {
      categorizedTags?.language?.push(tag);
    } else if (frameworkKeywords?.some(keyword => lowerTag?.includes(keyword))) {
      categorizedTags?.framework?.push(tag);
    } else if (purposeKeywords?.some(keyword => lowerTag?.includes(keyword))) {
      categorizedTags?.purpose?.push(tag);
    } else if (behavioralKeywords?.some(keyword => lowerTag?.includes(keyword))) {
      categorizedTags?.behavioral?.push(tag);
    } else if (difficultyKeywords?.some(keyword => lowerTag?.includes(keyword))) {
      categorizedTags?.difficulty?.push(tag);
    } else if (uiKeywords?.some(keyword => lowerTag?.includes(keyword))) {
      categorizedTags?.ui?.push(tag);
    } else if (securityKeywords?.some(keyword => lowerTag?.includes(keyword))) {
      categorizedTags?.security?.push(tag);
    } else if (performanceKeywords?.some(keyword => lowerTag?.includes(keyword))) {
      categorizedTags?.performance?.push(tag);
    } else if (databaseKeywords?.some(keyword => lowerTag?.includes(keyword))) {
      categorizedTags?.database?.push(tag);
    }
    // Remove metadata and other category classifications - tags in these categories are now filtered out
  });

  // Filter out metadata and other tags by only including categorized tags
  const filteredTags = allTags?.filter(tag => {
    const lowerTag = tag?.toLowerCase();
    
    // Exclude metadata tags
    if (metadataKeywords?.some(keyword => lowerTag?.includes(keyword))) {
      return false;
    }
    
    // Check if tag belongs to any valid category
    const belongsToCategory = 
      languageKeywords?.some(keyword => lowerTag?.includes(keyword)) ||
      frameworkKeywords?.some(keyword => lowerTag?.includes(keyword)) ||
      purposeKeywords?.some(keyword => lowerTag?.includes(keyword)) ||
      behavioralKeywords?.some(keyword => lowerTag?.includes(keyword)) ||
      difficultyKeywords?.some(keyword => lowerTag?.includes(keyword)) ||
      uiKeywords?.some(keyword => lowerTag?.includes(keyword)) ||
      securityKeywords?.some(keyword => lowerTag?.includes(keyword)) ||
      performanceKeywords?.some(keyword => lowerTag?.includes(keyword)) ||
      databaseKeywords?.some(keyword => lowerTag?.includes(keyword));
    
    // Only include if it belongs to a category (excludes "other" category)
    return belongsToCategory;
  });

  if (!filteredTags || filteredTags?.length === 0) {
    return null;
  }

  // Display limit for initial view - reduced for more compact UI
  const displayLimit = 15;
  const tagsToShow = showAllTags ? filteredTags : filteredTags?.slice(0, displayLimit);
  const hasMoreTags = filteredTags?.length > displayLimit;

  const getCategoryColor = (category) => {
    const colorMap = {
      language: 'bg-muted text-primary border-primary/20',
      framework: 'from-purple-50 to-purple-100 text-primary border-border',
      purpose: 'bg-muted text-success border-success/20',
      behavioral: 'from-orange-50 to-orange-100 text-orange-700 border-orange-200',
      difficulty: 'from-yellow-50 to-yellow-100 text-warning border-warning/20',
      ui: 'from-pink-50 to-pink-100 text-pink-700 border-pink-200',
      security: 'from-red-50 to-red-100 text-error border-error/20',
      performance: 'from-indigo-50 to-indigo-100 text-indigo-700 border-indigo-200',
      database: 'from-teal-50 to-teal-100 text-teal-700 border-teal-200'
    };
    return colorMap?.[category] || colorMap?.language;
  };

  const getTagCategory = (tag) => {
    const lowerTag = tag?.toLowerCase();
    
    if (languageKeywords?.some(keyword => lowerTag?.includes(keyword))) return 'language';
    if (frameworkKeywords?.some(keyword => lowerTag?.includes(keyword))) return 'framework';
    if (purposeKeywords?.some(keyword => lowerTag?.includes(keyword))) return 'purpose';
    if (behavioralKeywords?.some(keyword => lowerTag?.includes(keyword))) return 'behavioral';
    if (difficultyKeywords?.some(keyword => lowerTag?.includes(keyword))) return 'difficulty';
    if (uiKeywords?.some(keyword => lowerTag?.includes(keyword))) return 'ui';
    if (securityKeywords?.some(keyword => lowerTag?.includes(keyword))) return 'security';
    if (performanceKeywords?.some(keyword => lowerTag?.includes(keyword))) return 'performance';
    if (databaseKeywords?.some(keyword => lowerTag?.includes(keyword))) return 'database';
    return 'language';
  };

  return (
    <div className="bg-card rounded-lg shadow-lg p-5 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Tag className="w-4 h-4 text-primary" />
          <h2 className="text-lg font-bold text-foreground">AI-Generated Tags</h2>
        </div>
        {hasMoreTags && (
          <button
            onClick={() => setShowAllTags(!showAllTags)}
            className="flex items-center space-x-1 text-xs text-primary hover:text-foreground transition-colors"
          >
            <span>{showAllTags ? 'Show Less' : `Show All (${filteredTags?.length})`}</span>
            {showAllTags ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>
        )}
      </div>
      
      {/* Compact Tag Categories Legend */}
      <div className="mb-3 p-2 bg-background rounded-lg">
        <p className="text-xs font-medium text-foreground mb-1">Categories:</p>
        <div className="flex flex-wrap gap-1.5 text-xs">
          {Object.entries(categorizedTags)?.map(([category, tags]) => 
            tags?.length > 0 ? (
              <span key={category} className="flex items-center space-x-1">
                <span className={`px-2 py-0.5 rounded bg-gradient-to-r ${getCategoryColor(category)} border font-medium capitalize text-xs`}>
                  {category}
                </span>
                <span className="text-muted-foreground">({tags?.length})</span>
              </span>
            ) : null
          )}
        </div>
      </div>

      {/* Compact Tags Display */}
      <div className="flex flex-wrap gap-2">
        {tagsToShow?.map((tag, index) => {
          const category = getTagCategory(tag);
          return (
            <span
              key={index}
              className={`px-2.5 py-1 bg-gradient-to-r ${getCategoryColor(category)} rounded-full text-xs font-medium border hover:shadow-md transition-all cursor-default`}
              title={`Category: ${category}`}
            >
              {tag}
            </span>
          );
        })}
      </div>
      
      <div className="mt-3 flex items-center justify-between text-xs">
        <p className="text-muted-foreground">
          {filteredTags?.length} tag{filteredTags?.length !== 1 ? 's' : ''} identified
        </p>
        <p className="text-muted-foreground">
          {Object.values(categorizedTags)?.filter(arr => arr?.length > 0)?.length} categories
        </p>
      </div>
    </div>
  );
}