import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AppShell from '../../components/AppShell';
import Icon from '../../components/AppIcon';
import { challengeService } from '../../services/challengeService';
import { formatTimeAgo } from '../../utils/formatTime';

export default function ChallengesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('active');
  const [showCreate, setShowCreate] = useState(false);
  const [newChallenge, setNewChallenge] = useState({ title: '', description: '', deadline: '', difficulty: 'medium', tags: '' });
  const [creating, setCreating] = useState(false);

  useEffect(() => { loadChallenges(); }, [filter]);

  const loadChallenges = async () => {
    try {
      setLoading(true);
      const data = await challengeService.getChallenges(filter);
      setChallenges(data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newChallenge.title.trim() || !newChallenge.deadline) return;
    try {
      setCreating(true);
      await challengeService.createChallenge({
        ...newChallenge,
        tags: newChallenge.tags.split(',').map(t => t.trim()).filter(Boolean),
      });
      setShowCreate(false);
      setNewChallenge({ title: '', description: '', deadline: '', difficulty: 'medium', tags: '' });
      loadChallenges();
    } catch (err) {
      alert(err.message || 'Failed to create challenge');
    } finally {
      setCreating(false);
    }
  };

  const getDifficultyColor = (d) => {
    if (d === 'easy') return 'bg-success/15 text-success';
    if (d === 'hard') return 'bg-error/15 text-error';
    return 'bg-warning/15 text-warning';
  };

  const isActive = (deadline) => new Date(deadline) > new Date();

  const Sidebar = () => (
    <div className="space-y-5">
      <div className="hyv-card p-4">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">About Challenges</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">Weekly coding challenges where developers submit snippets. Community votes determine the winner. Winners get featured on the explore page.</p>
      </div>
      <button
        onClick={() => setShowCreate(true)}
        className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
      >
        <Icon name="Plus" size={16} /> Create Challenge
      </button>
    </div>
  );

  return (
    <AppShell pageTitle="Challenges" rightSidebar={<Sidebar />}>
      <div className="p-4 lg:p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Icon name="Trophy" size={20} className="text-warning" /> Code Challenges
            </h1>
            <p className="text-xs text-muted-foreground">Compete, learn, and showcase your skills</p>
          </div>
          <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
            {['active', 'ended', 'all'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-xs font-medium rounded capitalize transition-colors ${filter === f ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
                {f}
              </button>
            ))}
          </div>
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
        ) : challenges.length === 0 ? (
          <div className="hyv-empty">
            <Icon name="Trophy" size={40} className="mb-3 opacity-30 text-warning" />
            <h3 className="text-base font-semibold text-foreground mb-1">No challenges yet</h3>
            <p className="text-xs text-muted-foreground mb-4 max-w-sm">Be the first to create a coding challenge for the community</p>
            <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90">
              Create Challenge
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {challenges.map(challenge => (
              <div key={challenge.id} className="hyv-card p-5 cursor-pointer group hover:border-primary/30 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${getDifficultyColor(challenge.difficulty)}`}>
                      {challenge.difficulty}
                    </span>
                    {isActive(challenge.deadline) ? (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-success/15 text-success uppercase">Active</span>
                    ) : (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-muted text-muted-foreground uppercase">Ended</span>
                    )}
                  </div>
                </div>
                <h3 className="text-base font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">{challenge.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{challenge.description}</p>
                {challenge.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {challenge.tags.map((tag, i) => (
                      <span key={i} className="hyv-tag text-[10px]">{tag}</span>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between pt-3 border-t border-border text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <img src={challenge.creator?.avatar_url || `https://ui-avatars.com/api/?name=U&background=8b5cf6&color=fff&size=20`} alt="" className="w-5 h-5 rounded-full" />
                    <span>{challenge.creator?.full_name || challenge.creator?.username}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Icon name="Clock" size={12} />
                    <span>{isActive(challenge.deadline) ? `Ends ${formatTimeAgo(challenge.deadline)}` : `Ended ${formatTimeAgo(challenge.deadline)}`}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Challenge Modal */}
        {showCreate && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-lg shadow-xl max-w-lg w-full border border-border">
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h3 className="text-lg font-semibold text-foreground">Create Challenge</h3>
                <button onClick={() => setShowCreate(false)} className="p-1 hover:bg-muted rounded-md"><Icon name="X" size={20} className="text-muted-foreground" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Title</label>
                  <input value={newChallenge.title} onChange={e => setNewChallenge(p => ({...p, title: e.target.value}))}
                    className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary" placeholder="Build a responsive navbar..." />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Description</label>
                  <textarea value={newChallenge.description} onChange={e => setNewChallenge(p => ({...p, description: e.target.value}))} rows={4}
                    className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm text-foreground resize-none focus:outline-none focus:border-primary" placeholder="Describe the challenge requirements..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Deadline</label>
                    <input type="datetime-local" value={newChallenge.deadline} onChange={e => setNewChallenge(p => ({...p, deadline: e.target.value}))}
                      className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Difficulty</label>
                    <select value={newChallenge.difficulty} onChange={e => setNewChallenge(p => ({...p, difficulty: e.target.value}))}
                      className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary">
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Tags (comma-separated)</label>
                  <input value={newChallenge.tags} onChange={e => setNewChallenge(p => ({...p, tags: e.target.value}))}
                    className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary" placeholder="react, css, animation" />
                </div>
              </div>
              <div className="flex justify-end gap-3 p-6 border-t border-border">
                <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
                <button onClick={handleCreate} disabled={creating || !newChallenge.title.trim() || !newChallenge.deadline}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">
                  {creating ? 'Creating...' : 'Create Challenge'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
