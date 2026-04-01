import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Zap, ArrowLeft, Download, Share2, RefreshCw } from 'lucide-react';
import Button from '../../components/ui/Button';
import { supabase } from '../../lib/supabase';
import { analyzeSnippetWithAI } from '../../services/aiTaggingService';


import RecommendationCard from './components/RecommendationCard';
import TagCloud from './components/TagCloud';
import Icon from '../../components/AppIcon';
import AppShell from "../../components/AppShell";
import CategoryBreakdown from './components/CategoryBreakdown';


export default function AIOptimizationReportPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [expandedCategories, setExpandedCategories] = useState(new Set(['performance']));
  const analysisInitiated = useRef(false);

  useEffect(() => {
    loadReportData();
  }, [searchParams]);

  const loadReportData = async () => {
    const snippetId = searchParams?.get('snippetId');
    
    // CRITICAL FIX: Check for snippetId first
    if (!snippetId) {
      console.error('❌ No snippetId provided in URL');
      setError('No snippet ID provided. Please access this page from a snippet detail page.');
      setLoading(false);
      return;
    }

    console.log('🔍 Loading AI optimization report for snippet:', snippetId);

    try {
      setLoading(true);
      setError('');
      
      // Fetch snippet details from Supabase
      const { data: snippet, error: snippetError } = await supabase
        ?.from('snippets')
        ?.select('*')
        ?.eq('id', snippetId)
        ?.single();

      if (snippetError) {
        console.error('❌ Failed to fetch snippet:', snippetError);
        throw snippetError;
      }

      if (!snippet) {
        console.error('❌ Snippet not found for ID:', snippetId);
        setError('Snippet not found');
        setLoading(false);
        return;
      }

      console.log('✅ Snippet loaded:', { 
        id: snippet?.id, 
        title: snippet?.title,
        hasAnalysis: !!snippet?.ai_analysis_data,
        hasScore: !!snippet?.ai_quality_score
      });

      // Use cached analysis if available
      if (snippet?.ai_analysis_data && (snippet?.ai_quality_score || snippet?.ai_quality_score === 0)) {
        // Use cached analysis
        console.log('✅ Using cached AI analysis');
        const analysis = typeof snippet?.ai_analysis_data === 'string'
          ? JSON.parse(snippet?.ai_analysis_data)
          : snippet?.ai_analysis_data;
        const report = transformAnalysisToReport(snippet, analysis);
        setReportData(report);
        setLoading(false);
        return;
      }

      // Check if snippet has AI analysis data
      if (!snippet?.ai_analysis_data || !snippet?.ai_quality_score) {
        console.warn('⚠️ Snippet missing AI analysis - triggering automatic generation');
        
        // No analysis exists - automatically generate it in background
        if (!analysisInitiated?.current) {
          analysisInitiated.current = true;
          setLoading(false);
          setAnalyzing(true);
          
          // Perform analysis and update display seamlessly
          await performBackgroundAnalysis(snippet);
        } else {
          console.error('❌ Analysis already attempted and failed');
          setError('Analysis could not be completed. Please try reanalyzing using the button below.');
          setLoading(false);
          
          // Show fallback UI with retry option
          setReportData({
            snippet: {
              id: snippet?.id,
              title: snippet?.title,
              language: snippet?.language
            },
            needsAnalysis: true
          });
        }
        return;
      }

      // Parse existing AI analysis
      const analysis = typeof snippet?.ai_analysis_data === 'string' 
        ? JSON.parse(snippet?.ai_analysis_data)
        : snippet?.ai_analysis_data;

      console.log('✅ AI analysis data parsed successfully');

      // Transform and display report
      const report = transformAnalysisToReport(snippet, analysis);
      setReportData(report);
      
    } catch (err) {
      console.error('❌ Failed to load report:', err);
      setError(err?.message || 'Failed to load optimization report');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Perform analysis in background and seamlessly update the page
   */
  const performBackgroundAnalysis = async (snippet) => {
    const snippetId = snippet?.id;
    
    try {
      setAnalyzing(true);
      setError('');

      console.log('🚀 Generating comprehensive AI analysis for snippet:', snippetId);

      // Call AI analysis service with complete snippet data
      const analysisResult = await analyzeSnippetWithAI({
        code: snippet?.code,
        language: snippet?.language,
        title: snippet?.title
      });

      console.log('✅ AI analysis completed:', {
        qualityScore: analysisResult?.qualityScore,
        tagsCount: analysisResult?.tags?.length
      });

      // Update snippet with new analysis in Supabase
      const { error: updateError } = await supabase
        ?.from('snippets')
        ?.update({
          ai_analysis_data: { summary: analysisResult?.summary, strengths: analysisResult?.strengths, weaknesses: analysisResult?.weaknesses, improvements: analysisResult?.improvements, recommendations: analysisResult?.recommendations, categories: analysisResult?.categories, complexityLevel: analysisResult?.complexityLevel, bugRisk: analysisResult?.bugRisk, readabilityScore: analysisResult?.readabilityScore, purposeTags: analysisResult?.purposeTags, functionalityTags: analysisResult?.functionalityTags, searchAliases: analysisResult?.searchAliases, metrics: analysisResult?.metrics, requestId: analysisResult?.requestId, analysisVersion: analysisResult?.analysisVersion },
          ai_quality_score: Math.round(analysisResult?.qualityScore || 0),
          ai_tags: analysisResult?.tags,
          updated_at: new Date()?.toISOString()
        })
        ?.eq('id', snippetId);

      if (updateError) {
        console.error('❌ Failed to update snippet with analysis:', updateError);
        throw updateError;
      }

      console.log('✅ Snippet updated with AI analysis in database');

      // Transform and display the new analysis immediately
      const report = transformAnalysisToReport(
        { ...snippet, ai_analysis_data: analysisResult?.categories, ai_quality_score: Math.round(analysisResult?.qualityScore || 0), ai_tags: analysisResult?.tags },
        analysisResult
      );
      
      setReportData(report);
      setAnalyzing(false);
      
      console.log('✅ Report displayed successfully');
      
    } catch (err) {
      console.error('❌ Background analysis failed:', err);
      analysisInitiated.current = false;

      // Show user-friendly error message
      if (err?.message?.includes('API key')) {
        setError('OpenAI API key not configured. Please add VITE_OPENAI_API_KEY to your .env file to enable AI analysis.');
      } else if (err?.message?.includes('Code is required')) {
        setError('This snippet has no code to analyze. Please add code to the snippet first.');
      } else {
        setError(err?.message || 'Failed to analyze snippet automatically. Please try reanalyzing using the button below.');
      }
      
      // Show fallback UI with retry option
      setReportData({
        snippet: {
          id: snippet?.id,
          title: snippet?.title,
          language: snippet?.language
        },
        needsAnalysis: true
      });
      
      setAnalyzing(false);
    }
  };

  const transformAnalysisToReport = (snippet, analysis) => {
    // Transform AI analysis into report structure - using correct column names
    // Convert ai_tags from flat array to display format
    const tagsForDisplay = Array.isArray(snippet?.ai_tags) 
      ? snippet?.ai_tags
      : [
          ...(snippet?.ai_tags?.primary || []),
          ...(snippet?.ai_tags?.secondary || []),
          ...(snippet?.ai_tags?.frameworks || [])
        ];
    
    return {
      snippet: {
        id: snippet?.id,
        title: snippet?.title,
        language: snippet?.language,
        framework: analysis?.framework || [],
        linesOfCode: snippet?.code?.split('\n')?.length || 0,
        analyzedAt: snippet?.updated_at
      },
      overallScore: snippet?.ai_quality_score || 0,
      readabilityScore: analysis?.readabilityScore || 0,
      categories: analysis?.categories || [],
      aiTags: tagsForDisplay,
      summary: analysis?.summary || '',
      styleMatchScore: analysis?.styleMatchScore || 0,
      bugRisk: analysis?.bugRisk || 'unknown',
      complexityLevel: analysis?.complexityLevel || 'medium',
      recommendations: analysis?.recommendations || { quick: [], detailed: [] },
      securityAnalysis: analysis?.securityAnalysis || null,
      bugReview: analysis?.bugReview || null,
      codeSmells: analysis?.codeSmells || [],
      performanceDiagnostics: analysis?.performanceDiagnostics || null,
      architecturalReview: analysis?.architecturalReview || null,
      needsAnalysis: false
    };
  };

  const handleReanalyze = async () => {
    const snippetId = searchParams?.get('snippetId');
    
    if (!snippetId) {
      setError('No snippet ID provided');
      return;
    }

    try {
      setAnalyzing(true);
      setError('');

      console.log('🔄 Reanalyzing snippet:', snippetId);

      // Fetch current snippet data
      const { data: snippet, error: fetchError } = await supabase
        ?.from('snippets')
        ?.select('*')
        ?.eq('id', snippetId)
        ?.single();

      if (fetchError) {
        console.error('❌ Failed to fetch snippet for reanalysis:', fetchError);
        throw fetchError;
      }

      if (!snippet) {
        setError('Snippet not found');
        return;
      }

      if (!snippet?.code || !snippet?.code?.trim()) {
        setError('This snippet has no code to analyze. Please add code to the snippet first.');
        setAnalyzing(false);
        return;
      }

      console.log('🚀 Starting reanalysis with AI service');

      // Call AI analysis service
      const analysisResult = await analyzeSnippetWithAI({
        code: snippet?.code,
        language: snippet?.language,
        title: snippet?.title
      });

      console.log('✅ Reanalysis completed:', {
        qualityScore: analysisResult?.qualityScore,
        tagsCount: analysisResult?.tags?.length
      });

      // Update snippet with new analysis
      const { error: updateError } = await supabase
        ?.from('snippets')
        ?.update({
          ai_analysis_data: { summary: analysisResult?.summary, strengths: analysisResult?.strengths, weaknesses: analysisResult?.weaknesses, improvements: analysisResult?.improvements, recommendations: analysisResult?.recommendations, categories: analysisResult?.categories, complexityLevel: analysisResult?.complexityLevel, bugRisk: analysisResult?.bugRisk, readabilityScore: analysisResult?.readabilityScore, purposeTags: analysisResult?.purposeTags, functionalityTags: analysisResult?.functionalityTags, searchAliases: analysisResult?.searchAliases, metrics: analysisResult?.metrics, requestId: analysisResult?.requestId, analysisVersion: analysisResult?.analysisVersion },
          ai_quality_score: Math.round(analysisResult?.qualityScore || 0),
          ai_tags: analysisResult?.tags,
          updated_at: new Date()?.toISOString()
        })
        ?.eq('id', snippetId);

      if (updateError) {
        console.error('❌ Failed to update snippet after reanalysis:', updateError);
        throw updateError;
      }

      console.log('✅ Snippet updated with reanalysis results');

      // Reset analysis flag and reload
      analysisInitiated.current = false;
      await loadReportData();
      
      console.log('✅ Report reloaded with new analysis');
      
    } catch (err) {
      console.error('❌ Failed to reanalyze:', err);
      
      if (err?.message?.includes('API key')) {
        setError('OpenAI API key not configured. Please add VITE_OPENAI_API_KEY to your .env file to enable AI analysis.');
      } else if (err?.message?.includes('Code is required')) {
        setError('This snippet has no code to analyze. Please add code to the snippet first.');
      } else {
        setError(err?.message || 'Failed to reanalyze snippet. Please try again.');
      }
    } finally {
      setAnalyzing(false);
    }
  };

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet?.has(categoryId)) {
        newSet?.delete(categoryId);
      } else {
        newSet?.add(categoryId);
      }
      return newSet;
    });
  };

  const handleExportReport = () => {
    // Create downloadable report
    const reportContent = JSON.stringify(reportData, null, 2);
    const blob = new Blob([reportContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-report-${reportData?.snippet?.id}-${Date.now()}.json`;
    document.body?.appendChild(a);
    a?.click();
    document.body?.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getSeverityColor = (severity) => {
    const colors = {
      critical: 'text-error bg-error/10 border-error/20',
      high: 'text-orange-600 bg-orange-50 border-orange-200',
      medium: 'text-warning bg-warning/10 border-warning/20',
      low: 'text-primary bg-primary/10 border-primary/20'
    };
    return colors?.[severity] || colors?.low;
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-error';
  };

  if (loading) {
    return (
      <AppShell pageTitle="AI Report">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-text-secondary">Loading report...</p>
          </div>
        </div>
      </AppShell>
    );
  }

  // Show analyzing state with progress message
  if (analyzing && !reportData) {
    return (
      <AppShell pageTitle="AI Report">
        <Helmet>
          <title>AI Optimization Report - HyvHub</title>
        </Helmet>
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Snippet
        </Button>

        <div className="bg-card rounded-lg shadow-lg p-8 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Generating Comprehensive AI Report
          </h2>
          <p className="text-muted-foreground mb-2">
            Analyzing your code with OpenAI GPT-4...
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            This includes performance analysis, security review, bug detection, and optimization recommendations.
          </p>
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 text-left max-w-md mx-auto">
            <p className="text-sm text-foreground font-medium mb-2">What's being analyzed:</p>
            <ul className="text-xs text-foreground space-y-1">
              <li>✓ Automatic language detection and tagging</li>
              <li>✓ Performance bottlenecks and optimization opportunities</li>
              <li>✓ Security vulnerabilities and best practices</li>
              <li>✓ Code quality, readability, and maintainability</li>
              <li>✓ Bug detection and edge case analysis</li>
              <li>✓ Architectural patterns and recommendations</li>
            </ul>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Please wait - comprehensive analysis takes 10-30 seconds
          </p>
        </div>
      </AppShell>
    );
  }

  if (error && !reportData) {
    return (
      <AppShell pageTitle="AI Report">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Snippet
        </Button>
        <div className="bg-error/100/10 border border-error rounded-lg p-4">
          <p className="text-error mb-4">{error}</p>
          <div className="flex gap-2">
            <Button onClick={() => navigate(-1)}>
              Go Back
            </Button>
            <Button variant="outline" onClick={handleReanalyze} disabled={analyzing}>
              {analyzing ? 'Analyzing...' : 'Retry Analysis'}
            </Button>
          </div>
        </div>
      </AppShell>
    );
  }

  // Show "needs analysis" state only if auto-analysis failed
  if (reportData?.needsAnalysis) {
    return (
      <AppShell pageTitle="AI Report">
        <Helmet>
          <title>AI Optimization Report - HyvHub</title>
        </Helmet>
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Snippet
        </Button>

        <div className="bg-card rounded-lg shadow-lg p-8 text-center">
          <Icon name="Sparkles" size={64} className="mx-auto text-primary mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-4">
            AI Analysis Failed
          </h2>
          <p className="text-muted-foreground mb-6">
            The automatic analysis didn't complete. Click below to try again.
          </p>
          {error && (
            <div className="bg-error/10 border border-error/20 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-error">{error}</p>
            </div>
          )}
          <Button
            onClick={handleReanalyze}
            disabled={analyzing}
            size="lg"
          >
            {analyzing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Analyzing...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 mr-2" />
                Retry AI Analysis
              </>
            )}
          </Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell pageTitle="AI Report">
      <Helmet>
        <title>AI Optimization Report - HyvHub</title>
      </Helmet>
          {/* Header */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Snippet
            </Button>

            <div className="bg-card rounded-lg shadow-lg p-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-foreground mb-1">
                    AI Optimization Report
                  </h1>
                  <p className="text-sm text-muted-foreground">{reportData?.snippet?.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Analyzed: {new Date(reportData?.snippet?.analyzedAt)?.toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2 mt-4 sm:mt-0">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleReanalyze}
                    disabled={analyzing}
                  >
                    {analyzing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Reanalyze
                      </>
                    )}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleExportReport}>
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>

              {/* Compact Overall Score */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Optimization</p>
                  <div className="flex items-baseline">
                    <span className={`text-2xl font-bold ${getScoreColor(reportData?.overallScore)}`}>
                      {reportData?.overallScore}
                    </span>
                    <span className="text-xs text-muted-foreground ml-1">/100</span>
                  </div>
                </div>
                <div className="bg-background rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Readability</p>
                  <div className="flex items-baseline">
                    <span className={`text-2xl font-bold ${getScoreColor(reportData?.readabilityScore)}`}>
                      {reportData?.readabilityScore}
                    </span>
                    <span className="text-xs text-muted-foreground ml-1">/100</span>
                  </div>
                </div>
                <div className="bg-background rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Complexity</p>
                  <p className="text-lg font-bold text-foreground capitalize">{reportData?.complexityLevel}</p>
                </div>
                <div className="bg-background rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Bug Risk</p>
                  <p className="text-lg font-bold text-success capitalize">{reportData?.bugRisk}</p>
                </div>
                <div className="bg-background rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Style Match</p>
                  <p className="text-lg font-bold text-primary">{reportData?.styleMatchScore}%</p>
                </div>
              </div>

              {/* Compact AI Summary */}
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 mt-4">
                <p className="text-xs font-medium text-foreground mb-1">AI Summary</p>
                <p className="text-sm text-foreground">{reportData?.summary}</p>
              </div>
            </div>
          </div>

          {/* Compact Tag Cloud */}
          <TagCloud tags={reportData?.aiTags} />

          {/* Comprehensive Analysis - Single Source of Truth */}
          <CategoryBreakdown 
            categories={reportData?.categories}
            securityAnalysis={reportData?.securityAnalysis}
            bugReview={reportData?.bugReview}
            codeSmells={reportData?.codeSmells}
            performanceDiagnostics={reportData?.performanceDiagnostics}
            architecturalReview={reportData?.architecturalReview}
          />

          {/* Compact Quick Recommendations */}
          <div className="bg-card rounded-lg shadow-lg p-5 my-6">
            <h2 className="text-lg font-bold text-foreground mb-3">Quick Wins</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {reportData?.recommendations?.quick?.map((rec, index) => (
                <div key={index} className="bg-success/10 border border-success/20 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-foreground">{rec}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Compact Detailed Recommendations */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-foreground">Detailed Recommendations</h2>
            {reportData?.recommendations?.detailed?.map((rec, index) => (
              <RecommendationCard key={index} recommendation={rec} />
            ))}
          </div>
    </AppShell>
  );
}