import React, { useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, Settings, Book, Edit3 } from 'lucide-react';

const TeamStyleGuide = ({ rules }) => {
  const [editMode, setEditMode] = useState(false);
  const [selectedRule, setSelectedRule] = useState(null);

  const getStatusConfig = (status) => {
    const configs = {
      pass: {
        icon: CheckCircle,
        color: 'text-success',
        bgColor: 'bg-success/10',
        borderColor: 'border-success/20',
        label: 'Passing'
      },
      partial: {
        icon: AlertCircle,
        color: 'text-warning',
        bgColor: 'bg-warning/10',
        borderColor: 'border-warning/20',
        label: 'Partial'
      },
      fail: {
        icon: XCircle,
        color: 'text-error',
        bgColor: 'bg-error/10',
        borderColor: 'border-error/20',
        label: 'Failing'
      }
    };
    return configs?.[status] || configs?.fail;
  };

  const totalWeight = rules?.reduce((sum, rule) => sum + rule?.weight, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-primary rounded-xl p-8 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Book className="w-8 h-8" />
              Team Style Guide
            </h2>
            <p className="text-primary-foreground/70">
              Company-specific coding standards and best practices
            </p>
          </div>
          <button
            onClick={() => setEditMode(!editMode)}
            className="px-4 py-2 bg-card/10 hover:bg-card/20 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
          >
            {editMode ? (
              <>
                <Settings className="w-4 h-4" />
                View Mode
              </>
            ) : (
              <>
                <Edit3 className="w-4 h-4" />
                Edit Weights
              </>
            )}
          </button>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-card/10 rounded-lg p-4">
            <div className="text-2xl font-bold">{rules?.length}</div>
            <div className="text-primary-foreground/70 text-sm mt-1">Style Categories</div>
          </div>
          <div className="bg-card/10 rounded-lg p-4">
            <div className="text-2xl font-bold">{totalWeight}%</div>
            <div className="text-primary-foreground/70 text-sm mt-1">Total Weight</div>
          </div>
          <div className="bg-card/10 rounded-lg p-4">
            <div className="text-2xl font-bold">
              {rules?.filter((r) => r?.status === 'pass')?.length}
            </div>
            <div className="text-primary-foreground/70 text-sm mt-1">Passing</div>
          </div>
        </div>
      </div>

      {/* Rules List */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-6">
        <h3 className="text-xl font-semibold text-foreground mb-6">Style Rules & Weights</h3>
        <div className="space-y-4">
          {rules?.map((rule, index) => {
            const statusConfig = getStatusConfig(rule?.status);
            const StatusIcon = statusConfig?.icon;

            return (
              <div
                key={index}
                className={`border ${statusConfig?.borderColor} rounded-xl p-6 ${statusConfig?.bgColor} transition-all hover:shadow-md`}
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-card rounded-lg shadow-sm">
                    <StatusIcon className={`w-6 h-6 ${statusConfig?.color}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="text-lg font-semibold text-foreground mb-1">
                          {rule?.category}
                        </h4>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusConfig?.color} bg-card`}>
                          {statusConfig?.label}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-foreground">
                          {rule?.score}%
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">Current Score</div>
                      </div>
                    </div>

                    {/* Weight Control */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-4">
                        <label className="text-sm font-medium text-muted-foreground min-w-fit">
                          Priority Weight:
                        </label>
                        {editMode ? (
                          <input
                            type="range"
                            min="0"
                            max="50"
                            value={rule?.weight}
                            className="flex-1"
                            disabled={!editMode}
                          />
                        ) : (
                          <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${(rule?.weight / 50) * 100}%` }}
                            />
                          </div>
                        )}
                        <span className="text-lg font-bold text-foreground min-w-fit">
                          {rule?.weight}%
                        </span>
                      </div>

                      {/* Progress Indicator */}
                      <div className="bg-muted rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            rule?.score >= 80
                              ? 'bg-success'
                              : rule?.score >= 60
                              ? 'bg-warning' :'bg-error'
                          }`}
                          style={{ width: `${rule?.score}%` }}
                        />
                      </div>

                      {/* Expandable Details */}
                      <button
                        onClick={() =>
                          setSelectedRule(selectedRule === index ? null : index)
                        }
                        className="text-sm text-primary hover:text-primary font-medium"
                      >
                        {selectedRule === index ? 'Hide details' : 'Show details'}
                      </button>

                      {selectedRule === index && (
                        <div className="mt-4 p-4 bg-card rounded-lg border border-border">
                          <h5 className="font-medium text-foreground mb-3">
                            Rule Guidelines
                          </h5>
                          <ul className="space-y-2 text-sm text-muted-foreground">
                            <li className="flex items-start gap-2">
                              <span className="text-primary">✓</span>
                              <span>Follow team-approved naming patterns</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-primary">✓</span>
                              <span>Use consistent formatting across files</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-primary">✓</span>
                              <span>Document public APIs and complex logic</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-primary">✓</span>
                              <span>Handle errors gracefully with proper logging</span>
                            </li>
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Save Button */}
      {editMode && (
        <div className="bg-card rounded-xl shadow-sm border border-border p-6">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">
              Adjust category weights to match your team's priorities
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setEditMode(false)}
                className="px-6 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setEditMode(false);
                  // Save logic here
                }}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all font-medium"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamStyleGuide;