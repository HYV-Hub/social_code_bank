import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';

import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import MetadataSection from './components/MetadataSection';
import CodeEditor from './components/CodeEditor';
import FileUploadSection from './components/FileUploadSection';
import VisibilityControl from './components/VisibilityControl';
import AISuggestions from './components/AISuggestions';
import AppNavigation from '../../components/AppNavigation';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { snippetService } from '../../services/snippetService';
import aiTaggingService from '../../services/aiTaggingService';

const CreateSnippet = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userProfile } = useAuth();
  const [searchParams] = useSearchParams();
  const teamIdFromUrl = searchParams?.get('team');
  const hiveIdFromUrl = searchParams?.get('hive'); // NEW: Get hive ID from URL
  const returnTo = searchParams?.get('returnTo');
  const editId = searchParams?.get('edit');
  const isEditMode = !!editId;
  
  // Add authentication check
  useEffect(() => {
    if (!user) {
      console.warn('User not authenticated, redirecting to login');
      navigate('/login', { replace: true });
    }
  }, [user, navigate]);

  // Add state to track edit mode
  const [loading, setLoading] = useState(false);

  // Add formData state declaration
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    language: 'javascript',
    code: '',
    snippetType: 'code',
    visibility: teamIdFromUrl ? 'team' : 'private',
    teamId: teamIdFromUrl || ''
  });

  // CRITICAL: Load company context and teams from location state or user profile
  useEffect(() => {
    const initializeContext = async () => {
      // FIXED: Enhanced context detection from URL pathname
      const pathname = location?.pathname || '';
      const locationCompanyId = location?.state?.companyId;
      const locationDefaultVisibility = location?.state?.defaultVisibility;
      
      // CRITICAL: Determine context from current route
      let detectedContext = 'global'; // default
      
      // NEW: Check for hive context first (highest priority)
      if (hiveIdFromUrl) {
        detectedContext = 'hive';
        // Set team to hive ID (hives use team_id field in snippets table)
        setTeam(hiveIdFromUrl);
        setVisibility('team'); // Hive snippets use 'team' visibility
        console.log('🎯 Auto-setting context to HIVE:', hiveIdFromUrl);
      } else if (pathname?.includes('/company-dashboard') || pathname?.includes('/company-management-dashboard')) {
        detectedContext = 'company';
      } else if (pathname?.includes('/team-dashboard') || teamIdFromUrl) {
        detectedContext = 'team';
      }
      
      // FIXED: Set visibility based on detected context (skip if hive context)
      if (detectedContext === 'hive') {
        // Hive context - auto-set to team visibility with hive ID
        // Already handled above
      } else if (detectedContext === 'team' && teamIdFromUrl) {
        // Team context - auto-set to team visibility
        setVisibility('team');
        setTeam(teamIdFromUrl);
        console.log('🎯 Auto-setting visibility to TEAM from context');
      } else if (detectedContext === 'company' && (locationCompanyId || userProfile?.company_id)) {
        // Company context - auto-set to company visibility
        const targetCompanyId = locationCompanyId || userProfile?.company_id;
        setCompanyContext({
          companyId: targetCompanyId,
          defaultVisibility: 'company'
        });
        setVisibility('company');
        console.log('🎯 Auto-setting visibility to COMPANY from context');
        
        // Load teams for this company
        try {
          setLoadingTeams(true);
          const { companyDashboardService } = await import('../../services/companyDashboardService');
          const teamsData = await companyDashboardService?.getCompanyTeams(targetCompanyId);
          setTeams(teamsData || []);
        } catch (err) {
          console.error('Error loading teams:', err);
        } finally {
          setLoadingTeams(false);
        }
      } else if (detectedContext === 'global') {
        // Global dashboard - keep as private (user's personal snippet)
        setVisibility('private');
        console.log('🎯 Auto-setting visibility to PRIVATE from global context');
      }
    };

    initializeContext();
  }, [location?.state, location?.pathname, teamIdFromUrl, hiveIdFromUrl, userProfile]);

  // CRITICAL FIX: Load snippet data when in edit mode
  useEffect(() => {
    const loadSnippetForEdit = async () => {
      if (!isEditMode || !editId) return;
      
      try {
        setLoading(true);
        const snippetData = await snippetService?.getSnippetById(editId);
        
        // Check if user owns this snippet
        if (snippetData?.user?.id !== user?.id) {
          throw new Error('You do not have permission to edit this snippet');
        }
        
        // Populate form with existing data
        setTitle(snippetData?.title || '');
        setDescription(snippetData?.description || '');
        // REMOVED: setLanguage(snippetData?.language || 'javascript');
        setCode(snippetData?.code || '');
        setVisibility(snippetData?.visibility || 'private');
        setTeam(snippetData?.teamId || '');
        
        // Set AI tags if available
        if (snippetData?.aiTags && Array.isArray(snippetData?.aiTags)) {
          setTags(snippetData?.aiTags?.join(', '));
        }
        
        // Set AI results if available
        if (snippetData?.aiQualityScore || snippetData?.aiAnalysisData) {
          setAiResults({
            tags: snippetData?.aiTags || [],
            qualityScore: snippetData?.aiQualityScore || 0,
            aiAnalysisData: snippetData?.aiAnalysisData || null,
            detectedLanguage: snippetData?.language || null // Use stored language from AI detection
          });
        }
        
      } catch (err) {
        console.error('Error loading snippet for edit:', err);
        setErrors({ 
          submit: err?.message || 'Failed to load snippet. Redirecting...' 
        });
        setTimeout(() => navigate('/user-dashboard'), 2000);
      } finally {
        setLoading(false);
      }
    };

    loadSnippetForEdit();
  }, [isEditMode, editId, user, navigate]);

  // CRITICAL FIX: Auto-select team when coming from team dashboard
  useEffect(() => {
    if (teamIdFromUrl) {
      console.log('🎯 Auto-selecting team from URL:', teamIdFromUrl);
      setVisibility('team');
      setTeam(teamIdFromUrl);
    }
  }, [teamIdFromUrl]);

  // Form state - consolidated for clarity
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [code, setCode] = useState('');
  const [files, setFiles] = useState([]);
  const [visibility, setVisibility] = useState(teamIdFromUrl ? 'team' : 'private');
  const [team, setTeam] = useState(teamIdFromUrl || '');
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiResults, setAiResults] = useState(null);
  
  // UPDATED: Add state for company/team context
  const [companyContext, setCompanyContext] = useState(null);
  const [teams, setTeams] = useState([]);
  const [loadingTeams, setLoadingTeams] = useState(false);

  // UI state
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // NEW: Language mapping function to convert AI-detected language to valid database enum
  const mapLanguageToEnum = (detectedLang) => {
    if (!detectedLang) return 'other';
    
    const lang = detectedLang?.toLowerCase();
    
    // Direct matches (already in enum or newly added)
    const validEnums = [
      'javascript', 'typescript', 'python', 'java', 'cpp', 'csharp', 
      'ruby', 'go', 'rust', 'php', 'sql', 'html', 'css', 'jsx', 'tsx',
      'markdown', 'json', 'yaml', 'xml', 'bash', 'shell', 'swift', 
      'kotlin', 'dart', 'vue', 'svelte'
    ];
    
    if (validEnums?.includes(lang)) {
      return lang;
    }
    
    // Common language aliases and mappings
    const languageMap = {
      'js': 'javascript',
      'ts': 'typescript',
      'py': 'python',
      'c++': 'cpp',
      'c#': 'csharp',
      'rb': 'ruby',
      'rs': 'rust',
      'sh': 'shell',
      'htm': 'html',
      'md': 'markdown',
      'yml': 'yaml',
      'kt': 'kotlin',
      'pl': 'other',
      'perl': 'other',
      'r': 'other',
      'scala': 'other',
      'haskell': 'other',
      'elixir': 'other',
      'clojure': 'other',
      'lua': 'other',
      'matlab': 'other',
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

  // Ensure page renders even if loading
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50">
        <AppNavigation />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state when fetching snippet for edit
  if (loading || !user) {
    return (
      <div className="min-h-screen bg-slate-50">
        <AppNavigation />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-slate-600">
              {loading ? 'Loading snippet...' : 'Loading...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // FIXED: Use browser history for back navigation
  const handleBackNavigation = () => {
    // Check if there's a previous page in browser history
    if (window?.history?.length > 1) {
      navigate(-1); // Go back to previous page
    } else {
      // Fallback to dashboard if no history
      navigate('/user-dashboard');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!title?.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!code?.trim()) {
      newErrors.code = 'Code content is required';
    }
    
    if (visibility === 'team' && !team) {
      newErrors.team = 'Please select a team';
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
      setErrors({});

      // CRITICAL: Request FULL AI analysis report, not just synopsis
      const result = await aiTaggingService?.analyzeSnippetWithAI({
        code: code?.trim(),
        title: title || 'Code Analysis',
        generateFullReport: true // NEW: Flag to generate comprehensive report
      });

      // CRITICAL FIX: Store COMPLETE analysis data structure for full report
      setAiResults({
        tags: result?.tags || [],
        qualityScore: result?.optimizationScore || 0,
        detectedLanguage: result?.detectedLanguage || 'unknown',
        languageConfidence: result?.languageConfidence || 'low',
        // FULL ANALYSIS DATA - COMPLETE STRUCTURE for optimization report
        aiAnalysisData: result?.analysis || null // Store the ENTIRE analysis object as-is
      });

      // Show language detection result
      if (result?.detectedLanguage) {
        console.log('✅ AI detected language:', result?.detectedLanguage, '(confidence:', result?.languageConfidence, ')');
      }

    } catch (err) {
      console.error('Error analyzing code:', err);
      setErrors({ 
        submit: err?.message || 'Failed to analyze code. Please check your OpenAI API key configuration.' 
      });
      
      // Set fallback results
      setAiResults({
        tags: ['code-snippet'],
        qualityScore: 50,
        detectedLanguage: 'unknown',
        languageConfidence: 'low',
        aiAnalysisData: {
          summary: 'AI analysis encountered an error',
          strengths: ['Code submitted for review'],
          weaknesses: ['AI analysis encountered an error'],
          improvements: ['Please check OpenAI API key configuration', 'Ensure VITE_OPENAI_API_KEY is set in .env file'],
          complexity: 'medium',
          categories: [],
          recommendations: {},
          metrics: {}
        }
      });
    } finally {
      setAiAnalyzing(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!validateForm()) return;
    
    setSaving(true);
    setErrors({});
    
    try {
      // CRITICAL FIX: Extract COMPLETE AI analysis data for full report
      let aiTags = null;
      let aiQualityScore = null;
      let aiAnalysisData = null;
      let detectedLanguage = 'other'; // Default if no AI analysis (changed from 'plaintext' to 'other')

      if (aiResults && typeof aiResults === 'object') {
        // FIXED: Map AI-detected language to valid enum value
        if (aiResults?.detectedLanguage) {
          detectedLanguage = mapLanguageToEnum(aiResults?.detectedLanguage);
          console.log(`🔧 Language mapping: ${aiResults?.detectedLanguage} → ${detectedLanguage}`);
        }
        
        if (Array.isArray(aiResults?.tags) && aiResults?.tags?.length > 0) {
          aiTags = aiResults?.tags;
        }
        
        if (typeof aiResults?.qualityScore === 'number') {
          aiQualityScore = aiResults?.qualityScore;
        }
        
        // CRITICAL: Store COMPLETE analysis structure, not simplified version
        if (aiResults?.aiAnalysisData && typeof aiResults?.aiAnalysisData === 'object') {
          aiAnalysisData = aiResults?.aiAnalysisData; // Store complete analysis as-is
        }
      }
      
      if (!aiTags && tags?.trim()) {
        aiTags = tags?.split(',')?.map(t => t?.trim())?.filter(Boolean);
      }

      // CRITICAL FIX: Use update instead of insert when in edit mode
      if (isEditMode) {
        const updateData = {
          title: title?.trim(),
          description: description?.trim() || null,
          code: code?.trim(),
          language: detectedLanguage, // Use AI-detected language
          visibility: 'private'
        };

        if (aiTags && Array.isArray(aiTags) && aiTags?.length > 0) {
          updateData.aiTags = aiTags;
        }
        
        if (typeof aiQualityScore === 'number') {
          updateData.aiQualityScore = aiQualityScore;
        }
        
        // CRITICAL: Save COMPLETE analysis for full optimization report
        if (aiAnalysisData && typeof aiAnalysisData === 'object') {
          updateData.aiAnalysisData = aiAnalysisData;
        }

        await snippetService?.updateSnippet(editId, updateData);
        
        setSaving(false);
        navigate(`/snippet-details?id=${editId}`);
      } else {
        // Keep existing create logic for new snippets
        const snippetData = {
          title: title?.trim(),
          description: description?.trim() || null,
          code: code?.trim(),
          language: detectedLanguage, // Use AI-detected language
          visibility: 'private',
          snippet_type: 'code',
          user_id: user?.id
        };

        if (aiTags && Array.isArray(aiTags) && aiTags?.length > 0) {
          snippetData.ai_tags = aiTags;
        }
        
        if (typeof aiQualityScore === 'number') {
          snippetData.ai_quality_score = aiQualityScore;
        }
        
        // CRITICAL: Save COMPLETE analysis for full optimization report
        if (aiAnalysisData && typeof aiAnalysisData === 'object') {
          snippetData.ai_analysis_data = aiAnalysisData;
        }

        const { data, error: createError } = await supabase
          ?.from('snippets')
          ?.insert([snippetData])
          ?.select()
          ?.single();

        if (createError) {
          console.error('Supabase error creating snippet:', createError);
          throw new Error(createError?.message || 'Failed to save draft');
        }

        if (!data?.id) {
          throw new Error('Failed to create snippet - no ID returned');
        }

        setSaving(false);
        
        if (returnTo === 'team-dashboard' && teamIdFromUrl) {
          navigate(`/team-dashboard?team=${teamIdFromUrl}`);
        } else {
          navigate(`/snippet-details?id=${data?.id}`);
        }
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      setErrors({ 
        submit: error?.message || 'Failed to save draft. Please check your connection and try again.' 
      });
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!validateForm()) return;
    
    setSaving(true);
    setErrors({});
    
    try {
      // NEW: For hive context, ensure team is set to hive ID
      const targetTeamId = hiveIdFromUrl || team;
      
      if (visibility === 'team' && !targetTeamId) {
        throw new Error('Please select a team before publishing');
      }

      // CRITICAL FIX: Extract COMPLETE AI analysis data for full report
      let aiTags = null;
      let aiQualityScore = null;
      let aiAnalysisData = null;
      let detectedLanguage = 'other'; // Default if no AI analysis (changed from 'plaintext' to 'other')

      if (aiResults && typeof aiResults === 'object') {
        // FIXED: Map AI-detected language to valid enum value
        if (aiResults?.detectedLanguage) {
          detectedLanguage = mapLanguageToEnum(aiResults?.detectedLanguage);
          console.log(`🔧 Language mapping: ${aiResults?.detectedLanguage} → ${detectedLanguage}`);
        }
        
        if (Array.isArray(aiResults?.tags) && aiResults?.tags?.length > 0) {
          aiTags = aiResults?.tags;
        }
        
        if (typeof aiResults?.qualityScore === 'number') {
          aiQualityScore = aiResults?.qualityScore;
        }
        
        // CRITICAL: Store COMPLETE analysis structure, not simplified version
        if (aiResults?.aiAnalysisData && typeof aiResults?.aiAnalysisData === 'object') {
          aiAnalysisData = aiResults?.aiAnalysisData; // Store complete analysis as-is
        }
      }
      
      if (!aiTags && tags?.trim()) {
        aiTags = tags?.split(',')?.map(t => t?.trim())?.filter(Boolean);
      }

      // CRITICAL FIX: Use update instead of insert when in edit mode
      if (isEditMode) {
        const updateData = {
          title: title?.trim(),
          description: description?.trim() || null,
          code: code?.trim(),
          language: detectedLanguage, // Use AI-detected language
          visibility: visibility
        };

        if (aiTags && Array.isArray(aiTags) && aiTags?.length > 0) {
          updateData.aiTags = aiTags;
        }
        
        if (typeof aiQualityScore === 'number') {
          updateData.aiQualityScore = aiQualityScore;
        }
        
        // CRITICAL: Save COMPLETE analysis for full optimization report
        if (aiAnalysisData && typeof aiAnalysisData === 'object') {
          updateData.aiAnalysisData = aiAnalysisData;
        }

        await snippetService?.updateSnippet(editId, updateData);
        
        console.log('✅ Snippet updated with complete AI analysis for full optimization report');
        
        setSaving(false);
        navigate(`/snippet-details?id=${editId}`);
      } else {
        // Keep existing create logic for new snippets
        const snippetData = {
          title: title?.trim(),
          description: description?.trim() || null,
          code: code?.trim(),
          language: detectedLanguage, // Use AI-detected language
          visibility: visibility,
          snippet_type: 'code',
          user_id: user?.id
        };

        // NEW: Handle hive context - use hive ID as team_id
        if (hiveIdFromUrl) {
          snippetData.team_id = hiveIdFromUrl;
          console.log('✅ Creating hive snippet with complete AI analysis:', {
            hiveId: hiveIdFromUrl,
            visibility: visibility,
            title: title,
            language: detectedLanguage
          });
        } else if (visibility === 'team' && targetTeamId) {
          snippetData.team_id = targetTeamId;
          console.log('✅ Creating team snippet with complete AI analysis:', {
            teamId: targetTeamId,
            visibility: visibility,
            title: title,
            language: detectedLanguage
          });
        } else {
          snippetData.team_id = null;
          console.log('✅ Creating snippet with complete AI analysis:', {
            visibility: visibility,
            title: title,
            language: detectedLanguage
          });
        }

        if (aiTags && Array.isArray(aiTags) && aiTags?.length > 0) {
          snippetData.ai_tags = aiTags;
        }
        
        if (typeof aiQualityScore === 'number') {
          snippetData.ai_quality_score = aiQualityScore;
        }
        
        // CRITICAL: Save COMPLETE analysis for full optimization report
        if (aiAnalysisData && typeof aiAnalysisData === 'object') {
          snippetData.ai_analysis_data = aiAnalysisData;
          console.log('✅ Saving complete AI analysis data for full optimization report');
        }

        const { data, error: createError } = await supabase
          ?.from('snippets')
          ?.insert([snippetData])
          ?.select()
          ?.single();

        if (createError) {
          console.error('❌ Supabase error creating snippet:', createError);
          throw new Error(createError?.message || 'Failed to publish snippet');
        }

        if (!data?.id) {
          throw new Error('Failed to create snippet - no ID returned');
        }

        console.log('✅ Snippet created with complete AI optimization report data:', {
          id: data?.id,
          visibility: data?.visibility,
          team_id: data?.team_id,
          language: data?.language,
          hasFullAnalysis: !!data?.ai_analysis_data
        });

        setSaving(false);
        
        // NEW: Navigate back to hive if created from hive context
        if (hiveIdFromUrl) {
          navigate(`/hive-explorer?hive=${hiveIdFromUrl}`);
        } else if (returnTo === 'team-dashboard' && teamIdFromUrl) {
          navigate(`/team-dashboard?team=${teamIdFromUrl}`);
        } else if (visibility === 'team' && targetTeamId) {
          navigate(`/team-dashboard?team=${targetTeamId}`);
        } else {
          navigate(`/snippet-details?id=${data?.id}`);
        }
      }
    } catch (error) {
      console.error('❌ Error publishing snippet:', error);
      setErrors({ 
        submit: error?.message || 'Failed to publish snippet. Please check your connection and try again.' 
      });
      setSaving(false);
    }
  };

  const handlePreview = () => {
    setShowPreview(!showPreview);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    // ... keep existing validation ...

    try {
      setIsSubmitting(true);
      setErrors({});

      // UPDATED: Include company and team context in submission
      const snippetData = {
        title: formData?.title,
        description: formData?.description,
        code: formData?.code,
        language: formData?.language,
        snippetType: formData?.snippetType,
        visibility: formData?.visibility
      };

      // CRITICAL: Add company/team routing if available
      if (companyContext?.companyId) {
        snippetData.companyId = companyContext?.companyId;
      }
      
      if (formData?.teamId) {
        snippetData.teamId = formData?.teamId;
      }

      // Use supabase to create snippet since snippetService is not imported
      const { data: newSnippet, error: createError } = await supabase
        ?.from('snippets')
        ?.insert([snippetData])
        ?.select()
        ?.single();

      if (createError) throw createError;
      
      setSuccess(true);
      setTimeout(() => {
        navigate(`/snippet-details?id=${newSnippet?.id}`);
      }, 1500);
    } catch (err) {
      console.error('Error creating snippet:', err);
      setErrors({ submit: err?.message || 'Failed to create snippet. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <AppNavigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* FIXED: Only show company context indicator when explicitly set from company dashboard */}
          {companyContext && !teamIdFromUrl && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Icon name="Building" className="text-blue-600 mt-0.5" size={20} />
                <div className="flex-1">
                  <p className="text-blue-900 font-semibold">Creating for Company</p>
                  <p className="text-blue-700 text-sm">
                    This snippet will be automatically associated with your company and visible to company members.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Header - Fixed width container */}
          <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
            <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    iconName="ArrowLeft"
                    onClick={handleBackNavigation}
                  >
                    Back
                  </Button>
                  <div>
                    <h1 className="text-xl font-semibold text-slate-800">
                      {isEditMode ? 'Edit Snippet' : 'Create New Snippet'}
                    </h1>
                    <p className="text-sm text-slate-600">
                      {isEditMode ? 'Update your code snippet' : 'Share your code with the community'}
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
                    {isEditMode ? 'Update' : 'Publish'}
                  </Button>
                </div>
              </div>
              
              {/* Error Message Display */}
              {errors?.submit && (
                <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Icon name="AlertCircle" size={20} className="flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Error saving snippet</p>
                      <p className="text-sm">{errors?.submit}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </header>

          <form onSubmit={handleSubmit} className="space-y-6">
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

                <CodeEditor
                  code={code}
                  setCode={setCode}
                  errors={errors}
                />

                <FileUploadSection
                  files={files}
                  setFiles={setFiles}
                />

                <VisibilityControl
                  visibility={visibility}
                  setVisibility={setVisibility}
                  team={team}
                  setTeam={setTeam}
                />
              </div>

              {/* Right Column - AI Suggestions */}
              <div className="lg:col-span-1">
                <div className="sticky top-24 space-y-6">
                  {/* AI Analysis Button */}
                  <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-lg font-semibold text-slate-900">AI Insights</h2>
                        <p className="text-sm text-slate-600">Get AI-powered code analysis with language detection</p>
                      </div>
                    </div>
                    
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

                    {/* ENHANCED: AI Results Display with Full Analytics */}
                    {aiResults && (
                      <div className="space-y-4 mt-6">
                        {/* Detected Language Display */}
                        {aiResults?.detectedLanguage && (
                          <div className="bg-blue-50 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-blue-900">Detected Language</span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-blue-700 uppercase">
                                  {aiResults?.detectedLanguage}
                                </span>
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  aiResults?.languageConfidence === 'high' ? 'bg-green-100 text-green-700' :
                                  aiResults?.languageConfidence === 'medium'? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                                }`}>
                                  {aiResults?.languageConfidence} confidence
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Quality Score */}
                        <div className="bg-slate-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-slate-700">Code Quality</span>
                            <span className="text-2xl font-bold text-purple-600">
                              {aiResults?.qualityScore}/100
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div
                              className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${aiResults?.qualityScore}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* AI Tags */}
                        {aiResults?.tags && aiResults?.tags?.length > 0 && (
                          <div>
                            <h3 className="text-sm font-medium text-slate-700 mb-2">Suggested Tags</h3>
                            <div className="flex flex-wrap gap-2">
                              {aiResults?.tags?.map((tag, index) => (
                                <span
                                  key={index}
                                  className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* NEW: Analytics Dashboard */}
                        {aiResults?.aiAnalysisData?.categories && aiResults?.aiAnalysisData?.categories?.length > 0 && (
                          <div className="bg-slate-50 rounded-lg p-4">
                            <h3 className="text-sm font-medium text-slate-700 mb-3">AI Insights Board</h3>
                            <div className="space-y-3">
                              {aiResults?.aiAnalysisData?.categories?.map((category, index) => (
                                <div key={index} className="bg-white rounded-lg p-3 border border-slate-200">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-slate-900 capitalize">{category?.name || category?.id}</span>
                                    <span className={`text-xs px-2 py-1 rounded-full ${
                                      category?.score >= 80 ? 'bg-green-100 text-green-700' :
                                      category?.score >= 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                      {category?.score || 0}%
                                    </span>
                                  </div>
                                  {category?.issues && category?.issues?.length > 0 && (
                                    <ul className="space-y-1">
                                      {category?.issues?.slice(0, 3)?.map((issue, idx) => (
                                        <li key={idx} className="text-xs text-slate-600 flex items-start gap-1">
                                          <span className={
                                            issue?.severity === 'high' ? 'text-red-500' :
                                            issue?.severity === 'medium' ? 'text-yellow-500' : 'text-blue-500'
                                          }>•</span>
                                          <span>{issue?.title}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              ))}
                            </div>
                            <div className="mt-3 text-xs text-slate-500 text-center">
                              ✓ Full optimization report will be available after publishing
                            </div>
                          </div>
                        )}

                        {/* Strengths & Weaknesses - Only show if available in simplified format */}
                        {aiResults?.aiAnalysisData?.strengths && aiResults?.aiAnalysisData?.strengths?.length > 0 && (
                          <div className="bg-green-50 rounded-lg p-4">
                            <h3 className="text-sm font-medium text-green-900 mb-2 flex items-center">
                              <span className="mr-2">✓</span> Strengths
                            </h3>
                            <ul className="space-y-1 text-sm text-green-800">
                              {aiResults?.aiAnalysisData?.strengths?.map((strength, index) => (
                                <li key={index}>• {strength}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {aiResults?.aiAnalysisData?.weaknesses && aiResults?.aiAnalysisData?.weaknesses?.length > 0 && (
                          <div className="bg-yellow-50 rounded-lg p-4">
                            <h3 className="text-sm font-medium text-yellow-900 mb-2 flex items-center">
                              <span className="mr-2">⚠</span> Areas for Improvement
                            </h3>
                            <ul className="space-y-1 text-sm text-yellow-800">
                              {aiResults?.aiAnalysisData?.weaknesses?.map((weakness, index) => (
                                <li key={index}>• {weakness}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Improvement Suggestions */}
                        {aiResults?.aiAnalysisData?.improvements && aiResults?.aiAnalysisData?.improvements?.length > 0 && (
                          <div className="bg-blue-50 rounded-lg p-4">
                            <h3 className="text-sm font-medium text-blue-900 mb-2 flex items-center">
                              <span className="mr-2">💡</span> Suggestions
                            </h3>
                            <ul className="space-y-1 text-sm text-blue-800">
                              {aiResults?.aiAnalysisData?.improvements?.map((improvement, index) => (
                                <li key={index}>• {improvement}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Complexity Badge */}
                        {aiResults?.aiAnalysisData?.complexity && (
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-slate-600">Complexity:</span>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              aiResults?.aiAnalysisData?.complexity === 'low' ? 'bg-green-100 text-green-700' :
                              aiResults?.aiAnalysisData?.complexity === 'medium'? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {aiResults?.aiAnalysisData?.complexity?.toUpperCase()}
                            </span>
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

            {/* UPDATED: Add Team Selection (only shown if teams available) */}
            {teams?.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assign to Team (Optional)
                </label>
                <div className="flex items-center gap-3">
                  <Icon name="Users" className="text-gray-500" />
                  <select
                    value={formData?.teamId || ''}
                    onChange={(e) => setFormData({ ...formData, teamId: e?.target?.value })}
                    disabled={isSubmitting || success || loadingTeams}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">No specific team (Company-wide)</option>
                    {teams?.map(team => (
                      <option key={team?.id} value={team?.id}>
                        {team?.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-xl font-semibold text-slate-800">Preview</h2>
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
                  <h1 className="text-2xl font-bold text-slate-800 mb-2">{title || 'Untitled Snippet'}</h1>
                  <p className="text-slate-600">{description || 'No description provided'}</p>
                </div>

                {/* UPDATED: Show AI-detected language if available */}
                {aiResults?.detectedLanguage && (
                  <div className="flex items-center gap-2">
                    <Icon name="Code2" size={16} className="text-slate-600" />
                    <span className="text-sm text-slate-600 font-medium uppercase">
                      {aiResults?.detectedLanguage}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      aiResults?.languageConfidence === 'high' ? 'bg-green-100 text-green-700' :
                      aiResults?.languageConfidence === 'medium'? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      AI detected
                    </span>
                  </div>
                )}

                {tags && (
                  <div className="flex flex-wrap gap-2">
                    {tags?.split(',')?.map((tag, index) => (
                      <span key={index} className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                        {tag?.trim()}
                      </span>
                    ))}
                  </div>
                )}

                <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-sm text-slate-100 font-mono">
                    <code>{code || '// No code yet'}</code>
                  </pre>
                </div>

                {files?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-700 mb-2">Attachments</h3>
                    <div className="space-y-2">
                      {files?.map((file) => (
                        <div key={file?.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded">
                          <Icon name="File" size={16} className="text-slate-600" />
                          <span className="text-sm text-slate-700">{file?.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Mobile Bottom Actions */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 flex gap-3">
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
    </div>
  );
};

export default CreateSnippet;