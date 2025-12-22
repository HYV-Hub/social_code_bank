import React, { useState, useEffect } from 'react';
import Icon from './AppIcon';
import Button from './ui/Button';
import { aiReportService } from '../services/aiReportService';
import { bugService } from '../services/bugService';
import { snippetService } from '../services/snippetService';

/**
 * AI Report Button Component
 * FIXED: Automatically displays full AI report without requiring re-analysis
 * Shows clear messaging to direct users to re-analyze for comprehensive reports
 */
export default function AIReportButton({ entity, entityType, onReportGenerated }) {
  const [loading, setLoading] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  const [hasExistingReport, setHasExistingReport] = useState(false);

  // CRITICAL: Check for existing AI report on mount and auto-show if available
  useEffect(() => {
    // Check both ai_report and aiReport properties
    const existingReport = entity?.ai_report || entity?.aiReport;
    
    if (existingReport) {
      setReport(existingReport);
      setHasExistingReport(true);
      // FIXED: Automatically show the report, no need to re-analyze
      setShowReport(true);
      console.log('✅ Existing AI report found and displayed automatically');
    } else {
      console.log('ℹ️ No existing AI report found');
    }
  }, [entity]);

  const handleGenerateReport = async (forceRegenerate = false) => {
    // FIXED: If report exists and not forcing regeneration, just toggle visibility
    if (hasExistingReport && !forceRegenerate) {
      setShowReport(!showReport);
      return;
    }

    if (!aiReportService?.isConfigured()) {
      setError('OpenAI API key not configured. Please add VITE_OPENAI_API_KEY to your environment variables.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      let generatedReport;
      
      if (entityType === 'bug') {
        generatedReport = await aiReportService?.generateBugReport(entity);
        await bugService?.updateBugAIReport(entity?.id, generatedReport);
      } else if (entityType === 'snippet') {
        generatedReport = await aiReportService?.generateSnippetReport(entity);
        await snippetService?.updateSnippetAIReport(entity?.id, generatedReport);
      }

      setReport(generatedReport);
      setHasExistingReport(true);
      setShowReport(true);
      
      if (onReportGenerated) {
        onReportGenerated(generatedReport);
      }

      console.log('✅ New AI report generated and saved');
    } catch (err) {
      console.error('Error generating AI report:', err);
      setError(err?.message || 'Failed to generate AI report');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleReport = () => {
    setShowReport(!showReport);
  };

  const handleReanalyze = () => {
    console.log('🔄 Re-analyzing to generate fresh AI report');
    handleGenerateReport(true);
  };

  return (
    <div className="ai-report-section">
      {/* Report Button */}
      <div className="flex items-center gap-2">
        {hasExistingReport ? (
          <>
            <Button
              variant="outline"
              size="sm"
              iconName="Brain"
              onClick={handleToggleReport}
            >
              {showReport ? 'Hide' : 'Show'} AI Report
            </Button>
            <Button
              variant="ghost"
              size="sm"
              iconName="RefreshCw"
              onClick={handleReanalyze}
              disabled={loading}
              title="Generate a fresh comprehensive AI analysis with detailed insights"
            >
              {loading ? 'Analyzing...' : 'Re-analyze for Comprehensive Report'}
            </Button>
          </>
        ) : (
          <Button
            variant="outline"
            size="sm"
            iconName="Sparkles"
            onClick={() => handleGenerateReport(false)}
            disabled={loading}
          >
            {loading ? 'Generating Comprehensive Analysis...' : 'Generate AI Report'}
          </Button>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-2 bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Icon name="AlertCircle" size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* FIXED: Report automatically displays if exists, no manual toggle needed first time */}
      {showReport && report && (
        <div className="mt-4 bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Icon name="Brain" size={20} className="text-purple-600" />
            <h3 className="text-lg font-bold text-purple-900">AI Analysis Report</h3>
            <span className="ml-auto text-xs text-purple-600">
              Generated: {new Date(report?.generated_at)?.toLocaleDateString()}
            </span>
          </div>

          {/* Summary */}
          {report?.analysis?.summary && (
            <div className="mb-4">
              <h4 className="font-semibold text-purple-900 mb-2">Summary</h4>
              <p className="text-sm text-purple-800">{report?.analysis?.summary}</p>
            </div>
          )}

          {/* Bug-specific Report */}
          {entityType === 'bug' && (
            <>
              {/* Root Cause */}
              {report?.analysis?.root_cause && (
                <div className="mb-4">
                  <h4 className="font-semibold text-purple-900 mb-2">Root Cause</h4>
                  <p className="text-sm text-purple-800">{report?.analysis?.root_cause}</p>
                </div>
              )}

              {/* Severity */}
              {report?.analysis?.severity && (
                <div className="mb-4">
                  <h4 className="font-semibold text-purple-900 mb-2">Severity</h4>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    report?.analysis?.severity === 'critical' ? 'bg-red-100 text-red-800' :
                    report?.analysis?.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                    report?.analysis?.severity === 'medium'? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {report?.analysis?.severity?.toUpperCase()}
                  </span>
                </div>
              )}

              {/* Recommended Fixes */}
              {report?.analysis?.recommended_fixes?.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold text-purple-900 mb-2">Recommended Fixes</h4>
                  <div className="space-y-3">
                    {report?.analysis?.recommended_fixes?.map((fix, index) => (
                      <div key={index} className="bg-white rounded-lg p-3 border border-purple-200">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-purple-900">{fix?.approach}</span>
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            fix?.complexity === 'simple' ? 'bg-green-100 text-green-700' :
                            fix?.complexity === 'moderate'? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {fix?.complexity}
                          </span>
                        </div>
                        {fix?.code_example && (
                          <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                            <code>{fix?.code_example}</code>
                          </pre>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Security Implications */}
              {report?.analysis?.security_implications?.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                    <Icon name="Shield" size={16} className="text-red-600" />
                    Security Implications
                  </h4>
                  <ul className="list-disc list-inside space-y-1">
                    {report?.analysis?.security_implications?.map((issue, index) => (
                      <li key={index} className="text-sm text-red-800">{issue}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}

          {/* Snippet-specific Report */}
          {entityType === 'snippet' && (
            <>
              {/* Code Quality */}
              {report?.analysis?.code_quality && (
                <div className="mb-4">
                  <h4 className="font-semibold text-purple-900 mb-2">Code Quality</h4>
                  <div className="bg-white rounded-lg p-3 border border-purple-200">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl font-bold text-purple-600">
                        {report?.analysis?.code_quality?.score}/100
                      </span>
                      <div className="flex-1">
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${
                              report?.analysis?.code_quality?.score >= 80 ? 'bg-green-500' :
                              report?.analysis?.code_quality?.score >= 60 ? 'bg-yellow-500': 'bg-red-500'
                            }`}
                            style={{ width: `${report?.analysis?.code_quality?.score}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    {report?.analysis?.code_quality?.issues?.length > 0 && (
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {report?.analysis?.code_quality?.issues?.map((issue, index) => (
                          <li key={index} className="text-purple-800">{issue}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}

              {/* Complexity */}
              {report?.analysis?.complexity && (
                <div className="mb-4">
                  <h4 className="font-semibold text-purple-900 mb-2">Complexity</h4>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    report?.analysis?.complexity?.level === 'low' ? 'bg-green-100 text-green-800' :
                    report?.analysis?.complexity?.level === 'medium'? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {report?.analysis?.complexity?.level?.toUpperCase()}
                  </span>
                </div>
              )}

              {/* Best Practices */}
              {report?.analysis?.best_practices && (
                <div className="mb-4">
                  <h4 className="font-semibold text-purple-900 mb-2">Best Practices</h4>
                  {report?.analysis?.best_practices?.followed?.length > 0 && (
                    <div className="mb-2">
                      <p className="text-xs font-medium text-green-700 mb-1">✓ Followed:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {report?.analysis?.best_practices?.followed?.map((item, index) => (
                          <li key={index} className="text-sm text-green-800">{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {report?.analysis?.best_practices?.violations?.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-red-700 mb-1">✗ Violations:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {report?.analysis?.best_practices?.violations?.map((item, index) => (
                          <li key={index} className="text-sm text-red-800">{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Security */}
              {report?.analysis?.security && (report?.analysis?.security?.vulnerabilities?.length > 0 || report?.analysis?.security?.recommendations?.length > 0) && (
                <div className="mb-4">
                  <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                    <Icon name="Shield" size={16} className="text-red-600" />
                    Security
                  </h4>
                  {report?.analysis?.security?.vulnerabilities?.length > 0 && (
                    <div className="mb-2">
                      <p className="text-xs font-medium text-red-700 mb-1">⚠ Vulnerabilities:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {report?.analysis?.security?.vulnerabilities?.map((item, index) => (
                          <li key={index} className="text-sm text-red-800">{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {report?.analysis?.security?.recommendations?.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-blue-700 mb-1">💡 Recommendations:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {report?.analysis?.security?.recommendations?.map((item, index) => (
                          <li key={index} className="text-sm text-blue-800">{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}