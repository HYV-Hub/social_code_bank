import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import aiTaggingService from '../../../services/aiTaggingService';

const AISuggestions = ({ code, tags, setTags, language }) => {
  const [analysis, setAnalysis] = useState({
    tags: [],
    qualityScore: null,
    qualityMetrics: {
      readability: 0,
      maintainability: 0,
      performance: 0,
      security: 0
    },
    improvements: []
  });
  const [analyzing, setAnalyzing] = useState(false);

  const analyzeCode = async () => {
    if (!code || code?.length < 50) return;
    
    setAnalyzing(true);
    
    try {
      const result = await aiTaggingService?.analyzeCode(
        code,
        language?.value || language || 'javascript',
        '', // title - not needed for analysis
        '' // description - not needed for analysis
      );
      
      setAnalysis(result);
    } catch (error) {
      console.error('Error analyzing code:', error);
      // Set fallback analysis even on error
      setAnalysis({
        tags: [language || 'code'],
        qualityScore: 50,
        qualityMetrics: {
          readability: 50,
          maintainability: 50,
          performance: 50,
          security: 50
        },
        improvements: ['Analysis failed - try again or contact support']
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const applyTag = (tag) => {
    const currentTags = tags?.split(',')?.map(t => t?.trim())?.filter(t => t);
    if (!currentTags?.includes(tag)) {
      const newTags = [...currentTags, tag];
      setTags(newTags?.join(', '));
    }
  };

  const applyAllTags = () => {
    const currentTags = tags?.split(',')?.map(t => t?.trim())?.filter(t => t);
    const newTags = [...new Set([...currentTags, ...analysis.tags])];
    setTags(newTags?.join(', '));
  };

  const getQualityColor = (score) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-error';
  };

  const getQualityBg = (score) => {
    if (score >= 80) return 'bg-success/15';
    if (score >= 60) return 'bg-warning/15';
    return 'bg-error/15';
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">
        AI Suggestions
      </h2>
      <p className="text-sm text-muted-foreground mb-4">
        AI will analyze your code and automatically detect the programming language along with generating comprehensive tags.
      </p>
      
      {/* AI Analysis Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon name="Sparkles" size={20} className="text-primary" />
          <h2 className="text-lg font-semibold text-foreground">AI Insights</h2>
        </div>
        {analyzing && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span>Analyzing...</span>
          </div>
        )}
      </div>

      {/* Quality Score */}
      {analysis?.qualityScore !== null && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">Code Quality Score</span>
            <span className={`text-2xl font-bold ${getQualityColor(analysis?.qualityScore)}`}>
              {analysis?.qualityScore}%
            </span>
          </div>
          
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full ${getQualityBg(analysis?.qualityScore)} transition-all duration-500`}
              style={{ width: `${analysis?.qualityScore}%` }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            {Object.entries(analysis?.qualityMetrics || {})?.map(([key, value]) => (
              <div key={key} className="p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground capitalize">{key}</span>
                  <span className={`text-sm font-semibold ${getQualityColor(value)}`}>
                    {value}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI-Suggested Tags */}
      {analysis?.tags?.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-muted-foreground">AI-Suggested Tags</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={applyAllTags}
              className="text-xs"
            >
              Apply All
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {analysis?.tags?.map((tag, index) => (
              <button
                key={index}
                onClick={() => applyTag(tag)}
                className="px-3 py-1.5 text-xs font-medium bg-primary/10 text-primary rounded-full hover:bg-primary/15 transition-colors flex items-center gap-1"
              >
                {tag}
                <Icon name="Plus" size={12} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* AI Improvements */}
      {analysis?.improvements?.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Icon name="Lightbulb" size={16} className="text-primary" />
            <h3 className="text-sm font-medium text-muted-foreground">AI-Suggested Improvements</h3>
          </div>
          <div className="space-y-2">
            {analysis?.improvements?.map((improvement, index) => (
              <div key={index} className="flex items-start gap-2 p-3 bg-primary/10 rounded-lg">
                <Icon name="CheckCircle2" size={16} className="text-primary mt-0.5 flex-shrink-0" />
                <p className="text-xs text-muted-foreground">{improvement}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State - Now shows prompt to manually trigger analysis */}
      {!analyzing && analysis?.qualityScore === null && (
        <div className="text-center py-8">
          <Icon name="Code2" size={32} className="text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-4">
            Click "Re-analyze Code" below to get AI-powered insights
          </p>
          <p className="text-xs text-muted-foreground">
            Manual analysis prevents automatic errors
          </p>
        </div>
      )}
    </div>
  );
};

export default AISuggestions;