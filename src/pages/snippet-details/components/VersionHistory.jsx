import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { snippetVersionService } from '../../../services/snippetVersionService';

export default function VersionHistory({ snippetId, currentVersion }) {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [expandedVersions, setExpandedVersions] = useState(new Set());
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (snippetId) {
      loadVersionHistory();
      loadStats();
    }
  }, [snippetId]);

  const loadVersionHistory = async () => {
    try {
      setLoading(true);
      setError('');
      
      const data = await snippetVersionService?.getVersionHistory(snippetId);
      setVersions(data || []);
    } catch (err) {
      console.error('Error loading version history:', err);
      setError(err?.message || 'Failed to load version history');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await snippetVersionService?.getVersionStats(snippetId);
      setStats(statsData);
    } catch (err) {
      console.error('Error loading version stats:', err);
    }
  };

  const toggleVersionExpansion = (versionId) => {
    const newExpanded = new Set(expandedVersions);
    if (newExpanded?.has(versionId)) {
      newExpanded?.delete(versionId);
    } else {
      newExpanded?.add(versionId);
    }
    setExpandedVersions(newExpanded);
  };

  const renderDiffLine = (line, index) => {
    const bgColor = 
      line?.type === 'added' ? 'bg-success/10 border-l-4 border-green-500' :
      line?.type === 'removed'? 'bg-error/10 border-l-4 border-error' : 'bg-background';

    const textColor =
      line?.type === 'added' ? 'text-green-900' :
      line?.type === 'removed'? 'text-red-900' : 'text-foreground';

    const icon =
      line?.type === 'added' ? <Icon name="Plus" size={14} className="text-success" /> :
      line?.type === 'removed' ? <Icon name="Minus" size={14} className="text-error" /> :
      null;

    return (
      <div 
        key={index} 
        className={`${bgColor} px-4 py-1 font-mono text-sm ${textColor} flex items-start gap-2`}
      >
        <span className="flex-shrink-0 w-4">{icon}</span>
        <span className="flex-1 break-all">{line?.content}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-border border-t-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <Icon name="AlertCircle" size={48} className="mx-auto text-error mb-4" />
        <p className="text-error font-medium">{error}</p>
        <Button onClick={loadVersionHistory} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  if (versions?.length === 0) {
    return (
      <div className="text-center py-12">
        <Icon name="GitBranch" size={64} className="mx-auto text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold text-foreground mb-2">No Version History</h3>
        <p className="text-muted-foreground">
          This snippet has no previous versions yet. Version history will appear here when you make edits.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      {stats && (
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-border">
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Icon name="BarChart" size={20} className="text-primary" />
            Version Statistics
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{stats?.totalVersions}</p>
              <p className="text-sm text-muted-foreground mt-1">Total Versions</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-secondary">{stats?.latestVersion}</p>
              <p className="text-sm text-muted-foreground mt-1">Current Version</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{stats?.contributors}</p>
              <p className="text-sm text-muted-foreground mt-1">Contributors</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Last Modified</p>
              <p className="text-sm font-semibold text-foreground mt-1">
                {new Date(stats?.lastModified)?.toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Version Timeline */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Icon name="History" size={20} className="text-secondary" />
          Version History ({versions?.length} versions)
        </h3>

        {versions?.map((version, idx) => {
          const isExpanded = expandedVersions?.has(version?.id);
          const parsedDiff = isExpanded ? snippetVersionService?.parseDiff(version?.codeDiff) : [];
          const isLatest = idx === 0;

          return (
            <div
              key={version?.id}
              className={`border-2 rounded-xl overflow-hidden transition-all ${
                isLatest ? 'border-border bg-primary/10' : 'border-border bg-card'
              } ${isExpanded ? 'shadow-xl' : 'shadow-md hover:shadow-lg'}`}
            >
              {/* Version Header */}
              <div 
                className="p-5 cursor-pointer"
                onClick={() => toggleVersionExpansion(version?.id)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 text-sm font-bold rounded-full ${
                        isLatest ? 'bg-primary text-white' : 'bg-muted text-foreground'
                      }`}>
                        v{version?.versionNumber}
                      </span>
                      {isLatest && (
                        <span className="px-3 py-1 text-xs font-semibold bg-success/15 text-success rounded-full">
                          Current Version
                        </span>
                      )}
                    </div>
                    
                    {version?.changeDescription && (
                      <p className="text-foreground font-medium mb-2">
                        {version?.changeDescription}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-2">
                        <Icon name="User" size={14} />
                        {version?.changedBy?.username}
                      </span>
                      <span className="flex items-center gap-2">
                        <Icon name="Clock" size={14} />
                        {new Date(version?.createdAt)?.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-2 text-success">
                        <Icon name="Plus" size={14} />
                        {version?.stats?.linesAdded} added
                      </span>
                      <span className="flex items-center gap-2 text-error">
                        <Icon name="Minus" size={14} />
                        {version?.stats?.linesRemoved} removed
                      </span>
                    </div>
                  </div>

                  <Icon 
                    name={isExpanded ? 'ChevronUp' : 'ChevronDown'} 
                    size={24} 
                    className="text-muted-foreground flex-shrink-0"
                  />
                </div>
              </div>

              {/* Expanded Diff View */}
              {isExpanded && (
                <div className="border-t border-border">
                  <div className="bg-card text-white px-4 py-2 text-sm font-mono flex items-center justify-between">
                    <span>Code Changes (Diff View)</span>
                    <span className="text-muted-foreground">
                      {version?.stats?.totalChanges} total changes
                    </span>
                  </div>
                  <div className="max-h-96 overflow-y-auto bg-card">
                    {parsedDiff?.map((line, lineIdx) => renderDiffLine(line, lineIdx))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}