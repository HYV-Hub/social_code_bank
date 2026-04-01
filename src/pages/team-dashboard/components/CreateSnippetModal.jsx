import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { snippetService } from '../../../services/snippetService';
import { useAuth } from '../../../contexts/AuthContext';

export default function CreateSnippetModal({ isOpen, onClose, teamId, onSuccess }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    code: '',
    language: 'javascript',
    visibility: 'team',
    snippetType: 'code'
  });

  const languageOptions = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
    { value: 'csharp', label: 'C#' },
    { value: 'ruby', label: 'Ruby' },
    { value: 'go', label: 'Go' },
    { value: 'rust', label: 'Rust' },
    { value: 'php', label: 'PHP' },
    { value: 'sql', label: 'SQL' }
  ];

  const snippetTypeOptions = [
    { value: 'code', label: 'Code Snippet' },
    { value: 'function', label: 'Function' },
    { value: 'class', label: 'Class' },
    { value: 'algorithm', label: 'Algorithm' },
    { value: 'config', label: 'Configuration' },
    { value: 'query', label: 'Query' }
  ];

  const visibilityOptions = [
    { value: 'team', label: 'Team Only' },
    { value: 'public', label: 'Public' },
    { value: 'private', label: 'Private' }
  ];

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!formData?.title?.trim()) {
      setError('Please enter a title');
      return;
    }

    if (!formData?.code?.trim()) {
      setError('Please enter code');
      return;
    }

    try {
      setLoading(true);
      setError('');

      await snippetService?.createSnippet({
        title: formData?.title,
        description: formData?.description,
        code: formData?.code,
        language: formData?.language,
        snippetType: formData?.snippetType,
        visibility: formData?.visibility,
        teamId: teamId
      });

      setFormData({
        title: '',
        description: '',
        code: '',
        language: 'javascript',
        visibility: 'team',
        snippetType: 'code'
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Error creating snippet:', err);
      setError(err?.message || 'Failed to create snippet. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Add Snippet to Team Feed</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-error/10 border border-error/20 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Icon name="AlertCircle" size={20} className="text-error" />
                <p className="text-sm text-error">{error}</p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Title *
            </label>
            <Input
              value={formData?.title}
              onChange={(e) => handleChange('title', e?.target?.value)}
              placeholder="e.g., React Custom Hook for Data Fetching"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Description
            </label>
            <textarea
              value={formData?.description}
              onChange={(e) => handleChange('description', e?.target?.value)}
              placeholder="Describe what this snippet does..."
              rows="3"
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Language *
              </label>
              <Select
                value={formData?.language}
                onChange={(value) => handleChange('language', value)}
                options={languageOptions}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Type
              </label>
              <Select
                value={formData?.snippetType}
                onChange={(value) => handleChange('snippetType', value)}
                options={snippetTypeOptions}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Visibility
              </label>
              <Select
                value={formData?.visibility}
                onChange={(value) => handleChange('visibility', value)}
                options={visibilityOptions}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Code *
            </label>
            <textarea
              value={formData?.code}
              onChange={(e) => handleChange('code', e?.target?.value)}
              placeholder="Paste your code here..."
              rows="12"
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm resize-none"
              required
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate('/create-snippet')}
              iconName="ExternalLink"
            >
              Full Editor
            </Button>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                iconName={loading ? undefined : "Plus"}
              >
                {loading ? 'Creating...' : 'Create Snippet'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}