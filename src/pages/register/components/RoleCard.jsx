import React from 'react';

const RoleCard = ({ role, title, description, icon, isSelected, onSelect }) => {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`p-6 rounded-lg border-2 transition-all text-left hover:shadow-md ${
        isSelected
          ? 'border-blue-600 bg-primary/10 shadow-md'
          : 'border-slate-200 bg-card hover:border-blue-300'
      }`}
    >
      <div className="flex items-center gap-3 mb-2">
        <span className="text-3xl">{icon}</span>
        <h3 className={`text-lg font-semibold ${
          isSelected ? 'text-foreground' : 'text-slate-800'
        }`}>
          {title}
        </h3>
      </div>
      <p className={`text-sm ${
        isSelected ? 'text-primary' : 'text-slate-600'
      }`}>
        {description}
      </p>
    </button>
  );
};

export default RoleCard;