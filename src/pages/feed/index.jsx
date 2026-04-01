import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import AppShell from '../../components/AppShell';
import Icon from '../../components/AppIcon';
import { formatTimeAgo } from '../../utils/formatTime';

export default function ForYouFeed() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('foryou');

  useEffect(() => {
    if (user) loadFeed();
  }, [user, activeTab]);

  const loadFeed = async () => {
    try {
      setLoading(true);
      let feedItems = [];

      if (activeTab === 'foryou' || activeTab === 'following') {
        // Get users I follow
        const { data: follows } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', user.id);
        const followIds = follows?.map(f => f.following_id) || [];

        if (activeTab === 'following' && followIds.length > 0) {
          // Snippets from followed users only
          const { data } = await supabase
            .from('snippets')
            .select('*, author:user_profiles!snippets_user_id_fkey(id, username, full_name, avatar_url)')
            .in('user_id', followIds)
            .eq('visibility', 'public')
            .order('created_at', { ascending: false })
            .limit(30);
          feedItems = data || [];
        } else {
          // For You: mix of followed (if any) + trending
          let followedSnippets = [];
          if (followIds.length > 0) {
            const { data } = await supabase
              .from('snippets')
              .select('*, author:user_profiles!snippets_user_id_fkey(id, username, full_name, avatar_url)')
              .in('user_id', followIds)
              .eq('visibility', 'public')
              .order('created_at', { ascending: false })
              .limit(15);
            followedSnippets = data || [];
          }

          // Trending snippets (fill remaining)
          const { data: trending } = await supabase
            .from('snippets')
            .select('*, author:user_profiles!snippets_user_id_fkey(id, username, full_name, avatar_url)')
            .eq('visibility', 'public')
            .order('views_count', { ascending: false })
            .order('likes_count', { ascending: false })
            .limit(30 - followedSnippets.length);

          // Merge and deduplicate
          const seen = new Set(followedSnippets.map(s => s.id));
          const trendingFiltered = (trending || []).filter(s => !seen.has(s.id));
          feedItems = [...followedSnippets, ...trendingFiltered];
        }
      } else if (activeTab === 'trending') {
        const { data } = await supabase
          .from('snippets')
          .select('*, author:user_profiles!snippets_user_id_fkey(id, username, full_name, avatar_url)')
          .eq('visibility', 'public')
          .order('views_count', { ascending: false })
          .limit(30);
        feedItems = data || [];
      }

      setItems(feedItems);
    } catch (err) {
      console.error('Error loading feed:', err);
    } finally {
      setLoading(false);
    }
  };

  const FeedSidebar = () => (
    <div className="space-y-5">
      <div className="hyv-card p-4">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Your Feed</h3>
        <p className="text-xs text-muted-foreground">Personalized snippets from developers you follow and trending in your languages.</p>
      </div>
    </div>
  );

  return (
    <AppShell pageTitle="Feed" rightSidebar={<FeedSidebar />}>
      <div className="p-4 lg:p-6">
        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 border-b border-border">
          {[
            { id: 'foryou', label: 'For You', icon: 'Sparkles' },
            { id: 'following', label: 'Following', icon: 'Users' },
            { id: 'trending', label: 'Trending', icon: 'TrendingUp' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'text-primary border-primary'
                  : 'text-muted-foreground border-transparent hover:text-foreground'
              }`}
            >
              <Icon name={tab.icon} size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="hyv-card p-4">
                <div className="h-3 w-16 hyv-skeleton mb-2 rounded" />
                <div className="h-4 w-3/4 hyv-skeleton mb-3 rounded" />
                <div className="flex gap-1 mb-3">
                  <div className="h-5 w-12 hyv-skeleton rounded" />
                  <div className="h-5 w-14 hyv-skeleton rounded" />
                </div>
                <div className="flex justify-between">
                  <div className="h-3 w-20 hyv-skeleton rounded" />
                  <div className="h-3 w-12 hyv-skeleton rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="hyv-empty">
            <Icon name="Rss" size={40} className="mb-3 opacity-30 text-primary" />
            <h3 className="text-base font-semibold text-foreground mb-1">
              {activeTab === 'following' ? 'Follow developers to see their code here' : 'No snippets found'}
            </h3>
            <p className="text-xs text-muted-foreground mb-4 max-w-sm">
              {activeTab === 'following'
                ? 'Explore the community and follow developers whose code inspires you'
                : 'Check back soon for new content'
              }
            </p>
            <button onClick={() => navigate('/global-explore-feed')} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90">
              Explore Snippets
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map(snippet => {
              const purposeTag = snippet?.ai_analysis_data?.purposeTags?.[0] || snippet?.snippet_type || 'code';
              const qualityScore = snippet?.ai_quality_score;
              return (
                <div key={snippet.id} onClick={() => navigate(`/snippet-details?id=${snippet.id}`)} className="hyv-card p-4 cursor-pointer group">
                  <span className="inline-block px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-accent/15 text-accent rounded mb-2">{purposeTag}</span>
                  <h3 className="text-sm font-semibold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">{snippet.title}</h3>
                  <div className="flex items-center gap-1.5 mb-3">
                    <span className="px-2 py-0.5 text-[11px] font-mono bg-muted text-foreground rounded">{snippet.language}</span>
                  </div>
                  {snippet.ai_tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {snippet.ai_tags.slice(0, 3).map((tag, i) => (
                        <span key={i} className="hyv-tag text-[10px]">{tag}</span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground mb-3">
                    <span className="flex items-center gap-1"><Icon name="Heart" size={12} /> {snippet.likes_count || 0}</span>
                    <span className="flex items-center gap-1"><Icon name="Eye" size={12} /> {snippet.views_count || 0}</span>
                    {qualityScore > 0 && (
                      <span className={`ml-auto px-1.5 py-0.5 text-[10px] font-bold rounded ${qualityScore >= 80 ? 'bg-success/15 text-success' : qualityScore >= 50 ? 'bg-warning/15 text-warning' : 'bg-muted text-muted-foreground'}`}>AI {qualityScore}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-border">
                    <img src={snippet.author?.avatar_url || `https://ui-avatars.com/api/?name=U&background=8b5cf6&color=fff&size=24`} alt="" className="w-5 h-5 rounded-full object-cover" />
                    <span className="text-xs text-muted-foreground truncate flex-1">{snippet.author?.full_name || snippet.author?.username}</span>
                    <span className="text-[11px] text-muted-foreground">{formatTimeAgo(snippet.created_at)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
