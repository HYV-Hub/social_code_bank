import React from 'react';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';

export default function CategoryBreakdown({ categories, securityAnalysis, bugReview, codeSmells, performanceDiagnostics, architecturalReview }) {
  const getSeverityColor = (severity) => {
    const colors = {
      critical: 'text-red-600 bg-red-50 border-red-200',
      high: 'text-orange-600 bg-orange-50 border-orange-200',
      medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      low: 'text-blue-600 bg-blue-50 border-blue-200'
    };
    return colors?.[severity] || colors?.low;
  };

  return (
    <div className="space-y-4 mb-6">
      <h2 className="text-lg font-bold text-gray-900">AI Insights</h2>
      
      {/* Security Analysis Section */}
      {securityAnalysis && (
        <div className="bg-white rounded-lg shadow-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <h3 className="text-base font-bold text-gray-900">Security Analysis</h3>
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${getSeverityColor(securityAnalysis?.overallSeverity)}`}>
              {securityAnalysis?.overallSeverity?.toUpperCase()}
            </span>
          </div>
          
          {securityAnalysis?.vulnerabilities?.length > 0 ? (
            <div className="space-y-2">
              {securityAnalysis?.vulnerabilities?.map((vuln, index) => (
                <div key={index} className="border rounded-lg p-3 bg-red-50 border-red-200">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-sm text-gray-900">{vuln?.type}</h4>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getSeverityColor(vuln?.severity)}`}>
                      {vuln?.severity}
                    </span>
                  </div>
                  <p className="text-xs text-gray-700 mb-2">{vuln?.description}</p>
                  {vuln?.location && (
                    <p className="text-xs text-gray-600 mb-2">
                      <strong>Location:</strong> {vuln?.location}
                    </p>
                  )}
                  <div className="bg-green-50 border border-green-200 rounded p-2 mt-2">
                    <p className="text-xs text-green-900">
                      <strong>Fix:</strong> {vuln?.fix}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="w-4 h-4" />
              <p className="text-xs">No security vulnerabilities detected</p>
            </div>
          )}
        </div>
      )}

      {/* Bug Review Section */}
      {bugReview && (
        <div className="bg-white rounded-lg shadow-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <AlertCircle className="w-4 h-4 text-orange-600" />
            <h3 className="text-base font-bold text-gray-900">Bug Risk Review</h3>
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${getSeverityColor(bugReview?.riskLevel)}`}>
              {bugReview?.riskLevel?.toUpperCase()} RISK
            </span>
          </div>
          
          {bugReview?.potentialBugs?.length > 0 ? (
            <div className="space-y-2">
              {bugReview?.potentialBugs?.map((bug, index) => (
                <div key={index} className="border rounded-lg p-3 bg-orange-50 border-orange-200">
                  <h4 className="font-semibold text-sm text-gray-900 mb-2">{bug?.type}</h4>
                  <p className="text-xs text-gray-700 mb-2">{bug?.description}</p>
                  {bug?.location && (
                    <p className="text-xs text-gray-600 mb-2">
                      <strong>Location:</strong> {bug?.location}
                    </p>
                  )}
                  <div className="bg-blue-50 border border-blue-200 rounded p-2 mt-2">
                    <p className="text-xs text-blue-900">
                      <strong>Suggested Fix:</strong> {bug?.fix}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="w-4 h-4" />
              <p className="text-xs">No obvious bug risks detected</p>
            </div>
          )}
        </div>
      )}

      {/* Code Smells Section */}
      {codeSmells?.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <XCircle className="w-4 h-4 text-yellow-600" />
            <h3 className="text-base font-bold text-gray-900">Code Smells & Anti-Patterns</h3>
          </div>
          
          <div className="space-y-2">
            {codeSmells?.map((smell, index) => (
              <div key={index} className="border rounded-lg p-3 bg-yellow-50 border-yellow-200">
                <h4 className="font-semibold text-sm text-gray-900 mb-2">{smell?.smell}</h4>
                {smell?.location && (
                  <p className="text-xs text-gray-600 mb-2">
                    <strong>Location:</strong> {smell?.location}
                  </p>
                )}
                <p className="text-xs text-gray-700">
                  <strong>Suggestion:</strong> {smell?.suggestion}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Performance Diagnostics Section */}
      {performanceDiagnostics?.bottlenecks?.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <AlertCircle className="w-4 h-4 text-indigo-600" />
            <h3 className="text-base font-bold text-gray-900">Performance Diagnostics</h3>
          </div>
          
          <div className="space-y-2">
            {performanceDiagnostics?.bottlenecks?.map((bottleneck, index) => (
              <div key={index} className="border rounded-lg p-3 bg-indigo-50 border-indigo-200">
                <h4 className="font-semibold text-sm text-gray-900 mb-2">{bottleneck?.issue}</h4>
                <p className="text-xs text-gray-700 mb-2">
                  <strong>Impact:</strong> {bottleneck?.impact}
                </p>
                <div className="bg-green-50 border border-green-200 rounded p-2 mt-2">
                  <p className="text-xs text-green-900">
                    <strong>Solution:</strong> {bottleneck?.solution}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Architectural Review Section */}
      {architecturalReview?.concerns?.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <AlertCircle className="w-4 h-4 text-teal-600" />
            <h3 className="text-base font-bold text-gray-900">Architectural Review</h3>
          </div>
          
          <div className="space-y-2">
            {architecturalReview?.concerns?.map((concern, index) => (
              <div key={index} className="border rounded-lg p-3 bg-teal-50 border-teal-200">
                <h4 className="font-semibold text-sm text-gray-900 mb-2">{concern?.concern}</h4>
                <p className="text-xs text-gray-700">
                  <strong>Recommendation:</strong> {concern?.recommendation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}