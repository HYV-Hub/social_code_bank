import React from 'react';
import Icon from '../../../components/AppIcon';


const CategoryTabs = ({ categories, activeCategory, onCategoryChange }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {categories?.map((category) => {
        const Icon = category?.icon;
        const isActive = activeCategory === category?.id;

        return (
          <button
            key={category?.id}
            onClick={() => onCategoryChange(category?.id)}
            className={`
              relative p-6 rounded-xl transition-all duration-300
              ${isActive
                ? 'bg-white shadow-xl scale-105 border-2 border-blue-500'
                : 'bg-white shadow-sm hover:shadow-md border-2 border-transparent'
              }
            `}
          >
            {/* Active Indicator */}
            {isActive && (
              <div className="absolute top-2 right-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
              </div>
            )}
            {/* Icon */}
            <div className={`
              w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3
              ${isActive ? category?.color : 'bg-gray-100'}
              transition-colors duration-300
            `}>
              <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-gray-600'}`} />
            </div>
            {/* Label */}
            <h3 className={`
              text-sm font-semibold text-center
              ${isActive ? 'text-gray-900' : 'text-gray-600'}
            `}>
              {category?.label}
            </h3>
          </button>
        );
      })}
    </div>
  );
};

export default CategoryTabs;