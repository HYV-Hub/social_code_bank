import React from 'react';
import { X, Filter } from 'lucide-react';

export default function FilterPanel({ filters, onFilterChange, onClose }) {
  const roles = [
    { value: 'user', label: 'User' },
    { value: 'team_member', label: 'Team Member' },
    { value: 'team_admin', label: 'Team Admin' },
    { value: 'company_admin', label: 'Company Admin' }
  ];

  const contributorLevels = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
    { value: 'expert', label: 'Expert' },
    { value: 'master', label: 'Master' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg">
              <Filter className="w-5 h-5 text-slate-700" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Advanced Filters</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Role Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Filter by Role
            </label>
            <div className="space-y-2">
              {roles?.map(role => (
                <label key={role?.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters?.roles?.includes(role?.value) || false}
                    onChange={(e) => {
                      const newRoles = e?.target?.checked
                        ? [...(filters?.roles || []), role?.value]
                        : (filters?.roles || [])?.filter(r => r !== role?.value);
                      onFilterChange({ ...filters, roles: newRoles });
                    }}
                    className="w-4 h-4 text-slate-700 rounded focus:ring-slate-700"
                  />
                  <span className="text-sm text-gray-700">{role?.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Contributor Level Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Filter by Contributor Level
            </label>
            <div className="space-y-2">
              {contributorLevels?.map(level => (
                <label key={level?.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters?.levels?.includes(level?.value) || false}
                    onChange={(e) => {
                      const newLevels = e?.target?.checked
                        ? [...(filters?.levels || []), level?.value]
                        : (filters?.levels || [])?.filter(l => l !== level?.value);
                      onFilterChange({ ...filters, levels: newLevels });
                    }}
                    className="w-4 h-4 text-slate-700 rounded focus:ring-slate-700"
                  />
                  <span className="text-sm text-gray-700">{level?.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Activity Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Activity Status
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="activityStatus"
                  checked={filters?.activityStatus === 'all' || !filters?.activityStatus}
                  onChange={() => onFilterChange({ ...filters, activityStatus: 'all' })}
                  className="w-4 h-4 text-slate-700 focus:ring-slate-700"
                />
                <span className="text-sm text-gray-700">All Members</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="activityStatus"
                  checked={filters?.activityStatus === 'active'}
                  onChange={() => onFilterChange({ ...filters, activityStatus: 'active' })}
                  className="w-4 h-4 text-slate-700 focus:ring-slate-700"
                />
                <span className="text-sm text-gray-700">Active Only</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="activityStatus"
                  checked={filters?.activityStatus === 'inactive'}
                  onChange={() => onFilterChange({ ...filters, activityStatus: 'inactive' })}
                  className="w-4 h-4 text-slate-700 focus:ring-slate-700"
                />
                <span className="text-sm text-gray-700">Inactive Only</span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={() => onFilterChange({})}
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            Clear All Filters
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}