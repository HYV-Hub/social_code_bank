import React, { useState } from 'react';
import { X, Users, AlertCircle } from 'lucide-react';

const CreateCompanyHiveModal = ({ onClose, onSubmit, companyId }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    visibility: 'company_only', // Company hives are always company-only
    managers: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!formData?.name?.trim()) {
      setError('Hive name is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onSubmit({
        ...formData,
        company_id: companyId
      });
      onClose();
    } catch (err) {
      setError(err?.message || 'Failed to create hive');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e?.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Create Company Hive</h2>
            <p className="text-sm text-gray-600 mt-1">Set up a new collaborative workspace for your company</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Hive Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hive Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData?.name}
              onChange={handleChange}
              placeholder="e.g., Frontend Team, Backend Squad"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData?.description}
              onChange={handleChange}
              placeholder="Describe the purpose and goals of this hive..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-1">Company Hive Visibility</p>
                <p>This hive will be visible only to members of your company. You can add managers after creation who will help manage members and content.</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Hive'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCompanyHiveModal;