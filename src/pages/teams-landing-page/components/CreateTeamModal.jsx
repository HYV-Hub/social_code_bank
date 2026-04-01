import React, { useState, useEffect } from 'react';
import { companyDashboardService } from '../../../services/companyDashboardService';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

export default function CreateTeamModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    companyId: ''
  });
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadCompanies();
    }
  }, [isOpen]);

  const loadCompanies = async () => {
    try {
      setLoadingCompanies(true);
      const data = await companyDashboardService?.getUserCompanies();
      setCompanies(data || []);
    } catch (err) {
      console.error('Error loading companies:', err);
    } finally {
      setLoadingCompanies(false);
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError('');

    if (!formData?.name?.trim()) {
      setError('Team name is required');
      return;
    }

    try {
      setLoading(true);
      await onSubmit({
        name: formData?.name?.trim(),
        description: formData?.description?.trim() || null,
        companyId: formData?.companyId || null
      });
      // Reset form
      setFormData({ name: '', description: '', companyId: '' });
      onClose();
    } catch (err) {
      setError(err?.message || 'Failed to create team');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/15">
                <Icon name="Users" size={24} className="text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Create New Team</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              disabled={loading}
            >
              <Icon name="X" size={20} className="text-muted-foreground" />
            </button>
          </div>
          <p className="text-sm text-muted-foreground">
            Set up a new team to collaborate with your colleagues
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Error Message */}
          {error && (
            <div className="p-4 bg-error/10 border border-error/20 rounded-lg flex items-start gap-3">
              <Icon name="AlertCircle" size={20} className="text-error flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-900">Error</p>
                <p className="text-sm text-error mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Team Name */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Team Name <span className="text-error">*</span>
            </label>
            <Input
              type="text"
              value={formData?.name}
              onChange={(e) => handleChange('name', e?.target?.value)}
              placeholder="e.g., Frontend Development Team"
              className="w-full"
              disabled={loading}
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              Choose a descriptive name for your team
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Description <span className="text-muted-foreground">(Optional)</span>
            </label>
            <textarea
              value={formData?.description}
              onChange={(e) => handleChange('description', e?.target?.value)}
              placeholder="What does this team work on?"
              rows={3}
              className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-blue-500 transition-colors resize-none"
              disabled={loading}
            />
          </div>

          {/* Company Selection */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Company <span className="text-muted-foreground">(Optional)</span>
            </label>
            {loadingCompanies ? (
              <div className="h-12 bg-muted rounded-lg animate-pulse" />
            ) : companies?.length > 0 ? (
              <Select
                value={formData?.companyId}
                onChange={(e) => handleChange('companyId', e?.target?.value)}
                className="w-full"
                disabled={loading}
              >
                <option value="">No Company</option>
                {companies?.map((company) => (
                  <option key={company?.id} value={company?.id}>
                    {company?.name}
                  </option>
                ))}
              </Select>
            ) : (
              <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                <p className="text-sm text-foreground">
                  No companies available. You can create a team without a company.
                </p>
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Associate this team with a company for better organization
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData?.name?.trim()}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  <span>Creating...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Icon name="Plus" size={20} />
                  <span>Create Team</span>
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}