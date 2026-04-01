import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';


import CodeViewer from './components/CodeViewer';
import EngagementBar from './components/EngagementBar';
import CommentSection from './components/CommentSection';
import VersionHistory from './components/VersionHistory';
import RelatedSnippets from './components/RelatedSnippets';
import AuthorCard from './components/AuthorCard';
import RecentEngagement from './components/RecentEngagement';
import AITagsDisplay from './components/AITagsDisplay';
import AISnippetSharing from './components/AISnippetSharing';
import AppNavigation from "../../components/AppNavigation";
import { supabase } from '../../lib/supabase';

import Button from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { snippetService } from '../../services/snippetService';
import aiTaggingService from '../../services/aiTaggingService';
import AIReportButton from '../../components/AIReportButton';
import Icon from '../../components/AppIcon';
import { useLocation } from 'react-router-dom';
import Link from '../../components/Link';
import Image from '../../components/Image';

const SnippetDetails = () => {
  const [searchParams] = useSearchParams();
  const id = searchParams?.get('id');
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [snippet, setSnippet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [comments, setComments] = useState([]);
  const [recentLikes, setRecentLikes] = useState([]);
  const [relatedSnippets, setRelatedSnippets] = useState([]);
  
  // NEW: Add state for recent saves
  const [recentSaves, setRecentSaves] = useState([]);
  const [reanalyzing, setReanalyzing] = useState(false);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [userCollections, setUserCollections] = useState([]);
  const [selectedCollections, setSelectedCollections] = useState([]);
  const [loadingCollections, setLoadingCollections] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [errors, setErrors] = useState({});
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [retryDelay, setRetryDelay] = useState(0);

  // Load snippet details
  useEffect(() => {
    const loadSnippet = async () => {
      if (!id) {
        setError('No snippet ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        // Fetch snippet with author details AND company details
        const { data, error: snippetError } = await supabase?.from('snippets')?.select(`
            *,
            user_profiles!snippets_user_id_fkey (
              id,
              full_name,
              username,
              avatar_url,
              contributor_level,
              email_verified
            ),
            companies!snippets_company_id_fkey (
              id,
              name,
              slug
            )
          `)?.eq('id', id)?.single();

        if (snippetError) throw snippetError;

        if (!data) {
          setError('Snippet not found');
          setLoading(false);
          return;
        }

        // Check visibility and permissions
        if (data?.visibility === 'private' && data?.user_id !== user?.id) {
          setError('You do not have permission to view this snippet');
          setLoading(false);
          return;
        }

        // Transform data to component format
        const transformedSnippet = {
          id: data?.id,
          title: data?.title,
          description: data?.description || '',
          language: data?.language,
          code: data?.code,
          tags: data?.ai_tags || [],
          author: {
            id: data?.user_profiles?.id,
            name: data?.user_profiles?.full_name || 'Anonymous',
            username: data?.user_profiles?.username || '',
            avatar: data?.user_profiles?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(data?.user_profiles?.full_name || 'User')}&background=random`,
            avatarAlt: `Profile picture of ${data?.user_profiles?.full_name || 'User'}`,
            level: data?.user_profiles?.contributor_level || 'beginner',
            isVerified: data?.user_profiles?.email_verified || false
          },
          stats: {
            views: data?.views_count || 0,
            likes: data?.likes_count || 0,
            comments: data?.comments_count || 0,
            saves: 0
          },
          visibility: data?.visibility,
          createdAt: new Date(data?.created_at),
          updatedAt: new Date(data?.updated_at),
          version: data?.version || 1,
          // CRITICAL: Pass both analysis data AND full report from database
          aiAnalysis: data?.ai_analysis_data || null,
          aiQualityScore: data?.ai_quality_score || null,
          // NEW: Include full AI report for AIReportButton
          aiReport: data?.ai_report || null,
          // Add company information
          company: data?.companies ? {
            id: data?.companies?.id,
            name: data?.companies?.name,
            slug: data?.companies?.slug
          } : null,
          // Add ownership flag
          isOwner: user?.id === data?.user_id
        };

        setSnippet(transformedSnippet);

        // Increment view count if not author
        if (user?.id && user?.id !== data?.user_id) {
          await supabase?.from('snippets')?.update({ views_count: (data?.views_count || 0) + 1 })?.eq('id', id);
        }

      } catch (err) {
        console.error('Error loading snippet:', err);
        setError(err?.message || 'Failed to load snippet');
      } finally {
        setLoading(false);
      }
    };

    loadSnippet();
  }, [id, user]);

  // Update the navigation query param when snippet has company
  useEffect(() => {
    if (snippet?.company?.id && !location?.search?.includes('company')) {
      // Add company parameter to URL for navigation detection
      navigate(`${location?.pathname}?id=${id}&company=${snippet?.company?.id}`, { replace: true });
    }
  }, [snippet, location, id, navigate]);

  // CRITICAL FIX: Load actual engagement data instead of using empty arrays
  useEffect(() => {
    const loadEngagementData = async () => {
      if (!id) return;

      try {
        // Load recent likes with user data
        const { data: likesData, error: likesError } = await supabase
          ?.from('snippet_likes')
          ?.select(`
            created_at,
            user_id,
            user:user_profiles!snippet_likes_user_id_fkey(
              id,
              username,
              avatar_url,
              full_name
            )
          `)
          ?.eq('snippet_id', id)
          ?.order('created_at', { ascending: false })
          ?.limit(10);

        if (likesError) {
          console.error('Error loading likes:', likesError);
        } else {
          const transformedLikes = (likesData || [])?.map(like => ({
            id: like?.user_id,
            name: like?.user?.full_name || 'Anonymous User',
            username: like?.user?.username || 'user',
            avatar: like?.user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(like?.user?.full_name || 'User')}&background=random`,
            avatarAlt: `Profile picture of ${like?.user?.full_name || 'User'}`,
            timestamp: like?.created_at
          }));
          setRecentLikes(transformedLikes);
          console.log(`✅ Loaded ${transformedLikes?.length} recent likes`);
        }

        // Load recent saves (from collection additions)
        const { data: savesData, error: savesError } = await supabase
          ?.from('hive_collection_snippets')
          ?.select(`
            added_at,
            added_by,
            user:user_profiles!hive_collection_snippets_added_by_fkey(
              id,
              username,
              avatar_url,
              full_name
            )
          `)
          ?.eq('snippet_id', id)
          ?.order('added_at', { ascending: false })
          ?.limit(10);

        if (savesError) {
          console.error('Error loading saves:', savesError);
        } else {
          const transformedSaves = (savesData || [])?.map(save => ({
            id: save?.added_by,
            name: save?.user?.full_name || 'Anonymous User',
            username: save?.user?.username || 'user',
            avatar: save?.user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(save?.user?.full_name || 'User')}&background=random`,
            avatarAlt: `Profile picture of ${save?.user?.full_name || 'User'}`,
            timestamp: save?.added_at
          }));
          setRecentSaves(transformedSaves);
          console.log(`✅ Loaded ${transformedSaves?.length} recent saves`);
        }

        // Load related snippets based on tags and language
        if (snippet?.tags?.length > 0 || snippet?.language) {
          const { data: relatedData, error: relatedError } = await supabase
            ?.from('snippets')
            ?.select(`
              id,
              title,
              description,
              language,
              ai_tags,
              views_count,
              likes_count,
              user_profiles!snippets_user_id_fkey(
                username,
                avatar_url,
                full_name
              )
            `)
            ?.neq('id', id)
            ?.eq('visibility', 'public')
            ?.or(`language.eq.${snippet?.language},ai_tags.cs.{${snippet?.tags?.slice(0, 3)?.join(',')}}`)
            ?.order('likes_count', { ascending: false })
            ?.limit(5);

          if (relatedError) {
            console.error('Error loading related snippets:', relatedError);
          } else {
            const transformedRelated = (relatedData || [])?.map(item => ({
              id: item?.id,
              title: item?.title,
              description: item?.description,
              language: item?.language,
              tags: item?.ai_tags || [],
              views: item?.views_count || 0,
              likes: item?.likes_count || 0,
              author: {
                name: item?.user_profiles?.full_name || 'Anonymous',
                username: item?.user_profiles?.username || 'user',
                avatar: item?.user_profiles?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(item?.user_profiles?.full_name || 'User')}&background=random`
              }
            }));
            setRelatedSnippets(transformedRelated);
            console.log(`✅ Loaded ${transformedRelated?.length} related snippets`);
          }
        }
      } catch (err) {
        console.error('❌ Error loading engagement data:', err);
      }
    };

    if (snippet) {
      loadEngagementData();
    }
  }, [id, snippet]);

  // Load comments when snippet is loaded
  useEffect(() => {
    const loadComments = async () => {
      if (!id) return;

      try {
        const commentsData = await snippetService?.getComments(id);
        
        // Transform flat comments to nested structure
        const rootComments = commentsData?.filter(c => !c?.parentId);
        const commentsWithReplies = rootComments?.map(comment => ({
          ...comment,
          replies: commentsData?.filter(c => c?.parentId === comment?.id)
        }));

        setComments(commentsWithReplies);
      } catch (err) {
        console.error('Error loading comments:', err);
      }
    };

    loadComments();
  }, [id]);

  // NEW: Add timeout wrapper for AI analysis
  const runAIAnalysisWithTimeout = async (snippetData, timeoutMs = 30000) => {
    return Promise.race([
      aiTaggingService?.analyzeSnippet(snippetData),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('AI analysis timeout - operation took too long')), timeoutMs)
      )
    ]);
  };

  // CRITICAL FIX: Enhanced AI reanalysis with retry feedback and better error handling
  const handleReanalyze = async () => {
    if (!snippet?.code || !snippet?.language || reanalyzing) return;

    try {
      setReanalyzing(true);
      setErrors({}); // Clear any previous errors
      setRetryAttempt(0);
      setRetryDelay(0);
      console.log('🔄 Starting AI reanalysis for snippet:', snippet?.id);

      // Pass retry callback for user feedback
      const analysis = await aiTaggingService?.analyzeSnippetWithAI(
        {
          code: snippet?.code,
          language: snippet?.language,
          title: snippet?.title,
          description: snippet?.description
        },
        // Retry callback for user feedback
        (attempt, maxRetries, delay, error) => {
          console.log(`🔄 Retry attempt ${attempt}/${maxRetries} in ${delay}ms`);
          setRetryAttempt(attempt);
          setRetryDelay(delay);
          
          // Show retry status message
          setErrors({
            info: `⏳ Network issue detected. Retrying analysis (attempt ${attempt}/${maxRetries})... Please wait ${(delay / 1000)?.toFixed(1)}s`
          });
        }
      );

      console.log('✅ AI reanalysis completed, updating snippet...');

      await aiTaggingService?.updateSnippetAnalysis(id, analysis);

      // Update local state with new analysis
      setSnippet(prev => ({
        ...prev,
        tags: analysis?.tags,
        aiQualityScore: analysis?.qualityScore,
        aiAnalysis: {
          summary: analysis?.summary,
          bugRisk: analysis?.bugRisk,
          complexityLevel: analysis?.complexityLevel,
          readabilityScore: analysis?.readabilityScore,
          strengths: analysis?.strengths,
          weaknesses: analysis?.weaknesses,
          improvements: analysis?.improvements,
          recommendations: analysis?.recommendations,
          categories: analysis?.categories,
          purposeTags: analysis?.purposeTags,
          functionalityTags: analysis?.functionalityTags,
          searchAliases: analysis?.searchAliases,
        }
      }));

      console.log('✅ Snippet state updated with new AI analysis');
      
      // CRITICAL FIX: Show success message
      setErrors({
        success: '✨ AI analysis completed successfully! The snippet has been updated with new insights.'
      });
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setErrors(prev => {
          const { success, ...rest } = prev;
          return rest;
        });
      }, 5000);
    } catch (err) {
      console.error('❌ Error reanalyzing snippet:', err);
      
      // CRITICAL FIX: Specific error messages for different failure types
      let errorMessage = 'Failed to reanalyze snippet. ';
      
      if (err?.message?.includes('timeout')) {
        errorMessage += 'The analysis is taking longer than expected. Please try again with a smaller code snippet or check your OpenAI API configuration.';
      } else if (err?.message?.includes('API key')) {
        errorMessage += 'OpenAI API key issue. Please check your VITE_OPENAI_API_KEY environment variable.';
      } else if (err?.message?.includes('quota') || err?.message?.includes('rate limit')) {
        errorMessage += 'OpenAI API quota exceeded. Please try again later.';
      } else {
        errorMessage += err?.message || 'Unknown error occurred. Please check the console for details.';
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
      // CRITICAL FIX: Always clear reanalyzing and retry state
      setReanalyzing(false);
      setRetryAttempt(0);
      setRetryDelay(0);
    }
  };

  // Handle like update
  const handleLikeUpdate = (liked) => {
    setSnippet(prev => ({
      ...prev,
      stats: {
        ...prev?.stats,
        likes: liked ? (prev?.stats?.likes || 0) + 1 : Math.max(0, (prev?.stats?.likes || 0) - 1)
      }
    }));
  };

  // Handle comment addition
  const handleAddComment = async (content, parentId = null) => {
    if (!user?.id || !content?.trim()) return;

    try {
      const newComment = await snippetService?.addComment(id, content, parentId);

      if (parentId) {
        // Add reply to existing comment
        setComments(prev => prev?.map(comment => {
          if (comment?.id === parentId) {
            return {
              ...comment,
              replies: [...(comment?.replies || []), newComment]
            };
          }
          return comment;
        }));
      } else {
        // Add new root comment
        setComments(prev => [{...newComment, replies: []}, ...prev]);
      }

      // Update comments count
      setSnippet(prev => ({
        ...prev,
        stats: {
          ...prev?.stats,
          comments: (prev?.stats?.comments || 0) + 1
        }
      }));
    } catch (err) {
      console.error('Error adding comment:', err);
      throw err;
    }
  };

  // NEW: Load user's hive collections
  const loadUserCollections = async () => {
    if (!user || !snippet) return;

    setLoadingCollections(true);
    try {
      const { getHiveCollections } = await import('../../services/hiveCollectionService');
      
      // Get user's hive (assuming user has hiveId in profile)
      const { data: profile } = await import('../../services/profileService')?.then(m => 
        m?.profileService?.getCurrentProfile()
      );
      
      if (profile?.hiveId) {
        const { data } = await getHiveCollections(profile?.hiveId);
        setUserCollections(data || []);
        
        // Check which collections already contain this snippet
        const { getCollectionsWithSnippet } = await import('../../services/hiveCollectionService');
        const { data: existingCollections } = await getCollectionsWithSnippet(profile?.hiveId, snippet?.id);
        setSelectedCollections(existingCollections?.map(c => c?.id) || []);
      }
    } catch (error) {
      console.error('Error loading collections:', error);
    } finally {
      setLoadingCollections(false);
    }
  };

  // NEW: Handle add to collection
  const handleAddToCollection = async () => {
    if (!user || !snippet) {
      alert('Please login to add snippets to collections');
      return;
    }

    setShowCollectionModal(true);
    await loadUserCollections();
  };

  // NEW: Toggle collection selection
  const handleToggleCollection = async (collectionId) => {
    try {
      const { addSnippetToCollection, removeSnippetFromCollection } = await import('../../services/hiveCollectionService');
      
      if (selectedCollections?.includes(collectionId)) {
        // Remove from collection
        await removeSnippetFromCollection(collectionId, snippet?.id);
        setSelectedCollections(prev => prev?.filter(id => id !== collectionId));
      } else {
        // Add to collection
        await addSnippetToCollection(collectionId, snippet?.id);
        setSelectedCollections(prev => [...prev, collectionId]);
      }
    } catch (error) {
      console.error('Error toggling collection:', error);
      alert(error?.message || 'Failed to update collection');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        <AppNavigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-border border-t-purple-600 mx-auto mb-4"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Icon name="Code2" size={24} className="text-primary animate-pulse" />
              </div>
            </div>
            <p className="text-muted-foreground font-medium">Loading snippet...</p>
            <p className="text-sm text-muted-foreground mt-1">Preparing your code experience</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        <AppNavigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-card rounded-xl shadow-lg border-l-4 border-error p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-error/15 rounded-lg">
                <Icon name="AlertTriangle" size={24} className="text-error" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground mb-2">Unable to Load Snippet</h3>
                <p className="text-error mb-4">{error}</p>
                <Button 
                  onClick={() => navigate(-1)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Icon name="ArrowLeft" size={16} className="mr-2" />
                  Go Back
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!snippet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        <AppNavigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-card rounded-xl shadow-lg border-l-4 border-yellow-500 p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-warning/15 rounded-lg">
                <Icon name="Search" size={24} className="text-warning" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground mb-2">Snippet Not Found</h3>
                <p className="text-muted-foreground mb-4">The snippet you're looking for doesn't exist or has been removed.</p>
                <Button 
                  onClick={() => navigate('/user-dashboard')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Icon name="Home" size={16} className="mr-2" />
                  Go to Dashboard
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // CRITICAL: Pass actual AI analysis data, no fallback metadata object
  const aiAnalysis = {
    tags: snippet?.tags || [],
    summary: snippet?.aiAnalysis?.summary || null,
    qualityScore: snippet?.aiQualityScore || 0,
    readabilityScore: snippet?.aiAnalysis?.readabilityScore || 0,
    styleMatchScore: snippet?.aiAnalysis?.styleMatchScore || 0,
    bugRisk: snippet?.aiAnalysis?.bugRisk || 'low',
    complexityLevel: snippet?.aiAnalysis?.complexityLevel || 'medium',
    strengths: snippet?.aiAnalysis?.strengths || [],
    weaknesses: snippet?.aiAnalysis?.weaknesses || [],
    improvements: snippet?.aiAnalysis?.improvements || [],
    recommendations: snippet?.aiAnalysis?.recommendations || { quick: [], detailed: [] },
    categories: snippet?.aiAnalysis?.categories || [],
    purposeTags: snippet?.aiAnalysis?.purposeTags || [],
    metadata: snippet?.aiAnalysis?.metrics || null
  };

  // REMOVED: Empty version history - will be loaded from database when feature is implemented
  const versionHistory = [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <AppNavigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Hero Header Section */}
        <div className="bg-gradient-to-r from-primary via-secondary to-accent rounded-xl shadow-2xl p-8 mb-8 relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-card/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-400/20 rounded-full blur-2xl"></div>
          
          <div className="relative z-10">
            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-2 text-white/80 text-sm mb-4">
              <button 
                onClick={() => navigate(-1)}
                className="hover:text-white transition-colors flex items-center gap-1"
              >
                <Icon name="ArrowLeft" size={16} />
                Back
              </button>
              <Icon name="ChevronRight" size={16} />
              <span className="text-white font-medium">Snippet Details</span>
            </div>

            {/* Title and Description */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1 pr-8">
                <h1 className="text-4xl font-bold text-white mb-3 leading-tight">
                  {snippet?.title}
                </h1>
                <p className="text-white/90 text-lg leading-relaxed">
                  {snippet?.description}
                </p>
              </div>
              {snippet?.isOwner && (
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => navigate(`/create-snippet?edit=${snippet?.id}`)}
                    className="p-3 bg-card/20 hover:bg-card/30 backdrop-blur-sm rounded-xl transition-all transform hover:scale-105"
                    title="Edit snippet"
                  >
                    <Icon name="Edit" size={20} className="text-white" />
                  </button>
                  <button 
                    onClick={() => setShowDeleteModal(true)}
                    className="p-3 bg-error/100/20 hover:bg-error/100/30 backdrop-blur-sm rounded-xl transition-all transform hover:scale-105" 
                    title="Delete snippet"
                  >
                    <Icon name="Trash2" size={20} className="text-white" />
                  </button>
                </div>
              )}
            </div>

            {/* Enhanced Metadata Row */}
            <div className="flex flex-wrap items-center gap-6">
              {/* Author Info */}
              <Link 
                to={`/user-profile/${snippet?.author?.id}`} 
                className="flex items-center gap-3 bg-card/10 backdrop-blur-sm hover:bg-card/20 rounded-xl px-4 py-2 transition-all transform hover:scale-105"
              >
                <Image
                  src={snippet?.author?.avatar}
                  alt={snippet?.author?.avatarAlt}
                  className="w-10 h-10 rounded-full object-cover border-2 border-white/30"
                />
                <div>
                  <p className="text-sm font-semibold text-white">{snippet?.author?.name}</p>
                  <p className="text-xs text-white/70">{snippet?.author?.level?.toUpperCase()}</p>
                </div>
              </Link>

              {/* Stats Cards */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-card/10 backdrop-blur-sm rounded-xl px-4 py-2">
                  <Icon name="Calendar" size={18} className="text-white/80" />
                  <span className="text-sm text-white font-medium">
                    {new Date(snippet?.createdAt)?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-card/10 backdrop-blur-sm rounded-xl px-4 py-2">
                  <Icon name="Eye" size={18} className="text-white/80" />
                  <span className="text-sm text-white font-medium">
                    {snippet?.stats?.views?.toLocaleString()} views
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-card/10 backdrop-blur-sm rounded-xl px-4 py-2">
                  <Icon name="Heart" size={18} className="text-white/80" />
                  <span className="text-sm text-white font-medium">
                    {snippet?.stats?.likes?.toLocaleString()} likes
                  </span>
                </div>
              </div>

              {/* Language Badge */}
              <div className="flex items-center gap-2 bg-card/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/30">
                <Icon name="Code2" size={18} className="text-white" />
                <span className="text-sm font-bold text-white uppercase">
                  {snippet?.language}
                </span>
              </div>

              {/* Visibility Badge */}
              <div className={`flex items-center gap-2 rounded-xl px-4 py-2 border ${
                snippet?.visibility === 'public' ?'bg-success/100/20 border-green-400/30 backdrop-blur-sm' :'bg-orange-500/20 border-orange-400/30 backdrop-blur-sm'
              }`}>
                <Icon 
                  name={snippet?.visibility === 'public' ? 'Globe' : 'Lock'} 
                  size={16} 
                  className="text-white"
                />
                <span className="text-xs font-semibold text-white uppercase">
                  {snippet?.visibility}
                </span>
              </div>
            </div>

            {/* Enhanced Tags */}
            {snippet?.tags?.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {snippet?.tags?.map((tag, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-card/20 backdrop-blur-sm border border-white/30 text-white text-sm font-medium rounded-full hover:bg-card/30 transition-all cursor-pointer transform hover:scale-105"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions Bar */}
        <div className="bg-card rounded-xl shadow-lg p-4 mb-8 border border-border">
          {/* CRITICAL FIX: Add success message display */}
          {errors?.success && (
            <div className="mb-4 bg-success/10 border border-success/20 text-success px-4 py-3 rounded-lg">
              <div className="flex items-start gap-2">
                <Icon name="CheckCircle" size={20} className="flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Success</p>
                  <p className="text-sm">{errors?.success}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* NEW: Add retry/info message display */}
          {errors?.info && (
            <div className="mb-4 bg-primary/10 border border-primary/20 text-primary px-4 py-3 rounded-lg">
              <div className="flex items-start gap-2">
                <Icon name="Info" size={20} className="flex-shrink-0 mt-0.5 animate-pulse" />
                <div className="flex-1">
                  <p className="font-medium">Processing</p>
                  <p className="text-sm">{errors?.info}</p>
                  {retryAttempt > 0 && (
                    <div className="mt-2">
                      <div className="w-full bg-blue-200 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(retryAttempt / 3) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs mt-1">Retry attempt {retryAttempt}/3</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* CRITICAL FIX: Add error message display */}
          {errors?.submit && (
            <div className="mb-4 bg-error/10 border border-error/20 text-error px-4 py-3 rounded-lg">
              <div className="flex items-start gap-2">
                <Icon name="AlertCircle" size={20} className="flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Error</p>
                  <p className="text-sm">{errors?.submit}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleReanalyze}
                disabled={reanalyzing || !snippet?.code || !snippet?.language}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-secondary hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg font-medium transition-all transform hover:scale-105 disabled:scale-100 shadow-md disabled:cursor-not-allowed"
              >
                <Icon name={reanalyzing ? "Loader2" : "Refresh"} size={18} className={reanalyzing ? "animate-spin" : ""} />
                <span>
                  {reanalyzing 
                    ? (retryAttempt > 0 
                        ? `Retrying (${retryAttempt}/3)...` 
                        : 'Analyzing...')
                    : 'Reanalyze with AI'}
                </span>
              </button>
              
              <button
                onClick={() => handleAddToCollection()}
                className="flex items-center gap-2 px-5 py-2.5 bg-card hover:bg-background border-2 border-purple-600 text-primary rounded-lg font-medium transition-all transform hover:scale-105 shadow-md"
              >
                <Icon name="FolderPlus" size={18} />
                <span>Add to Collection</span>
              </button>

              <button
                onClick={() => navigate(`/ai-optimization-report?snippetId=${snippet?.id}`)}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all transform hover:scale-105 shadow-md"
              >
                <Icon name="Sparkles" size={18} />
                <span>View Full AI Report</span>
              </button>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-background px-4 py-2 rounded-lg">
              <Icon name="MessageSquare" size={18} />
              <span className="font-semibold">{snippet?.stats?.comments || 0}</span>
              <span>comments</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <EngagementBar 
              snippet={snippet} 
              onLikeUpdate={handleLikeUpdate}
            />

            <AISnippetSharing snippet={snippet} />
            
            <CodeViewer snippet={snippet} />
            
            <CommentSection 
              comments={comments} 
              onAddComment={handleAddComment}
            />
            
            <div className="max-w-5xl mx-auto">
              <AIReportButton 
                entity={snippet} 
                entityType="snippet"
                onReportGenerated={(report) => {
                  console.log('Snippet AI report generated:', report);
                  setSnippet(prev => ({
                    ...prev,
                    aiReport: report
                  }));
                }}
              />
            </div>
          </div>

          {/* Enhanced Sidebar - Right Column */}
          <div className="space-y-6">
            {/* Author Card with gradient */}
            <div className="bg-gradient-to-br from-white to-purple-50 rounded-xl shadow-lg border border-border overflow-hidden">
              <div className="bg-gradient-to-r from-primary to-secondary px-4 py-3">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <Icon name="User" size={18} />
                  Author Information
                </h3>
              </div>
              <AuthorCard author={snippet?.author} />
            </div>

            {/* AI Analysis Card */}
            <AITagsDisplay 
              aiAnalysis={aiAnalysis}
              snippetId={snippet?.id}
              code={snippet?.code}
              language={snippet?.language}
            />

            {/* Stats Overview Card */}
            <div className="bg-card rounded-xl shadow-lg border border-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Icon name="TrendingUp" size={20} className="text-primary" />
                Engagement Stats
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-primary/20">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary rounded-lg">
                      <Icon name="Eye" size={18} className="text-white" />
                    </div>
                    <span className="text-sm font-medium text-foreground">Total Views</span>
                  </div>
                  <span className="text-lg font-bold text-primary">
                    {snippet?.stats?.views?.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border border-error/20">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-error/100 rounded-lg">
                      <Icon name="Heart" size={18} className="text-white" />
                    </div>
                    <span className="text-sm font-medium text-foreground">Total Likes</span>
                  </div>
                  <span className="text-lg font-bold text-error">
                    {snippet?.stats?.likes?.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-success/20">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-success/100 rounded-lg">
                      <Icon name="MessageSquare" size={18} className="text-white" />
                    </div>
                    <span className="text-sm font-medium text-foreground">Comments</span>
                  </div>
                  <span className="text-lg font-bold text-success">
                    {snippet?.stats?.comments?.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/100 rounded-lg">
                      <Icon name="Bookmark" size={18} className="text-white" />
                    </div>
                    <span className="text-sm font-medium text-foreground">Saves</span>
                  </div>
                  <span className="text-lg font-bold text-primary">
                    {recentSaves?.length?.toLocaleString() || 0}
                  </span>
                </div>
              </div>
            </div>

            <RecentEngagement likes={recentLikes} saves={recentSaves} />
            {versionHistory?.length > 0 && (
              <VersionHistory versions={versionHistory} />
            )}
            {relatedSnippets?.length > 0 && (
              <RelatedSnippets snippets={relatedSnippets} />
            )}
          </div>
        </div>
      </div>

      {/* NEW: Add to Collection Modal */}
      {showCollectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg shadow-xl max-w-md w-full max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground">Add to Collection</h3>
              <button
                onClick={() => setShowCollectionModal(false)}
                className="p-1 hover:bg-muted rounded-md transition-colors"
              >
                <Icon name="X" size={20} className="text-muted-foreground" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {loadingCollections ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : userCollections?.length === 0 ? (
                <div className="text-center py-8">
                  <Icon name="FolderOpen" size={48} className="mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No collections yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Create a collection in your hive first
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {userCollections?.map((collection) => {
                    const isSelected = selectedCollections?.includes(collection?.id);
                    
                    return (
                      <button
                        key={collection?.id}
                        onClick={() => handleToggleCollection(collection?.id)}
                        className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-primary/10' :'border-border hover:border-border hover:bg-background'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            isSelected
                              ? 'bg-primary border-blue-500' :'border-border'
                          }`}>
                            {isSelected && (
                              <Icon name="Check" size={14} className="text-white" />
                            )}
                          </div>
                          <div className="text-left">
                            <p className="font-medium text-foreground">{collection?.name}</p>
                            {collection?.description && (
                              <p className="text-sm text-muted-foreground mt-0.5">{collection?.description}</p>
                            )}
                          </div>
                        </div>
                        <Icon 
                          name={isSelected ? 'CheckCircle' : 'Circle'} 
                          size={20} 
                          className={isSelected ? 'text-primary' : 'text-muted-foreground'} 
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex gap-3 p-6 border-t border-border">
              <button
                onClick={() => setShowCollectionModal(false)}
                className="flex-1 px-4 py-2 border border-border text-foreground rounded-lg hover:bg-background transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowCollectionModal(false)}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SnippetDetails;