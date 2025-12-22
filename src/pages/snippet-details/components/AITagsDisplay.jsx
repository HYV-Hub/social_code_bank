import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import aiTaggingService from '../../../services/aiTaggingService';

const AITagsDisplay = ({ aiAnalysis, snippetId, code, language }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAnalyzing, setAnalyzing] = useState(false);

  const handleReanalyze = async () => {
    if (!code || !language) return;

    try {
      setAnalyzing(true);

      const analysis = await aiTaggingService?.analyzeSnippet({
        code,
        language,
        title: 'Snippet Reanalysis',
        description: ''
      });

      // Update the snippet with new analysis
      await aiTaggingService?.updateSnippetAnalysis(snippetId, analysis);

      // Refresh the page to show updated analysis
      window.location?.reload();
    } catch (error) {
      console.error('Error reanalyzing snippet:', error);
      alert('Failed to reanalyze snippet. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const qualityScore = aiAnalysis?.optimization_score || 0;
  const styleMatchScore = aiAnalysis?.style_match_score || 0;
  const tags = aiAnalysis?.tags || [];
  // CRITICAL: Only use metadata if it actually exists from AI analysis, not fallback data
  const metadata = aiAnalysis?.metadata && Object.keys(aiAnalysis?.metadata || {})?.length > 0 ? aiAnalysis?.metadata : null;
  
  const bugRisk = aiAnalysis?.bug_risk || 'low';
  const riskInfo = {
    low: { label: 'Low', icon: 'CheckCircle', color: 'text-green-600', bg: 'bg-green-50' },
    medium: { label: 'Medium', icon: 'AlertCircle', color: 'text-yellow-600', bg: 'bg-yellow-50' },
    high: { label: 'High', icon: 'XCircle', color: 'text-red-600', bg: 'bg-red-50' }
  }?.[bugRisk] || { label: 'Low', icon: 'CheckCircle', color: 'text-green-600', bg: 'bg-green-50' };
  
  // Check if we have ANY actual AI analysis data
  const hasAIAnalysis = qualityScore > 0 || tags?.length > 0 || aiAnalysis?.summary || aiAnalysis?.bug_risk || aiAnalysis?.style_match_score;

  // If no AI analysis exists, show empty state with prompt to analyze
  if (!hasAIAnalysis) {
    return (
      <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 border-2 border-purple-300 rounded-xl overflow-hidden shadow-lg">
        <div className="relative px-5 py-4 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 text-white overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-400/20 rounded-full blur-xl"></div>
          
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                <Icon name="Sparkles" size={20} />
              </div>
              <div>
                <h3 className="font-bold text-lg">AI Code Analysis</h3>
                <p className="text-xs text-white/80">Powered by GPT-4</p>
              </div>
            </div>
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg animate-pulse">
              <Icon name="Zap" size={20} />
            </div>
          </div>
        </div>

        <div className="p-5 space-y-5">
          <div className="text-center py-8 bg-white rounded-xl shadow-md border border-gray-200">
            <div className="p-4 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Icon name="Sparkles" size={40} className="text-purple-600 animate-pulse" />
            </div>
            <p className="text-sm font-semibold text-gray-900 mb-2">No AI Analysis Available</p>
            <p className="text-xs text-gray-600 mb-4">
              Get instant insights about your code quality, style, and potential bugs
            </p>
            <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-sm font-medium rounded-lg transition-all transform hover:scale-105 shadow-lg">
              Analyze Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 border-2 border-purple-300 rounded-xl overflow-hidden shadow-lg">
      <div className="relative px-5 py-4 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 text-white overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-400/20 rounded-full blur-xl"></div>
        
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
              <Icon name="Sparkles" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-lg">AI Code Analysis</h3>
              <p className="text-xs text-white/80">Powered by GPT-4</p>
            </div>
          </div>
          <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg animate-pulse">
            <Icon name="Zap" size={20} />
          </div>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {hasAIAnalysis && (
          <>
            {/* Enhanced Quality Score */}
            <div className="bg-white rounded-xl p-4 shadow-md border border-purple-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Icon name="Award" size={18} className="text-purple-600" />
                  <span className="text-sm font-bold text-gray-900">Quality Score</span>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  {qualityScore}%
                </span>
              </div>
              <div className="relative w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 rounded-full transition-all duration-1000 ease-out animate-pulse"
                  style={{ width: `${qualityScore}%` }}
                />
              </div>
              <p className="text-xs text-gray-600 mt-2 text-center font-medium">
                {qualityScore >= 80 ? '🎉 Excellent code!' : qualityScore >= 60 ? '✨ Good quality' : '💡 Room for improvement'}
              </p>
            </div>

            {/* Enhanced Style Match Score */}
            {styleMatchScore > 0 && (
              <div className="bg-white rounded-xl p-4 shadow-md border border-blue-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Icon name="Palette" size={18} className="text-blue-600" />
                    <span className="text-sm font-bold text-gray-900">Style Match</span>
                  </div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    {styleMatchScore}%
                  </span>
                </div>
                <div className="relative w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${styleMatchScore}%` }}
                  />
                </div>
              </div>
            )}

            {/* Enhanced Bug Risk */}
            <div className={`relative bg-white rounded-xl p-4 shadow-md border-2 overflow-hidden ${
              riskInfo?.bg === 'bg-green-50' ? 'border-green-300' :
              riskInfo?.bg === 'bg-yellow-50'? 'border-yellow-300' : 'border-red-300'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${riskInfo?.bg}`}>
                    <Icon name={riskInfo?.icon} size={22} className={riskInfo?.color} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Bug Risk Level</p>
                    <p className={`text-xl font-bold ${riskInfo?.color}`}>{riskInfo?.label}</p>
                  </div>
                </div>
                <Icon name="Shield" size={32} className="text-gray-300" />
              </div>
            </div>

            {/* Enhanced AI Summary */}
            {aiAnalysis?.summary && (
              <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Icon name="FileText" size={18} className="text-purple-600" />
                    <span className="text-sm font-bold text-gray-900">AI Summary</span>
                  </div>
                  <Icon 
                    name={isExpanded ? 'ChevronUp' : 'ChevronDown'} 
                    size={20} 
                    className="text-gray-500 transition-transform"
                  />
                </button>
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-gray-100">
                    <p className="mt-3 text-sm text-gray-700 leading-relaxed bg-gradient-to-r from-purple-50 to-blue-50 p-3 rounded-lg">
                      {aiAnalysis?.summary}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Enhanced Tags */}
            {aiAnalysis?.tags?.length > 0 && (
              <div className="bg-white rounded-xl p-4 shadow-md border border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <Icon name="Tag" size={18} className="text-purple-600" />
                  <span className="text-sm font-bold text-gray-900">AI-Generated Tags</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {aiAnalysis?.tags?.slice(0, 6)?.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-gradient-to-r from-purple-100 to-blue-100 border border-purple-300 text-sm text-purple-700 font-medium rounded-lg hover:from-purple-200 hover:to-blue-200 transition-all cursor-pointer transform hover:scale-105 shadow-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                  {aiAnalysis?.tags?.length > 6 && (
                    <span className="px-3 py-1.5 bg-gray-100 border border-gray-300 text-sm text-gray-700 font-medium rounded-lg">
                      +{aiAnalysis?.tags?.length - 6} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AITagsDisplay;