import React from 'react';

const RoleCard = ({ role, title, description, icon, isSelected, onSelect }) => {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`p-6 rounded-lg border-2 transition-all text-left hover:shadow-md ${
        isSelected
          ? 'border-blue-600 bg-blue-50 shadow-md'
          : 'border-slate-200 bg-white hover:border-blue-300'
      }`}
    >
      <div className="flex items-center gap-3 mb-2">
        <span className="text-3xl">{icon}</span>
        <h3 className={`text-lg font-semibold ${
          isSelected ? 'text-blue-800' : 'text-slate-800'
        }`}>
          {title}
        </h3>
      </div>
      <p className={`text-sm ${
        isSelected ? 'text-blue-700' : 'text-slate-600'
      }`}>
        {description}
      </p>
    </button>
  );
};

export default RoleCard;