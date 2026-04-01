import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import MetadataSection from '../create-snippet/components/MetadataSection';
import CodeEditor from '../create-snippet/components/CodeEditor';
import FileUploadSection from '../create-snippet/components/FileUploadSection';
import AISuggestions from '../create-snippet/components/AISuggestions';
import AppShell from '../../components/AppShell';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { snippetService } from '../../services/snippetService';
import { hiveService } from '../../services/hiveService';
import aiTaggingService from '../../services/aiTaggingService';

const HiveSnippetEditor = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const hiveIdFromUrl = searchParams?.get('hive');
  const editId = searchParams?.get('edit');
  const isEditMode = !!editId;

  // Authentication check
  useEffect(() => {
    if (!user) {
      console.warn('User not authenticated, redirecting to login');
      navigate('/login', { replace: true });
      return;
    }
    
    if (!hiveIdFromUrl) {
      console.warn('No hive ID provided, redirecting to hive landing');
      navigate('/global-hives-landing', { replace: true });
    }
  }, [user, hiveIdFromUrl, navigate]);

  // State
  const [loading, setLoading] = useState(false);
  const [hiveDetails, setHiveDetails] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [code, setCode] = useState('');
  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiResults, setAiResults] = useState(null);

  // Load hive details
  useEffect(() => {
    const loadHiveDetails = async () => {
      if (!hiveIdFromUrl) return;

      try {
        setLoading(true);
        const details = await hiveService?.getHiveDetails(hiveIdFromUrl);
        setHiveDetails(details);
      } catch (err) {
        console.error('Error loading hive details:', err);
        setErrors({
          submit: 'Failed to load hive details. Please try again.'
        });
      } finally {
        setLoading(false);
      }
    };

    loadHiveDetails();
  }, [hiveIdFromUrl]);

  // Load snippet for edit mode
  useEffect(() => {
    const loadSnippetForEdit = async () => {
      if (!isEditMode || !editId) return;

      try {
        setLoading(true);
        const snippetData = await snippetService?.getSnippetById(editId);

        if (snippetData?.user?.id !== user?.id) {
          throw new Error('You do not have permission to edit this snippet');
        }

        setTitle(snippetData?.title || '');
        setDescription(snippetData?.description || '');
        setCode(snippetData?.code || '');

        if (snippetData?.aiTags && Array.isArray(snippetData?.aiTags)) {
          setTags(snippetData?.aiTags?.join(', '));
        }

        if (snippetData?.aiQualityScore || snippetData?.aiAnalysisData) {
          setAiResults({
            tags: snippetData?.aiTags || [],
            qualityScore: snippetData?.aiQualityScore || 0,
            aiAnalysisData: snippetData?.aiAnalysisData || null,
            detectedLanguage: snippetData?.language || null
          });
        }
      } catch (err) {
        console.error('Error loading snippet for edit:', err);
        setErrors({
          submit: err?.message || 'Failed to load snippet.'
        });
        setTimeout(() => navigate(`/hive-explorer?hive=${hiveIdFromUrl}`), 2000);
      } finally {
        setLoading(false);
      }
    };

    loadSnippetForEdit();
  }, [isEditMode, editId, user, hiveIdFromUrl, navigate]);

  // Language mapping
  const mapLanguageToEnum = (detectedLang) => {
    if (!detectedLang) return 'other';

    const lang = detectedLang?.toLowerCase();

    const validEnums = [
      'javascript', 'typescript', 'python', 'java', 'cpp', 'csharp',
      'ruby', 'go', 'rust', 'php', 'sql', 'html', 'css', 'jsx', 'tsx',
      'markdown', 'json', 'yaml', 'xml', 'bash', 'shell', 'swift',
      'kotlin', 'dart', 'vue', 'svelte'
    ];

    if (validEnums?.includes(lang)) {
      return lang;
    }

    const languageMap = {
      'js': 'javascript',
      'ts': 'typescript',
      'py': 'python',
      'c++': 'cpp',
      'c#': 'csharp',
      'rb': 'ruby',
      'rs': 'rust',
      'sh': 'bash',
      'zsh': 'bash',
      'htm': 'html',
      'html5': 'html',
      'md': 'markdown',
      'yml': 'yaml',
      'kt': 'kotlin',
      'golang': 'go',
      'scss': 'css',
      'sass': 'css',
      'less': 'css',
      'css3': 'css',
      'jsonc': 'json',
      'svg': 'xml',
      'xhtml': 'xml',
      'powershell': 'shell',
      'ps1': 'shell',
      'bat': 'shell',
      'cmd': 'shell',
      'flutter': 'dart',
      'vuejs': 'vue',
      'mysql': 'sql',
      'postgresql': 'sql',
      'postgres': 'sql',
      'sqlite': 'sql',
      'c sharp': 'csharp',
      'c plus plus': 'cpp',
      'react': 'jsx',
      'vue.js': 'vue',
      'angular': 'typescript',
      'svelte.js': 'svelte',
      'plaintext': 'other',
      'text': 'other',
      'unknown': 'other'
    };

    return languageMap?.[lang] || 'other';
  };

  // Loading state
  if (loading || !user || !hiveIdFromUrl) {
    return (
      <AppShell pageTitle="Snippet Editor">
        <div className="flex items-center justify-center h-[calc(100vh-120px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">
              {loading ? 'Loading...' : 'Initializing editor...'}
            </p>
          </div>
        </div>
      </AppShell>
    );
  }

  const handleBackNavigation = () => {
    navigate(`/hive-explorer?hive=${hiveIdFromUrl}`);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!title?.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!code?.trim()) {
      newErrors.code = 'Code content is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleAIAnalyze = async () => {
    if (!code?.trim()) {
      setErrors({ code: 'Please enter some code to analyze' });
      return;
    }

    try {
      setAiAnalyzing(true);
      setErrors({}); // Clear any previous errors

      const result = await aiTaggingService?.analyzeSnippetWithAI({
        code: code?.trim(),
        title: title || 'Code Analysis',
        generateFullReport: true
      });

      setAiResults({
        tags: result?.tags || [],
        qualityScore: result?.qualityScore || 0,
        detectedLanguage: result?.detectedLanguage || 'unknown',
        languageConfidence: result?.languageConfidence || 'low',
        aiAnalysisData: { summary: result?.summary || '', strengths: result?.strengths || [], weaknesses: result?.weaknesses || [], improvements: result?.improvements || [], categories: result?.categories || [], recommendations: result?.recommendations || { quick: [], detailed: [] }, metrics: result?.metrics || {}, purposeTags: result?.purposeTags || [], functionalityTags: result?.functionalityTags || [], searchAliases: result?.searchAliases || [], readabilityScore: result?.readabilityScore || 0, bugRisk: result?.bugRisk || 'unknown', requestId: result?.requestId, analysisVersion: result?.analysisVersion || 'v2' }
      });

      if (result?.detectedLanguage) {
        console.log('✅ AI detected language:', result?.detectedLanguage);
      }

      // Show success message
      setErrors({
        success: '✨ AI analysis completed successfully!'
      });

      // Clear success message after 5 seconds
      setTimeout(() => {
        setErrors(prev => {
          const { success, ...rest } = prev;
          return rest;
        });
      }, 5000);
    } catch (err) {
      console.error('Error analyzing code:', err);
      
      let errorMessage = 'Failed to analyze code. ';
      
      if (err?.message?.includes('timeout') || err?.message?.includes('ECONNABORTED')) {
        errorMessage += 'The request took too long. Please try again.';
      } else if (err?.message?.includes('API key')) {
        errorMessage += 'OpenAI API key issue.';
      } else if (err?.message?.includes('quota') || err?.message?.includes('rate limit')) {
        errorMessage += 'API quota exceeded.';
      } else {
        errorMessage += err?.message || 'Unknown error occurred.';
      }
      
      setErrors({ submit: errorMessage });

      // Clear error message after 10 seconds
      setTimeout(() => {
        setErrors(prev => {
          const { submit, ...rest } = prev;
          return rest;
        });
      }, 10000);
    } finally {
      // CRITICAL: Always clear analyzing state
      setAiAnalyzing(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!validateForm()) return;

    setSaving(true);
    setErrors({});

    try {
      let aiTags = null;
      let aiQualityScore = null;
      let aiAnalysisData = null;
      let detectedLanguage = 'other';

      if (aiResults && typeof aiResults === 'object') {
        if (aiResults?.detectedLanguage) {
          detectedLanguage = mapLanguageToEnum(aiResults?.detectedLanguage);
        }

        if (Array.isArray(aiResults?.tags) && aiResults?.tags?.length > 0) {
          aiTags = aiResults?.tags;
        }

        if (typeof aiResults?.qualityScore === 'number') {
          aiQualityScore = aiResults?.qualityScore;
        }

        if (aiResults?.aiAnalysisData && typeof aiResults?.aiAnalysisData === 'object') {
          aiAnalysisData = aiResults?.aiAnalysisData;
        }
      }

      if (!aiTags && tags?.trim()) {
        aiTags = tags?.split(',')?.map(t => t?.trim())?.filter(Boolean);
      }

      if (isEditMode) {
        // CRITICAL FIX: Edit mode should maintain hive-only visibility
        const updateData = {
          title: title?.trim(),
          description: description?.trim() || null,
          code: code?.trim(),
          language: detectedLanguage,
          visibility: 'team' // Changed from 'private' to 'team' to keep in hive only
        };

        if (aiTags && Array.isArray(aiTags) && aiTags?.length > 0) {
          updateData.aiTags = aiTags;
        }

        if (typeof aiQualityScore === 'number') {
          updateData.aiQualityScore = aiQualityScore;
        }

        if (aiAnalysisData && typeof aiAnalysisData === 'object') {
          updateData.aiAnalysisData = aiAnalysisData;
        }

        await snippetService?.updateSnippet(editId, updateData);

        // Ensure hive_snippets entry exists for edit mode
        const { data: existingHiveSnippet } = await supabase
          ?.from('hive_snippets')
          ?.select('id')
          ?.eq('hive_id', hiveIdFromUrl)
          ?.eq('snippet_id', editId)
          ?.single();

        if (!existingHiveSnippet) {
          const { error: hiveSnippetError } = await supabase
            ?.from('hive_snippets')
            ?.insert({
              hive_id: hiveIdFromUrl,
              snippet_id: editId,
              added_by: user?.id
            });

          if (hiveSnippetError) {
            console.error('Error linking snippet to hive:', hiveSnippetError);
            throw new Error('Failed to link snippet to hive');
          }
          console.log('✅ Snippet linked to hive');
        }

        // CRITICAL FIX: Component will unmount during navigation, no need to clear saving state
        navigate(`/hive-explorer?hive=${hiveIdFromUrl}`, { 
          replace: true,
          state: { refresh: true, timestamp: Date.now() }
        });
      } else {
        // CRITICAL FIX: Create mode should ONLY publish to hive, never to My Snippets
        const snippetData = {
          title: title?.trim(),
          description: description?.trim() || null,
          code: code?.trim(),
          language: detectedLanguage,
          visibility: 'team', // Changed from 'private' to 'team' - hive-only visibility
          snippet_type: 'code',
          user_id: user?.id,
          team_id: null // Explicitly null - not a team snippet, but a hive snippet
        };

        if (aiTags && Array.isArray(aiTags) && aiTags?.length > 0) {
          snippetData.ai_tags = aiTags;
        }

        if (typeof aiQualityScore === 'number') {
          snippetData.ai_quality_score = aiQualityScore;
        }

        if (aiAnalysisData && typeof aiAnalysisData === 'object') {
          snippetData.ai_analysis_data = aiAnalysisData;
        }

        const { data, error: createError } = await supabase
          ?.from('snippets')
          ?.insert([snippetData])
          ?.select()
          ?.single();

        if (createError) {
          throw new Error(createError?.message || 'Failed to save draft');
        }

        console.log('✅ Snippet created:', data?.id);

        // CRITICAL FIX: Link to hive immediately so it ONLY appears in hive, not My Snippets
        const { error: hiveSnippetError } = await supabase
          ?.from('hive_snippets')
          ?.insert({
            hive_id: hiveIdFromUrl,
            snippet_id: data?.id,
            added_by: user?.id
          });

        if (hiveSnippetError) {
          console.error('Error linking snippet to hive:', hiveSnippetError);
          // Rollback: delete the snippet if linking fails
          await supabase?.from('snippets')?.delete()?.eq('id', data?.id);
          throw new Error('Failed to link snippet to hive. Please try again.');
        }

        console.log('✅ Snippet linked to hive via hive_snippets table');

        // CRITICAL FIX: Component will unmount during navigation, no need to clear saving state
        navigate(`/hive-explorer?hive=${hiveIdFromUrl}`, { 
          replace: true,
          state: { refresh: true, timestamp: Date.now() }
        });
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      setErrors({
        submit: error?.message || 'Failed to save draft.'
      });
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!validateForm()) return;

    // Set loading state FIRST - before any async operations
    setSaving(true);
    setErrors({});

    try {
      let aiTags = null;
      let aiQualityScore = null;
      let aiAnalysisData = null;
      let detectedLanguage = 'other';

      if (aiResults && typeof aiResults === 'object') {
        if (aiResults?.detectedLanguage) {
          detectedLanguage = mapLanguageToEnum(aiResults?.detectedLanguage);
        }

        if (Array.isArray(aiResults?.tags) && aiResults?.tags?.length > 0) {
          aiTags = aiResults?.tags;
        }

        if (typeof aiResults?.qualityScore === 'number') {
          aiQualityScore = aiResults?.qualityScore;
        }

        if (aiResults?.aiAnalysisData && typeof aiResults?.aiAnalysisData === 'object') {
          aiAnalysisData = aiResults?.aiAnalysisData;
        }
      }

      if (!aiTags && tags?.trim()) {
        aiTags = tags?.split(',')?.map(t => t?.trim())?.filter(Boolean);
      }

      if (isEditMode) {
        // Edit mode: Update existing snippet
        const updateData = {
          title: title?.trim(),
          description: description?.trim() || null,
          code: code?.trim(),
          language: detectedLanguage,
          visibility: 'team'
        };

        if (aiTags && Array.isArray(aiTags) && aiTags?.length > 0) {
          updateData.aiTags = aiTags;
        }

        if (typeof aiQualityScore === 'number') {
          updateData.aiQualityScore = aiQualityScore;
        }

        if (aiAnalysisData && typeof aiAnalysisData === 'object') {
          updateData.aiAnalysisData = aiAnalysisData;
        }

        await snippetService?.updateSnippet(editId, updateData);
        console.log('✅ Snippet updated successfully');

        // Ensure hive_snippets entry exists for edit mode
        const { data: existingHiveSnippet } = await supabase
          ?.from('hive_snippets')
          ?.select('id')
          ?.eq('hive_id', hiveIdFromUrl)
          ?.eq('snippet_id', editId)
          ?.single();

        if (!existingHiveSnippet) {
          const { error: hiveSnippetError } = await supabase
            ?.from('hive_snippets')
            ?.insert({
              hive_id: hiveIdFromUrl,
              snippet_id: editId,
              added_by: user?.id
            });

          if (hiveSnippetError) {
            console.error('Error linking snippet to hive:', hiveSnippetError);
            throw new Error('Failed to link snippet to hive');
          }
          console.log('✅ Snippet linked to hive');
        }
      } else {
        // Create mode: Insert new snippet
        const snippetData = {
          title: title?.trim(),
          description: description?.trim() || null,
          code: code?.trim(),
          language: detectedLanguage,
          visibility: 'team',
          snippet_type: 'code',
          user_id: user?.id,
          team_id: null
        };

        if (aiTags && Array.isArray(aiTags) && aiTags?.length > 0) {
          snippetData.ai_tags = aiTags;
        }

        if (typeof aiQualityScore === 'number') {
          snippetData.ai_quality_score = aiQualityScore;
        }

        if (aiAnalysisData && typeof aiAnalysisData === 'object') {
          snippetData.ai_analysis_data = aiAnalysisData;
        }

        const { data: newSnippet, error: createError } = await supabase
          ?.from('snippets')
          ?.insert([snippetData])
          ?.select()
          ?.single();

        if (createError) {
          throw new Error(createError?.message || 'Failed to publish snippet');
        }

        console.log('✅ Snippet created:', newSnippet?.id);

        const { error: hiveSnippetError } = await supabase
          ?.from('hive_snippets')
          ?.insert({
            hive_id: hiveIdFromUrl,
            snippet_id: newSnippet?.id,
            added_by: user?.id
          });

        if (hiveSnippetError) {
          console.error('Error linking snippet to hive:', hiveSnippetError);
          // Rollback: delete the snippet if linking fails
          await supabase?.from('snippets')?.delete()?.eq('id', newSnippet?.id);
          throw new Error('Failed to link snippet to hive. Please try again.');
        }

        console.log('✅ Snippet linked to hive via hive_snippets table');
      }

      // CRITICAL FIX: All operations complete, now navigate
      // Clear saving state synchronously
      setSaving(false);
      
      // Force immediate navigation without any delays
      // Use navigate with state to trigger refresh on destination
      navigate(`/hive-explorer?hive=${hiveIdFromUrl}`, { 
        replace: true,
        state: { refresh: true, timestamp: Date.now() }
      });
      
    } catch (error) {
      console.error('❌ Error publishing snippet:', error);
      setErrors({
        submit: error?.message || 'Failed to publish snippet. Please try again.'
      });
      // Only clear saving state on error
      setSaving(false);
    }
  };

  const handlePreview = () => {
    setShowPreview(!showPreview);
  };

  return (
    <AppShell pageTitle="Snippet Editor">
        <div className="bg-card rounded-lg shadow-lg p-8">
          {/* Hive Context Indicator */}
          {hiveDetails && (
            <div className="mb-6 bg-primary/10 border border-border rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Icon name="Hexagon" className="text-primary mt-0.5" size={20} />
                <div className="flex-1">
                  <p className="text-primary font-semibold">
                    Creating for Hive: {hiveDetails?.name}
                  </p>
                  <p className="text-primary text-sm">
                    This snippet will be automatically shared with all hive members
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Header */}
          <header className="bg-card border-b border-border sticky top-0 z-50 -mx-8 -mt-8 px-8 py-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  iconName="ArrowLeft"
                  onClick={handleBackNavigation}
                >
                  Back to Hive
                </Button>
                <div>
                  <h1 className="text-xl font-semibold text-foreground">
                    {isEditMode ? 'Edit Hive Snippet' : 'Create Hive Snippet'}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {isEditMode ? 'Update your code snippet' : 'Share code with your hive'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="default"
                  iconName="Eye"
                  iconPosition="left"
                  onClick={handlePreview}
                >
                  Preview
                </Button>
                <Button
                  variant="secondary"
                  size="default"
                  iconName="Save"
                  iconPosition="left"
                  onClick={handleSaveDraft}
                  loading={saving}
                  disabled={saving}
                >
                  {isEditMode ? 'Save Changes' : 'Save Draft'}
                </Button>
                <Button
                  variant="default"
                  size="default"
                  iconName="Send"
                  iconPosition="left"
                  onClick={handlePublish}
                  loading={saving}
                  disabled={saving}
                >
                  {isEditMode ? 'Update' : 'Publish to Hive'}
                </Button>
              </div>
            </div>

            {errors?.submit && (
              <div className="mt-4 bg-error/10 border border-error/20 text-error px-4 py-3 rounded-lg">
                <div className="flex items-start gap-2">
                  <Icon name="AlertCircle" size={20} className="flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Error</p>
                    <p className="text-sm">{errors?.submit}</p>
                  </div>
                </div>
              </div>
            )}
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <MetadataSection
                title={title}
                setTitle={setTitle}
                description={description}
                setDescription={setDescription}
                tags={tags}
                setTags={setTags}
                errors={errors}
              />

              <CodeEditor code={code} setCode={setCode} errors={errors} />

              <FileUploadSection files={files} setFiles={setFiles} />
            </div>

            {/* Right Column - AI Suggestions */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* AI Analysis */}
                <div className="bg-card rounded-lg shadow-sm border border-border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-semibold text-foreground">
                        AI Insights
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Get AI-powered code analysis
                      </p>
                    </div>
                  </div>

                  {errors?.success && (
                    <div className="mb-4 bg-success/10 border border-success/20 text-success px-3 py-2 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Icon name="CheckCircle" size={16} className="flex-shrink-0 mt-0.5" />
                        <p className="text-sm">{errors?.success}</p>
                      </div>
                    </div>
                  )}

                  {errors?.code && (
                    <div className="mb-4 bg-error/10 border border-error/20 text-error px-3 py-2 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Icon name="AlertCircle" size={16} className="flex-shrink-0 mt-0.5" />
                        <p className="text-sm">{errors?.code}</p>
                      </div>
                    </div>
                  )}

                  <Button
                    type="button"
                    onClick={handleAIAnalyze}
                    disabled={aiAnalyzing || !code?.trim()}
                    fullWidth
                    className="flex items-center justify-center gap-2"
                  >
                    <Icon name="Sparkles" size={18} />
                    {aiAnalyzing ? 'Analyzing...' : 'Analyze with AI'}
                  </Button>

                  {aiResults && (
                    <div className="space-y-4 mt-6">
                      {aiResults?.detectedLanguage && (
                        <div className="bg-primary/10 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-foreground">
                              Detected Language
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-primary uppercase">
                                {aiResults?.detectedLanguage}
                              </span>
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${
                                  aiResults?.languageConfidence === 'high' ?'bg-success/15 text-success'
                                    : aiResults?.languageConfidence === 'medium' ?'bg-warning/15 text-warning' :'bg-error/15 text-error'
                                }`}
                              >
                                {aiResults?.languageConfidence} confidence
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="bg-muted rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-muted-foreground">
                            Code Quality
                          </span>
                          <span className="text-2xl font-bold text-primary">
                            {aiResults?.qualityScore}/100
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all duration-500"
                            style={{ width: `${aiResults?.qualityScore}%` }}
                          ></div>
                        </div>
                      </div>

                      {aiResults?.tags && aiResults?.tags?.length > 0 && (
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-2">
                            Suggested Tags
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {aiResults?.tags?.map((tag, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <AISuggestions
                  code={code}
                  tags={tags}
                  setTags={setTags}
                  language={aiResults?.detectedLanguage || 'javascript'}
                />
              </div>
            </div>
          </div>
        </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-6">
          <div className="bg-card rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-semibold text-foreground">Preview</h2>
              <Button
                variant="ghost"
                size="sm"
                iconName="X"
                onClick={() => setShowPreview(false)}
              />
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-foreground mb-2">
                    {title || 'Untitled Snippet'}
                  </h1>
                  <p className="text-muted-foreground">
                    {description || 'No description provided'}
                  </p>
                </div>

                {aiResults?.detectedLanguage && (
                  <div className="flex items-center gap-2">
                    <Icon name="Code2" size={16} className="text-muted-foreground" />
                    <span className="text-sm text-muted-foreground font-medium uppercase">
                      {aiResults?.detectedLanguage}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        aiResults?.languageConfidence === 'high' ?'bg-success/15 text-success'
                          : aiResults?.languageConfidence === 'medium' ?'bg-warning/15 text-warning' :'bg-muted text-foreground'
                      }`}
                    >
                      AI detected
                    </span>
                  </div>
                )}

                {tags && (
                  <div className="flex flex-wrap gap-2">
                    {tags?.split(',')?.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 text-xs font-medium bg-primary/15 text-primary rounded-full"
                      >
                        {tag?.trim()}
                      </span>
                    ))}
                  </div>
                )}

                <div className="bg-foreground/90 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-sm text-muted font-mono">
                    <code>{code || '// No code yet'}</code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Actions */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 flex gap-3">
        <Button
          variant="outline"
          size="default"
          fullWidth
          iconName="Save"
          onClick={handleSaveDraft}
          loading={saving}
        >
          Save Draft
        </Button>
        <Button
          variant="default"
          size="default"
          fullWidth
          iconName="Send"
          onClick={handlePublish}
          loading={saving}
        >
          Publish
        </Button>
      </div>
    </AppShell>
  );
};

export default HiveSnippetEditor;