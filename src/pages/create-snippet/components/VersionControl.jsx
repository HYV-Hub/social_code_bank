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
    <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Icon name="GitBranch" size={20} className="text-slate-600" />
        <h2 className="text-lg font-semibold text-slate-800">Version Control</h2>
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
          <h3 className="text-sm font-medium text-slate-700 mb-3">Version History</h3>
          <div className="space-y-3">
            {versions?.map((version) => (
              <div
                key={version?.id}
                className="p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-700 rounded">
                      {version?.version}
                    </span>
                    <span className="text-xs text-slate-500">{formatDate(version?.date)}</span>
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
                
                <p className="text-sm text-slate-700 mb-2">{version?.message}</p>
                
                <div className="flex items-center gap-3 text-xs text-slate-500">
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