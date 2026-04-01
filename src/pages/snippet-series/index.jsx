import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import AppShell from '../../components/AppShell';
import Icon from '../../components/AppIcon';
import { formatTimeAgo } from '../../utils/formatTime';

export default function SnippetSeriesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const seriesId = searchParams.get('id');

  const [allSeries, setAllSeries] = useState([]);
  const [activeSeries, setActiveSeries] = useState(null);
  const [seriesSnippets, setSeriesSnippets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newSeries, setNewSeries] = useState({ title: '', description: '' });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (seriesId) {
      loadSeriesDetail(seriesId);
    } else {
      loadAllSeries();
    }
  }, [seriesId]);

  const loadAllSeries = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('snippet_series')
        .select('*, creator:user_profiles!snippet_series_created_by_fkey(id, username, full_name, avatar_url)')
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      setAllSeries(data || []);
    } catch (err) {
      console.error('Error loading series:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSeriesDetail = async (id) => {
    try {
      setLoading(true);
      const { data: series, error } = await supabase
        .from('snippet_series')
        .select('*, creator:user_profiles!snippet_series_created_by_fkey(id, username, full_name, avatar_url)')
        .eq('id', id)
        .single();
      if (error) throw error;
      setActiveSeries(series);

      // Load snippets in this series
      if (series?.snippet_ids?.length > 0) {
        const { data: snippets } = await supabase
          .from('snippets')
          .select('*, author:user_profiles!snippets_user_id_fkey(id, username, full_name, avatar_url)')
          .in('id', series.snippet_ids);
        // Sort by order in snippet_ids array
        const ordered = series.snippet_ids.map(sid => snippets?.find(s => s.id === sid)).filter(Boolean);
        setSeriesSnippets(ordered);
      }
    } catch (err) {
      console.error('Error loading series:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newSeries.title.trim()) return;
    try {
      setCreating(true);
      const { data: { user: authUser } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('snippet_series')
        .insert({
          title: newSeries.title,
          description: newSeries.description,
          snippet_ids: [],
          created_by: authUser.id,
        })
        .select()
        .single();
      if (error) throw error;
      setShowCreate(false);
      setNewSeries({ title: '', description: '' });
      loadAllSeries();
    } catch (err) {
      alert(err.message || 'Failed to create series');
    } finally {
      setCreating(false);
    }
  };

  const Sidebar = () => (
    <div className="space-y-5">
      <div className="hyv-card p-4">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">About Series</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">Link related snippets into ordered series — like tutorial threads. "Part 1: Setup → Part 2: Auth → Part 3: Database"</p>
      </div>
      <button onClick={() => setShowCreate(true)}
        className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
        <Icon name="Plus" size={16} /> Create Series
      </button>
    </div>
  );

  // Series detail view
  if (activeSeries) {
    return (
      <AppShell pageTitle="Series">
        <div className="p-4 lg:p-6">
          <button onClick={() => { setActiveSeries(null); navigate('/snippet-series'); }}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
            <Icon name="ArrowLeft" size={16} /> Back to Series
          </button>
          <div className="mb-6">
            <h1 className="text-xl font-bold text-foreground mb-2">{activeSeries.title}</h1>
            {activeSeries.description && <p className="text-sm text-muted-foreground">{activeSeries.description}</p>}
            <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
              <img src={activeSeries.creator?.avatar_url || `https://ui-avatars.com/api/?name=U&background=8b5cf6&color=fff&size=20`} alt="" className="w-5 h-5 rounded-full" />
              <span>{activeSeries.creator?.full_name || activeSeries.creator?.username}</span>
              <span>·</span>
              <span>{seriesSnippets.length} parts</span>
            </div>
          </div>

          {seriesSnippets.length === 0 ? (
            <div className="hyv-empty">
              <Icon name="Layers" size={40} className="mb-3 opacity-30 text-primary" />
              <h3 className="text-base font-semibold text-foreground mb-1">No snippets in this series yet</h3>
              <p className="text-xs text-muted-foreground">Add snippets to build your tutorial thread</p>
            </div>
          ) : (
            <div className="space-y-4">
              {seriesSnippets.map((snippet, idx) => (
                <div key={snippet.id} onClick={() => navigate(`/snippet-details?id=${snippet.id}`)}
                  className="hyv-card p-4 cursor-pointer group flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/15 text-primary flex items-center justify-center text-sm font-bold">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{snippet.title}</h3>
                    {snippet.description && <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{snippet.description}</p>}
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
                      <span className="px-2 py-0.5 bg-muted rounded font-mono">{snippet.language}</span>
                      <span className="flex items-center gap-1"><Icon name="Heart" size={11} /> {snippet.likes_count || 0}</span>
                      <span className="flex items-center gap-1"><Icon name="Eye" size={11} /> {snippet.views_count || 0}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </AppShell>
    );
  }

  // Series list view
  return (
    <AppShell pageTitle="Series" rightSidebar={<Sidebar />}>
      <div className="p-4 lg:p-6">
        <div className="mb-6">
          <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Icon name="Layers" size={20} className="text-primary" /> Snippet Series
          </h1>
          <p className="text-xs text-muted-foreground">Tutorial threads and linked snippet collections</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="hyv-card p-5">
                <div className="h-4 w-3/4 hyv-skeleton mb-3 rounded" />
                <div className="h-3 w-full hyv-skeleton mb-2 rounded" />
                <div className="h-3 w-1/2 hyv-skeleton rounded" />
              </div>
            ))}
          </div>
        ) : allSeries.length === 0 ? (
          <div className="hyv-empty">
            <Icon name="Layers" size={40} className="mb-3 opacity-30 text-primary" />
            <h3 className="text-base font-semibold text-foreground mb-1">No series yet</h3>
            <p className="text-xs text-muted-foreground mb-4 max-w-sm">Create a series to link related snippets into a tutorial thread</p>
            <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90">Create Series</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allSeries.map(series => (
              <div key={series.id} onClick={() => navigate(`/snippet-series?id=${series.id}`)}
                className="hyv-card p-5 cursor-pointer group hover:border-primary/30 transition-colors">
                <h3 className="text-base font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">{series.title}</h3>
                {series.description && <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{series.description}</p>}
                <div className="flex items-center justify-between pt-3 border-t border-border text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <img src={series.creator?.avatar_url || `https://ui-avatars.com/api/?name=U&background=8b5cf6&color=fff&size=20`} alt="" className="w-5 h-5 rounded-full" />
                    <span>{series.creator?.full_name || series.creator?.username}</span>
                  </div>
                  <span className="flex items-center gap-1">
                    <Icon name="Layers" size={12} /> {series.snippet_ids?.length || 0} parts
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Series Modal */}
        {showCreate && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-lg shadow-xl max-w-lg w-full border border-border">
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h3 className="text-lg font-semibold text-foreground">Create Series</h3>
                <button onClick={() => setShowCreate(false)} className="p-1 hover:bg-muted rounded-md"><Icon name="X" size={20} className="text-muted-foreground" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Title</label>
                  <input value={newSeries.title} onChange={e => setNewSeries(p => ({...p, title: e.target.value}))}
                    className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary" placeholder="Building a Full-Stack App..." />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Description</label>
                  <textarea value={newSeries.description} onChange={e => setNewSeries(p => ({...p, description: e.target.value}))} rows={3}
                    className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm text-foreground resize-none focus:outline-none focus:border-primary" placeholder="A step-by-step guide..." />
                </div>
              </div>
              <div className="flex justify-end gap-3 p-6 border-t border-border">
                <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
                <button onClick={handleCreate} disabled={creating || !newSeries.title.trim()}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">
                  {creating ? 'Creating...' : 'Create Series'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
