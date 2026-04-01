import React from 'react';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';

export default function CategoryBreakdown({ categories, securityAnalysis, bugReview, codeSmells, performanceDiagnostics, architecturalReview }) {
  const getSeverityColor = (severity) => {
    const colors = {
      critical: 'text-error bg-error/10 border-error/20',
      high: 'text-warning bg-warning/10 border-warning/20',
      medium: 'text-warning bg-warning/10 border-warning/20',
      low: 'text-primary bg-primary/10 border-primary/20'
    };
    return colors?.[severity] || colors?.low;
  };

  return (
    <div className="space-y-4 mb-6">
      <h2 className="text-lg font-bold text-foreground">AI Insights</h2>
      
      {/* Security Analysis Section */}
      {securityAnalysis && (
        <div className="bg-card rounded-lg shadow-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <AlertCircle className="w-4 h-4 text-error" />
            <h3 className="text-base font-bold text-foreground">Security Analysis</h3>
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${getSeverityColor(securityAnalysis?.overallSeverity)}`}>
              {securityAnalysis?.overallSeverity?.toUpperCase()}
            </span>
          </div>
          
          {securityAnalysis?.vulnerabilities?.length > 0 ? (
            <div className="space-y-2">
              {securityAnalysis?.vulnerabilities?.map((vuln, index) => (
                <div key={index} className="border rounded-lg p-3 bg-error/10 border-error/20">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-sm text-foreground">{vuln?.type}</h4>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getSeverityColor(vuln?.severity)}`}>
                      {vuln?.severity}
                    </span>
                  </div>
                  <p className="text-xs text-foreground mb-2">{vuln?.description}</p>
                  {vuln?.location && (
                    <p className="text-xs text-muted-foreground mb-2">
                      <strong>Location:</strong> {vuln?.location}
                    </p>
                  )}
                  <div className="bg-success/10 border border-success/20 rounded p-2 mt-2">
                    <p className="text-xs text-success">
                      <strong>Fix:</strong> {vuln?.fix}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-success">
              <CheckCircle className="w-4 h-4" />
              <p className="text-xs">No security vulnerabilities detected</p>
            </div>
          )}
        </div>
      )}

      {/* Bug Review Section */}
      {bugReview && (
        <div className="bg-card rounded-lg shadow-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <AlertCircle className="w-4 h-4 text-warning" />
            <h3 className="text-base font-bold text-foreground">Bug Risk Review</h3>
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${getSeverityColor(bugReview?.riskLevel)}`}>
              {bugReview?.riskLevel?.toUpperCase()} RISK
            </span>
          </div>
          
          {bugReview?.potentialBugs?.length > 0 ? (
            <div className="space-y-2">
              {bugReview?.potentialBugs?.map((bug, index) => (
                <div key={index} className="border rounded-lg p-3 bg-warning/10 border-warning/20">
                  <h4 className="font-semibold text-sm text-foreground mb-2">{bug?.type}</h4>
                  <p className="text-xs text-foreground mb-2">{bug?.description}</p>
                  {bug?.location && (
                    <p className="text-xs text-muted-foreground mb-2">
                      <strong>Location:</strong> {bug?.location}
                    </p>
                  )}
                  <div className="bg-primary/10 border border-primary/20 rounded p-2 mt-2">
                    <p className="text-xs text-foreground">
                      <strong>Suggested Fix:</strong> {bug?.fix}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-success">
              <CheckCircle className="w-4 h-4" />
              <p className="text-xs">No obvious bug risks detected</p>
            </div>
          )}
        </div>
      )}

      {/* Code Smells Section */}
      {codeSmells?.length > 0 && (
        <div className="bg-card rounded-lg shadow-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <XCircle className="w-4 h-4 text-warning" />
            <h3 className="text-base font-bold text-foreground">Code Smells & Anti-Patterns</h3>
          </div>
          
          <div className="space-y-2">
            {codeSmells?.map((smell, index) => (
              <div key={index} className="border rounded-lg p-3 bg-warning/10 border-warning/20">
                <h4 className="font-semibold text-sm text-foreground mb-2">{smell?.smell}</h4>
                {smell?.location && (
                  <p className="text-xs text-muted-foreground mb-2">
                    <strong>Location:</strong> {smell?.location}
                  </p>
                )}
                <p className="text-xs text-foreground">
                  <strong>Suggestion:</strong> {smell?.suggestion}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Performance Diagnostics Section */}
      {performanceDiagnostics?.bottlenecks?.length > 0 && (
        <div className="bg-card rounded-lg shadow-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <AlertCircle className="w-4 h-4 text-secondary" />
            <h3 className="text-base font-bold text-foreground">Performance Diagnostics</h3>
          </div>
          
          <div className="space-y-2">
            {performanceDiagnostics?.bottlenecks?.map((bottleneck, index) => (
              <div key={index} className="border rounded-lg p-3 bg-primary/10 border-primary/20">
                <h4 className="font-semibold text-sm text-foreground mb-2">{bottleneck?.issue}</h4>
                <p className="text-xs text-foreground mb-2">
                  <strong>Impact:</strong> {bottleneck?.impact}
                </p>
                <div className="bg-success/10 border border-success/20 rounded p-2 mt-2">
                  <p className="text-xs text-success">
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
        <div className="bg-card rounded-lg shadow-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <AlertCircle className="w-4 h-4 text-accent" />
            <h3 className="text-base font-bold text-foreground">Architectural Review</h3>
          </div>
          
          <div className="space-y-2">
            {architecturalReview?.concerns?.map((concern, index) => (
              <div key={index} className="border rounded-lg p-3 bg-accent/10 border-accent/20">
                <h4 className="font-semibold text-sm text-foreground mb-2">{concern?.concern}</h4>
                <p className="text-xs text-foreground">
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