import React, { useState } from 'react';
import { Copy, Check, ArrowRight, Code2 } from 'lucide-react';

const CodeComparison = ({ originalCode, improvedCode, onCodeChange, analysis }) => {
  const [copiedOriginal, setCopiedOriginal] = useState(false);
  const [copiedImproved, setCopiedImproved] = useState(false);

  const handleCopy = async (code, setterFunc) => {
    try {
      await navigator?.clipboard?.writeText(code);
      setterFunc(true);
      setTimeout(() => setterFunc(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const differences = [
    { line: 9, type: 'change', description: 'String concatenation → Template literal' },
    { line: 9, type: 'addition', description: 'Added try-catch error handling' },
    { line: 3, type: 'addition', description: 'Added JSDoc documentation' },
    { line: 3, type: 'addition', description: 'Added PropTypes validation' },
    { line: 14, type: 'change', description: 'Improved error logging' }
  ];

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="bg-muted rounded-xl p-6 border border-blue-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-foreground">Code Style Analysis</h3>
            <p className="text-muted-foreground mt-1">
              Comparing your code against team style guidelines
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-primary">76%</div>
            <div className="text-sm text-muted-foreground">Style Match</div>
          </div>
        </div>

        {/* Key Improvements */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card rounded-lg p-4 border border-blue-100">
            <div className="text-2xl font-bold text-success">+32%</div>
            <div className="text-sm text-muted-foreground mt-1">Error Handling</div>
          </div>
          <div className="bg-card rounded-lg p-4 border border-blue-100">
            <div className="text-2xl font-bold text-success">+45%</div>
            <div className="text-sm text-muted-foreground mt-1">Documentation</div>
          </div>
          <div className="bg-card rounded-lg p-4 border border-blue-100">
            <div className="text-2xl font-bold text-success">+18%</div>
            <div className="text-sm text-muted-foreground mt-1">Best Practices</div>
          </div>
        </div>
      </div>

      {/* Code Editors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Original Code */}
        <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
          <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Code2 className="w-5 h-5 text-slate-300" />
              <h3 className="text-white font-semibold">Original Code</h3>
            </div>
            <button
              onClick={() => handleCopy(originalCode, setCopiedOriginal)}
              className="px-3 py-1.5 bg-card/10 hover:bg-card/20 text-white rounded-lg transition-colors flex items-center gap-2 text-sm"
            >
              {copiedOriginal ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy
                </>
              )}
            </button>
          </div>
          <div className="p-6">
            <textarea
              value={originalCode}
              onChange={onCodeChange}
              className="w-full h-96 font-mono text-sm bg-muted border border-border rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              placeholder="Paste your code here..."
            />
          </div>
        </div>

        {/* Improved Code */}
        <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Code2 className="w-5 h-5 text-white" />
              <h3 className="text-white font-semibold">AI-Suggested Improvements</h3>
            </div>
            <button
              onClick={() => handleCopy(improvedCode, setCopiedImproved)}
              className="px-3 py-1.5 bg-card/10 hover:bg-card/20 text-white rounded-lg transition-colors flex items-center gap-2 text-sm"
            >
              {copiedImproved ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy
                </>
              )}
            </button>
          </div>
          <div className="p-6">
            <pre className="h-96 font-mono text-sm bg-muted border border-border rounded-lg p-4 overflow-auto">
              <code>{improvedCode}</code>
            </pre>
          </div>
        </div>
      </div>

      {/* Differences Highlight */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <ArrowRight className="w-5 h-5 text-primary" />
          Key Changes Applied
        </h3>
        <div className="space-y-3">
          {differences?.map((diff, index) => (
            <div
              key={index}
              className={`flex items-start gap-3 p-4 rounded-lg border ${
                diff?.type === 'addition' ?'bg-success/10 border-success/20' :'bg-primary/10 border-primary/20'
              }`}
            >
              <div
                className={`px-2 py-1 rounded text-xs font-medium ${
                  diff?.type === 'addition' ?'bg-green-200 text-success' :'bg-blue-200 text-foreground'
                }`}
              >
                Line {diff?.line}
              </div>
              <div className="flex-1">
                <p className="text-muted-foreground font-medium">{diff?.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Analysis Result */}
      {analysis && (
        <div className="bg-card rounded-xl shadow-sm border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">AI Analysis Results</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-muted-foreground mb-2">Summary</h4>
              <p className="text-muted-foreground">{analysis?.summary}</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-muted rounded-lg p-4">
                <div className="text-2xl font-bold text-primary">
                  {analysis?.qualityScore}%
                </div>
                <div className="text-sm text-muted-foreground mt-1">Optimization</div>
              </div>
              <div className="bg-muted rounded-lg p-4">
                <div className="text-2xl font-bold text-secondary">
                  {analysis?.style_match_score}%
                </div>
                <div className="text-sm text-muted-foreground mt-1">Style Match</div>
              </div>
              <div className="bg-muted rounded-lg p-4">
                <div className="text-2xl font-bold text-success capitalize">
                  {analysis?.bug_risk}
                </div>
                <div className="text-sm text-muted-foreground mt-1">Bug Risk</div>
              </div>
              <div className="bg-muted rounded-lg p-4">
                <div className="text-2xl font-bold text-primary capitalize">
                  {analysis?.metadata?.complexity}
                </div>
                <div className="text-sm text-muted-foreground mt-1">Complexity</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeComparison;