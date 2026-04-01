import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { hiveService } from '../../services/hiveService';
import AppShell from '../../components/AppShell';
import Icon from '../../components/AppIcon';
import { formatTimeAgo } from '../../utils/formatTime';

export default function TrendingPage() {
  const navigate = useNavigate();
  const [activeWindow, setActiveWindow] = useState('week');
  const [snippets, setSnippets] = useState([]);
  const [tags, setTags] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadTrending(); }, [activeWindow]);

  const loadTrending = async () => {
    try {
      setLoading(true);

      // Time filter
      const cutoff = new Date();
      if (activeWindow === 'today') cutoff.setHours(cutoff.getHours() - 24);
      else if (activeWindow === 'week') cutoff.setDate(cutoff.getDate() - 7);
      else cutoff.setDate(cutoff.getDate() - 30);

      const [snippetsRes, tagsRes, authorsRes] = await Promise.all([
        supabase.from('snippets')
          .select('*, author:user_profiles!snippets_user_id_fkey(id, username, full_name, avatar_url)')
          .eq('visibility', 'public')
          .gte('created_at', cutoff.toISOString())
          .order('views_count', { ascending: false })
          .limit(12),
        hiveService.getTrendingTags(20),
        hiveService.getTopContributors(10),
      ]);

      setSnippets(snippetsRes.data || []);
      setTags(tagsRes || []);
      setAuthors(authorsRes || []);
    } catch (err) {
      console.error('Error loading trending:', err);
    } finally {
      setLoading(false);
    }
  };

  const TrendingSidebar = () => (
    <div className="space-y-5">
      <div className="hyv-card p-4">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1">
          <Icon name="TrendingUp" size={12} /> Hot Tags
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {tags.map(({ tag, count }) => (
            <button key={tag} onClick={() => navigate(`/global-explore-feed?tag=${tag}`)} className="hyv-tag text-[10px]">
              {tag} <span className="opacity-50 ml-0.5">{count}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="hyv-card p-4">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1">
          <Icon name="Award" size={12} /> Rising Authors
        </h3>
        <div className="space-y-2.5">
          {authors.map((u, i) => (
            <button key={u.id || i} onClick={() => navigate(`/user-profile/${u.id}`)} className="flex items-center gap-2.5 w-full text-left hover:bg-white/5 rounded-md p-1.5 -m-1.5 transition-colors">
              <span className="text-[10px] font-bold text-muted-foreground w-3">{i + 1}</span>
              <img src={u.avatar_url || `https://ui-avatars.com/api/?name=U&background=8b5cf6&color=fff&size=28`} alt="" className="w-6 h-6 rounded-full object-cover" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{u.full_name || u.username}</p>
                <p className="text-[10px] text-muted-foreground">{u.snippet_count} snippets</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <AppShell pageTitle="Trending" rightSidebar={<TrendingSidebar />}>
      <div className="p-4 lg:p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Icon name="TrendingUp" size={20} className="text-primary" /> Trending
            </h1>
            <p className="text-xs text-muted-foreground">What's hot in the developer community</p>
          </div>
          <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
            {[
              { id: 'today', label: 'Today' },
              { id: 'week', label: 'This Week' },
              { id: 'month', label: 'This Month' },
            ].map(w => (
              <button key={w.id} onClick={() => setActiveWindow(w.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${activeWindow === w.id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
                {w.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="hyv-card p-4">
                <div className="h-3 w-16 hyv-skeleton mb-2 rounded" />
                <div className="h-4 w-3/4 hyv-skeleton mb-3 rounded" />
                <div className="h-3 w-1/2 hyv-skeleton mb-3 rounded" />
                <div className="flex justify-between"><div className="h-3 w-20 hyv-skeleton rounded" /><div className="h-3 w-12 hyv-skeleton rounded" /></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {snippets.map((snippet, idx) => {
              const qualityScore = snippet.ai_quality_score;
              return (
                <div key={snippet.id} onClick={() => navigate(`/snippet-details?id=${snippet.id}`)} className="hyv-card p-4 cursor-pointer group relative">
                  {idx < 3 && <div className="absolute top-2 right-2 px-2 py-0.5 text-[10px] font-bold bg-primary text-white rounded">#{idx + 1}</div>}
                  <span className="inline-block px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-accent/15 text-accent rounded mb-2">{snippet.snippet_type || 'code'}</span>
                  <h3 className="text-sm font-semibold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">{snippet.title}</h3>
                  <div className="flex items-center gap-1.5 mb-3">
                    <span className="px-2 py-0.5 text-[11px] font-mono bg-muted text-foreground rounded">{snippet.language}</span>
                  </div>
                  {snippet.ai_tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {snippet.ai_tags.slice(0, 3).map((tag, i) => <span key={i} className="hyv-tag text-[10px]">{tag}</span>)}
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground mb-3">
                    <span className="flex items-center gap-1"><Icon name="Eye" size={12} /> {snippet.views_count || 0}</span>
                    <span className="flex items-center gap-1"><Icon name="Heart" size={12} /> {snippet.likes_count || 0}</span>
                    {qualityScore > 0 && <span className={`ml-auto px-1.5 py-0.5 text-[10px] font-bold rounded ${qualityScore >= 80 ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning'}`}>AI {qualityScore}</span>}
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
