import React, { useState } from 'react';
import { AlertTriangle, AlertCircle, Info, CheckCircle, Zap } from 'lucide-react';
import Icon from '../../../components/AppIcon';


const ViolationsList = ({ violations }) => {
  const [selectedViolation, setSelectedViolation] = useState(null);
  const [filter, setFilter] = useState('all');

  const getSeverityConfig = (severity) => {
    const configs = {
      high: {
        icon: AlertTriangle,
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-700',
        badgeColor: 'bg-red-100 text-red-800'
      },
      medium: {
        icon: AlertCircle,
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        textColor: 'text-yellow-700',
        badgeColor: 'bg-yellow-100 text-yellow-800'
      },
      low: {
        icon: Info,
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-700',
        badgeColor: 'bg-blue-100 text-blue-800'
      }
    };
    return configs?.[severity] || configs?.low;
  };

  const filteredViolations = violations?.filter((v) => {
    if (filter === 'all') return true;
    return v?.severity === filter;
  });

  const severityCounts = {
    high: violations?.filter((v) => v?.severity === 'high')?.length || 0,
    medium: violations?.filter((v) => v?.severity === 'medium')?.length || 0,
    low: violations?.filter((v) => v?.severity === 'low')?.length || 0
  };

  const handleApplyFix = (violationId) => {
    console.log('Applying fix for violation:', violationId);
    // Implementation would apply the AI-suggested fix
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="text-3xl font-bold text-slate-900">{violations?.length}</div>
          <div className="text-sm text-slate-600 mt-1">Total Issues</div>
        </div>
        <div className="bg-red-50 rounded-xl border border-red-200 p-6">
          <div className="text-3xl font-bold text-red-600">{severityCounts?.high}</div>
          <div className="text-sm text-red-700 mt-1">High Severity</div>
        </div>
        <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-6">
          <div className="text-3xl font-bold text-yellow-600">{severityCounts?.medium}</div>
          <div className="text-sm text-yellow-700 mt-1">Medium Severity</div>
        </div>
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
          <div className="text-3xl font-bold text-blue-600">{severityCounts?.low}</div>
          <div className="text-sm text-blue-700 mt-1">Low Severity</div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-slate-700">Filter by severity:</span>
          {['all', 'high', 'medium', 'low']?.map((severity) => (
            <button
              key={severity}
              onClick={() => setFilter(severity)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === severity
                  ? 'bg-blue-600 text-white' :'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {severity?.charAt(0)?.toUpperCase() + severity?.slice(1)}
              {severity !== 'all' && (
                <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                  {severity === 'high' && severityCounts?.high}
                  {severity === 'medium' && severityCounts?.medium}
                  {severity === 'low' && severityCounts?.low}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Violations List */}
      <div className="space-y-4">
        {filteredViolations?.map((violation) => {
          const config = getSeverityConfig(violation?.severity);
          const Icon = config?.icon;

          return (
            <div
              key={violation?.id}
              className={`bg-white rounded-xl shadow-sm border ${config?.borderColor} p-6 hover:shadow-md transition-shadow`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${config?.bgColor}`}>
                  <Icon className={`w-6 h-6 ${config?.textColor}`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${config?.badgeColor}`}>
                          {violation?.severity?.toUpperCase()}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                          {violation?.category}
                        </span>
                        <span className="text-sm text-slate-500">Line {violation?.line}</span>
                      </div>
                      <h4 className="text-lg font-semibold text-slate-900 mb-2">
                        {violation?.description}
                      </h4>
                    </div>
                    
                    {violation?.autoFixAvailable && (
                      <button
                        onClick={() => handleApplyFix(violation?.id)}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center gap-2 text-sm font-medium whitespace-nowrap"
                      >
                        <Zap className="w-4 h-4" />
                        Apply Fix
                      </button>
                    )}
                  </div>

                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 mb-4">
                    <h5 className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Recommendation
                    </h5>
                    <p className="text-slate-600 text-sm">{violation?.recommendation}</p>
                  </div>

                  {/* Expandable Details */}
                  <button
                    onClick={() =>
                      setSelectedViolation(
                        selectedViolation === violation?.id ? null : violation?.id
                      )
                    }
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {selectedViolation === violation?.id ? 'Hide details' : 'Show more details'}
                  </button>

                  {selectedViolation === violation?.id && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h5 className="font-medium text-slate-900 mb-2">Additional Information</h5>
                      <ul className="space-y-2 text-sm text-slate-700">
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600">•</span>
                          <span>Impact: Affects code maintainability and readability</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600">•</span>
                          <span>Related rules: Team Style Guide Section 3.2</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600">•</span>
                          <span>Fix complexity: {violation?.autoFixAvailable ? 'Simple (automatic)' : 'Manual review required'}</span>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredViolations?.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            No {filter !== 'all' ? filter + ' severity' : ''} violations found
          </h3>
          <p className="text-slate-600">
            {filter === 'all' ?'Your code meets all style guidelines!'
              : `No ${filter} severity issues detected.`}
          </p>
        </div>
      )}
    </div>
  );
};

export default ViolationsList;