import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { hiveService } from '../../services/hiveService';
import AppShell from '../../components/AppShell';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';

export default function HiveCreationWizard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    privacy: 'public',
    tags: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e?.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!formData?.name?.trim()) {
      setError('Hive name is required');
      return;
    }

    if (!formData?.privacy) {
      setError('Privacy setting is required');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const tagsArray = formData?.tags?.split(',')?.map(t => t?.trim())?.filter(t => t?.length > 0);

      const hive = await hiveService?.createHive({
        name: formData?.name,
        description: formData?.description,
        privacy: formData?.privacy,
        tags: tagsArray
      });

      // Navigate to the newly created hive using dynamic route
      navigate(`/hives/${hive?.id}`);
    } catch (err) {
      console.error('Error creating hive:', err);
      setError(err?.message || 'Failed to create hive');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <AppShell pageTitle="Create Hive">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Icon name="Lock" size={64} className="mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Sign in required</h2>
            <p className="text-muted-foreground mb-6">You need to be signed in to create a hive</p>
            <Button onClick={() => navigate('/login')}>Sign In</Button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell pageTitle="Create Hive">
      <div className="max-w-3xl mx-auto">
        <div className="bg-card rounded-lg shadow-xl p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Create a New Hive</h1>
            <p className="text-muted-foreground">
              Set up your hive to collaborate with developers worldwide
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Hive Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                Hive Name *
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData?.name}
                onChange={handleInputChange}
                placeholder="e.g., React Developers"
                required
                className="w-full"
              />
              <p className="mt-1 text-sm text-muted-foreground">
                Choose a clear, descriptive name for your hive
              </p>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData?.description}
                onChange={handleInputChange}
                rows={4}
                placeholder="Describe the purpose of your hive..."
                className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-blue-500"
              />
              <p className="mt-1 text-sm text-muted-foreground">
                Help others understand what your hive is about
              </p>
            </div>

            {/* Privacy */}
            <div>
              <label htmlFor="privacy" className="block text-sm font-medium text-foreground mb-2">
                Privacy *
              </label>
              <Select
                id="privacy"
                name="privacy"
                value={formData?.privacy}
                onChange={handleInputChange}
                className="w-full"
              >
                <option value="public">Public - Anyone can join</option>
                <option value="private">Private - Requires approval to join</option>
              </Select>
              <div className="mt-2 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                <p className="text-sm text-foreground">
                  {formData?.privacy === 'public' ?'🌍 Public hives are discoverable and anyone can join instantly' :'🔒 Private hives require owner/admin approval for new members'}
                </p>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-foreground mb-2">
                Tags
              </label>
              <Input
                id="tags"
                name="tags"
                type="text"
                value={formData?.tags}
                onChange={handleInputChange}
                placeholder="react, javascript, frontend (comma-separated)"
                className="w-full"
              />
              <p className="mt-1 text-sm text-muted-foreground">
                Add tags to help others discover your hive (separate with commas)
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-error/10 border border-error/20 rounded-lg flex items-start gap-3">
                <Icon name="AlertCircle" size={20} className="text-error flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-900">Error creating hive</p>
                  <p className="text-sm text-error mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate('/hives')}
                disabled={loading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Creating...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Icon name="Plus" size={20} />
                    <span>Create Hive</span>
                  </div>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AppShell>
  );
}