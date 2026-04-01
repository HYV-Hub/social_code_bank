import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

const VersionControl = ({ commitMessage, setCommitMessage }) => {
  const [versions, setVersions] = useState([
    {
      id: 1,
      version: 'v1.0',
      message: 'Initial version',
      date: new Date(Date.now() - 86400000 * 7),
      author: 'You',
      changes: '+45 -12'
    },
    {
      id: 2,
      version: 'v1.1',
      message: 'Added error handling',
      date: new Date(Date.now() - 86400000 * 3),
      author: 'You',
      changes: '+23 -5'
    }
  ]);

  const formatDate = (date) => {
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Icon name="GitBranch" size={20} className="text-muted-foreground" />
        <h2 className="text-lg font-semibold text-foreground">Version Control</h2>
      </div>
      <div className="mb-6">
        <Input
          label="Commit Message"
          type="text"
          placeholder="Describe your changes..."
          value={commitMessage}
          onChange={(e) => setCommitMessage(e?.target?.value)}
          description="Add a brief description of what changed in this version"
        />
      </div>
      {versions?.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Version History</h3>
          <div className="space-y-3">
            {versions?.map((version) => (
              <div
                key={version?.id}
                className="p-4 bg-muted rounded-lg border border-border hover:border-border transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 text-xs font-semibold bg-primary/15 text-primary rounded">
                      {version?.version}
                    </span>
                    <span className="text-xs text-muted-foreground">{formatDate(version?.date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" iconName="Eye">
                      View
                    </Button>
                    <Button variant="ghost" size="sm" iconName="RotateCcw">
                      Restore
                    </Button>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-2">{version?.message}</p>
                
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Icon name="User" size={12} />
                    {version?.author}
                  </span>
                  <span className="flex items-center gap-1">
                    <Icon name="GitCommit" size={12} />
                    {version?.changes}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VersionControl;