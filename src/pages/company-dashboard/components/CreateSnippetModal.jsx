import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../components/AuthContext';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import { snippetService } from '../../../services/snippetService';
import { companyDashboardService } from '../../../services/companyDashboardService';

const CreateSnippetModal = ({ isOpen, onClose, companyId }) => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  
  // Form state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Teams state
  const [teams, setTeams] = useState([]);
  const [loadingTeams, setLoadingTeams] = useState(true);
  
  // Form data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    code: '',
    language: 'javascript',
    snippetType: 'code',
    visibility: 'company',
    teamId: ''
  });

  // Load company teams
  useEffect(() => {
    const loadTeams = async () => {
      if (!companyId || !isOpen) return;
      
      try {
        setLoadingTeams(true);
        const teamsData = await companyDashboardService?.getCompanyTeams(companyId);
        setTeams(teamsData || []);
      } catch (err) {
        console.error('Error loading teams:', err);
      } finally {
        setLoadingTeams(false);
      }
    };

    loadTeams();
  }, [companyId, isOpen]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        title: '',
        description: '',
        code: '',
        language: 'javascript',
        snippetType: 'code',
        visibility: 'company',
        teamId: ''
      });
      setError('');
      setSuccess(false);
    }
  }, [isOpen]);

  // Handle input changes
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    // Validation
    if (!formData?.title?.trim()) {
      setError('Title is required');
      return;
    }
    
    if (!formData?.code?.trim()) {
      setError('Code is required');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Create snippet with company and optional team routing
      const snippetData = {
        title: formData?.title?.trim(),
        description: formData?.description?.trim() || '',
        code: formData?.code?.trim(),
        language: formData?.language,
        snippetType: formData?.snippetType,
        visibility: formData?.visibility,
        companyId: companyId,
        teamId: formData?.teamId || null
      };

      const result = await snippetService?.createSnippet(snippetData);

      setSuccess(true);
      
      // Show success message and redirect after delay
      setTimeout(() => {
        onClose();
        // Navigate to snippet details
        navigate(`/snippet-details?id=${result?.id}`);
      }, 1500);
    } catch (err) {
      console.error('Error creating snippet:', err);
      setError(err?.message || 'Failed to create snippet');
    } finally {
      setLoading(false);
    }
  };

  // Navigate to full create snippet page
  const handleGoToFullEditor = () => {
    onClose();
    navigate('/create-snippet', { 
      state: { 
        companyId: companyId,
        defaultVisibility: 'company'
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Add Snippet to Company</h2>
            <p className="text-sm text-gray-600 mt-1">Quick snippet creation for your company</p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Icon name="X" size={24} />
          </button>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mx-6 mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Icon name="CheckCircle" className="text-green-600" size={24} />
              <div>
                <p className="text-green-900 font-semibold">Snippet created successfully!</p>
                <p className="text-green-700 text-sm">Redirecting to snippet details...</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Icon name="AlertCircle" className="text-red-600" size={24} />
              <div className="flex-1">
                <p className="text-red-900 font-semibold">Error</p>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData?.title}
              onChange={(e) => handleChange('title', e?.target?.value)}
              placeholder="Enter snippet title"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading || success}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData?.description}
              onChange={(e) => handleChange('description', e?.target?.value)}
              placeholder="Brief description of the snippet"
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading || success}
            />
          </div>

          {/* Language & Type Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Language *
              </label>
              <select
                value={formData?.language}
                onChange={(e) => handleChange('language', e?.target?.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading || success}
              >
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
                <option value="go">Go</option>
                <option value="rust">Rust</option>
                <option value="php">PHP</option>
                <option value="ruby">Ruby</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type *
              </label>
              <select
                value={formData?.snippetType}
                onChange={(e) => handleChange('snippetType', e?.target?.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading || success}
              >
                <option value="code">Code</option>
                <option value="function">Function</option>
                <option value="class">Class</option>
                <option value="algorithm">Algorithm</option>
                <option value="config">Config</option>
                <option value="query">Query</option>
              </select>
            </div>
          </div>

          {/* Team Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assign to Team (Optional)
            </label>
            {loadingTeams ? (
              <div className="flex items-center gap-2 text-gray-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm">Loading teams...</span>
              </div>
            ) : teams?.length > 0 ? (
              <select
                value={formData?.teamId}
                onChange={(e) => handleChange('teamId', e?.target?.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading || success}
              >
                <option value="">No specific team (Company-wide)</option>
                {teams?.map(team => (
                  <option key={team?.id} value={team?.id}>
                    {team?.name}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-sm text-gray-500">No teams available</p>
            )}
          </div>

          {/* Code Editor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Code *
            </label>
            <textarea
              value={formData?.code}
              onChange={(e) => handleChange('code', e?.target?.value)}
              placeholder="Paste your code here..."
              rows={8}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
              disabled={loading || success}
              required
            />
          </div>

          {/* Visibility Note */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Icon name="Info" className="text-blue-600 mt-0.5" size={20} />
              <div className="flex-1 text-sm">
                <p className="text-blue-900 font-semibold mb-1">Visibility: Company Only</p>
                <p className="text-blue-700">
                  This snippet will be visible only to members of your company
                  {formData?.teamId && teams?.find(t => t?.id === formData?.teamId) 
                    ? ` and specifically assigned to the "${teams?.find(t => t?.id === formData?.teamId)?.name}" team`
                    : ''
                  }.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-4 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleGoToFullEditor}
              disabled={loading || success}
              iconName="ExternalLink"
            >
              Open Full Editor
            </Button>
            
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading || success}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || success}
                iconName={loading ? "Loader" : "Plus"}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {loading ? 'Creating...' : 'Create Snippet'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSnippetModal;