import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import { generateComprehensiveHiveInsights } from '../../../services/aiHiveInsightsService';

export default function HiveInsightsSidebar({ 
  hiveData,
  collections, 
  insights, 
  recentActivity,
  onClose 
}) {
  const navigate = useNavigate();
  const [aiInsights, setAiInsights] = useState(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [showAIInsights, setShowAIInsights] = useState(false);

  // Load AI insights on mount or when hive data changes
  useEffect(() => {
    if (hiveData && showAIInsights) {
      loadAIInsights();
    }
  }, [hiveData, showAIInsights]);

  const loadAIInsights = async () => {
    setIsLoadingAI(true);
    setAiError(null);
    
    try {
      const userData = {}; // Could be passed as prop or fetched from context
      const fullHiveData = {
        ...hiveData,
        collections,
        trendingSnippets: insights?.trendingSnippets || [],
        recentActivity,
        memberCount: insights?.totalMembers || hiveData?.member_count || 0,
        snippetCount: insights?.totalSnippets || hiveData?.snippet_count || 0
      };

      const generatedInsights = await generateComprehensiveHiveInsights(fullHiveData, userData);
      setAiInsights(generatedInsights);
    } catch (error) {
      setAiError(error?.message);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const toggleAIInsights = () => {
    setShowAIInsights(!showAIInsights);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 h-full overflow-y-auto">
      {/* Mobile header */}
      <div className="flex items-center justify-between lg:hidden mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Insights</h3>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Icon name="X" size={20} />
        </button>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h3 className="hidden lg:block text-sm font-semibold text-gray-900">Hive Insights</h3>
        
        {/* AI Insights Toggle */}
        <button
          onClick={toggleAIInsights}
          className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all text-xs font-medium"
        >
          <Icon name="Sparkles" size={14} />
          AI Insights
        </button>
      </div>

      {/* AI-Powered Insights Section */}
      {showAIInsights && (
        <div className="mb-6 pb-6 border-b border-gray-200">
          {isLoadingAI && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
            </div>
          )}

          {aiError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{aiError}</p>
              <button
                onClick={loadAIInsights}
                className="mt-2 text-xs text-red-600 hover:text-red-700 font-medium"
              >
                Try again
              </button>
            </div>
          )}

          {aiInsights && !isLoadingAI && (
            <div className="space-y-4">
              {/* AI Summary */}
              {aiInsights?.summary && (
                <div className="p-3 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon name="Sparkles" size={14} className="text-purple-600" />
                    <h5 className="text-xs font-semibold text-purple-900">AI Summary</h5>
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed mb-2">
                    {aiInsights?.summary?.summary}
                  </p>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="px-2 py-1 bg-white rounded-full">
                      Activity: <strong>{aiInsights?.summary?.activityLevel}</strong>
                    </span>
                    <span className="px-2 py-1 bg-white rounded-full">
                      Health: <strong>{aiInsights?.summary?.healthScore}/100</strong>
                    </span>
                  </div>
                  {aiInsights?.summary?.focusAreas?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {aiInsights?.summary?.focusAreas?.map((area, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
                          {area}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Trending Analysis */}
              {aiInsights?.trendingAnalysis && (
                <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon name="TrendingUp" size={14} className="text-orange-600" />
                    <h5 className="text-xs font-semibold text-orange-900">Trending Topics</h5>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {aiInsights?.trendingAnalysis?.trendingTopics?.map((topic, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs font-medium">
                        🔥 {topic}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    {aiInsights?.trendingAnalysis?.engagementPatterns}
                  </p>
                </div>
              )}

              {/* Personalized Recommendations */}
              {aiInsights?.recommendations?.topRecommendations?.length > 0 && (
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon name="Lightbulb" size={14} className="text-green-600" />
                    <h5 className="text-xs font-semibold text-green-900">Recommended Actions</h5>
                  </div>
                  <div className="space-y-2">
                    {aiInsights?.recommendations?.topRecommendations?.slice(0, 3)?.map((rec, idx) => (
                      <div key={idx} className="p-2 bg-white rounded border border-green-100">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-medium text-gray-900">{rec?.action}</p>
                          <span className={`px-1.5 py-0.5 rounded text-xs ${
                            rec?.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                            rec?.difficulty === 'medium'? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {rec?.difficulty}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">{rec?.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Collections Summary */}
      {collections?.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold text-gray-700">Top Collections</h4>
            <span className="text-xs text-gray-500">{collections?.length} total</span>
          </div>
          <div className="space-y-2">
            {collections?.slice(0, 5)?.map((collection) => (
              <div 
                key={collection?.id} 
                className="p-2 hover:bg-purple-50 rounded-lg cursor-pointer transition-colors group"
                onClick={() => {
                  onClose?.();
                }}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 truncate group-hover:text-purple-700">
                    {collection?.name}
                  </p>
                  <Icon name="ChevronRight" size={14} className="text-gray-400 group-hover:text-purple-700" />
                </div>
                <p className="text-xs text-gray-500">{collection?.snippet_count || 0} snippets</p>
              </div>
            ))}
          </div>
          {collections?.length > 5 && (
            <button 
              className="w-full mt-2 text-xs text-purple-600 hover:text-purple-700 font-medium"
              onClick={onClose}
            >
              View all {collections?.length} collections →
            </button>
          )}
        </div>
      )}

      {/* Trending Snippets */}
      {insights?.trendingSnippets?.length > 0 && (
        <div className="mb-6 pb-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold text-gray-700">Trending Snippets</h4>
            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
              🔥 Hot
            </span>
          </div>
          <div className="space-y-2">
            {insights?.trendingSnippets?.map((snippet) => (
              <div 
                key={snippet?.id} 
                className="p-2 hover:bg-purple-50 rounded-lg cursor-pointer transition-colors group"
                onClick={() => {
                  navigate(`/snippet-details?id=${snippet?.id}`);
                  onClose?.();
                }}
              >
                <p className="text-sm font-medium text-gray-900 truncate group-hover:text-purple-700">
                  {snippet?.title}
                </p>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Icon name="Eye" size={12} />
                    {snippet?.views_count}
                  </span>
                  <span className="flex items-center gap-1">
                    <Icon name="Heart" size={12} />
                    {snippet?.likes_count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {recentActivity?.length > 0 && (
        <div className="mb-6 pb-6 border-b border-gray-200">
          <h4 className="text-xs font-semibold text-gray-700 mb-2">Recent Activity</h4>
          <div className="space-y-3">
            {recentActivity?.slice(0, 5)?.map((activity, idx) => (
              <div key={idx} className="flex gap-2">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                  activity?.type === 'snippet' ? 'bg-blue-500' :
                  activity?.type === 'member' ? 'bg-green-500' :
                  activity?.type === 'collection'? 'bg-purple-500' : 'bg-gray-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-900 leading-relaxed">
                    {activity?.description}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {activity?.timeAgo}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analytics Snapshot */}
      <div>
        <h4 className="text-xs font-semibold text-gray-700 mb-3">Analytics</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Icon name="Code" size={16} className="text-gray-400" />
              <span className="text-gray-600">Total Snippets</span>
            </div>
            <span className="font-semibold text-gray-900">{insights?.totalSnippets || 0}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Icon name="Users" size={16} className="text-gray-400" />
              <span className="text-gray-600">Active Members (7d)</span>
            </div>
            <span className="font-semibold text-gray-900">{insights?.activeMembers || 0}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Icon name="TrendingUp" size={16} className="text-gray-400" />
              <span className="text-gray-600">Posts This Week</span>
            </div>
            <span className="font-semibold text-gray-900">{insights?.postsThisWeek || 0}</span>
          </div>
          {insights?.growthRate && (
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 text-green-700">
                <Icon name="TrendingUp" size={16} />
                <span className="text-sm font-medium">
                  {insights?.growthRate}% growth this month
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}