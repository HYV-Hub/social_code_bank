import React, { useState } from 'react';
import { Shield, UserX, X, ChevronDown } from 'lucide-react';

export default function BulkActionsBar({ selectedCount, onRoleUpdate, onDeactivate, onCancel }) {
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const roles = [
    { value: 'user', label: 'User' },
    { value: 'team_member', label: 'Team Member' },
    { value: 'team_admin', label: 'Team Admin' },
    { value: 'company_admin', label: 'Company Admin' }
  ];

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40">
      <div className="bg-slate-800 text-white rounded-lg shadow-2xl p-4 flex items-center gap-4">
        {/* Selection Count */}
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-700 rounded-lg">
          <span className="font-semibold">{selectedCount}</span>
          <span className="text-sm">selected</span>
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-slate-600" />

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Role Update */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors flex items-center gap-2"
            >
              <Shield className="w-4 h-4" />
              <span className="text-sm">Change Role</span>
              <ChevronDown className="w-4 h-4" />
            </button>

            {showRoleMenu && (
              <>
                <div 
                  className="fixed inset-0 z-10"
                  onClick={() => setShowRoleMenu(false)}
                />
                <div className="absolute bottom-full left-0 mb-2 w-48 bg-card rounded-lg shadow-xl border border-border py-2 z-20">
                  {roles?.map(role => (
                    <button
                      key={role?.value}
                      onClick={() => {
                        onRoleUpdate(role?.value);
                        setShowRoleMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted"
                    >
                      {role?.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Deactivate */}
          <button
            onClick={onDeactivate}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors flex items-center gap-2"
          >
            <UserX className="w-4 h-4" />
            <span className="text-sm">Deactivate</span>
          </button>

          {/* Divider */}
          <div className="w-px h-8 bg-slate-600 mx-2" />

          {/* Cancel */}
          <button
            onClick={onCancel}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            title="Clear selection"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}