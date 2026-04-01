import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import bugService from '../../../services/bugService';

export default function CreateBugModal({ isOpen, onClose, onSuccess, teamId, companyId, context }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [isBugFix, setIsBugFix] = useState(false);
  
  // FIXED: Properly initialize visibility based on context prop
  const getInitialVisibility = () => {
    if (context === 'global') return 'public';
    if (context === 'company') return 'company';
    if (context === 'team' && teamId) return 'team';
    return 'private';
  };
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    code: '',
    previousCode: '',
    fixedCode: '',
    priority: 'medium',
    visibility: getInitialVisibility(), // CRITICAL: Auto-set visibility from context
    expectedBehavior: '',
    actualBehavior: '',
    assignedTo: null
  });

  // CRITICAL: Update visibility when context changes
  useEffect(() => {
    const newVisibility = getInitialVisibility();
    setFormData(prev => ({ ...prev, visibility: newVisibility }));
    console.log(`🎯 Auto-setting bug visibility to: ${newVisibility} (context: ${context})`);
  }, [context, teamId]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!formData?.title?.trim()) {
      setError('Please enter a bug title');
      return;
    }

    if (!formData?.description?.trim()) {
      setError('Please enter a bug description');
      return;
    }

    if (isBugFix && !formData?.previousCode?.trim()) {
      setError('Please provide the previous code for bug fix');
      return;
    }

    if (isBugFix && !formData?.fixedCode?.trim()) {
      setError('Please provide the fixed code');
      return;
    }

    try {
      setLoading(true);
      setError('');

      await bugService?.createBug({
        title: formData?.title,
        description: formData?.description,
        code: isBugFix ? formData?.fixedCode : formData?.code,
        previousCode: isBugFix ? formData?.previousCode : null,
        fixedCode: isBugFix ? formData?.fixedCode : null,
        isBugFix: isBugFix,
        priority: formData?.priority,
        visibility: formData?.visibility,
        teamId: teamId || null,
        companyId: companyId || null,
        assignedTo: formData?.assignedTo || null
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        code: '',
        previousCode: '',
        fixedCode: '',
        priority: 'medium',
        visibility: context === 'global' ? 'public' : (context === 'company' ? 'company' : (teamId ? 'team' : 'private')),
        expectedBehavior: '',
        actualBehavior: '',
        assignedTo: null
      });
      setStep(1);
      setIsBugFix(false);
      onClose();
      onSuccess?.();
    } catch (err) {
      console.error('Error creating bug:', err);
      setError(err?.message || 'Failed to create bug. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBugTypeSelection = (isFix) => {
    setIsBugFix(isFix);
    setStep(2);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">
            {step === 1 ? 'Report a Bug' : (isBugFix ? 'Submit Bug Fix' : 'Report Bug')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Icon name="X" size={24} />
          </button>
        </div>

        {/* Form */}
        {step === 1 ? (
          <div className="p-6 space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                What would you like to report?
              </h3>
              <p className="text-sm text-slate-600">
                Choose whether you are reporting a new bug or submitting a fix
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Ongoing Bug Option */}
              <button
                onClick={() => handleBugTypeSelection(false)}
                className="p-6 border-2 border-slate-200 rounded-lg hover:border-blue-500 hover:bg-primary/10 transition-all group"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-error/15 rounded-full flex items-center justify-center mb-4 group-hover:bg-red-200 transition-colors">
                    <Icon name="Bug" size={32} className="text-error" />
                  </div>
                  <h4 className="font-semibold text-lg text-slate-800 mb-2">
                    Report Bug
                  </h4>
                  <p className="text-sm text-slate-600">
                    Report a new bug or issue that needs attention
                  </p>
                </div>
              </button>

              {/* Bug Fix Option */}
              <button
                onClick={() => handleBugTypeSelection(true)}
                className="p-6 border-2 border-slate-200 rounded-lg hover:border-green-500 hover:bg-success/10 transition-all group"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-success/15 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                    <Icon name="CheckCircle" size={32} className="text-success" />
                  </div>
                  <h4 className="font-semibold text-lg text-slate-800 mb-2">
                    Submit Bug Fix
                  </h4>
                  <p className="text-sm text-slate-600">
                    Share a fix for an existing bug with before/after code
                  </p>
                </div>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-error/10 border border-error/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Icon name="AlertCircle" size={20} className="text-error flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Back Button */}
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800"
            >
              <Icon name="ArrowLeft" size={16} />
              Change bug type
            </button>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {isBugFix ? 'Bug Fix Title' : 'Bug Title'} *
              </label>
              <Input
                type="text"
                value={formData?.title}
                onChange={(e) => handleChange('title', e?.target?.value)}
                placeholder={isBugFix ? 'e.g., Fixed login validation error' : 'Enter a descriptive title'}
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData?.description}
                onChange={(e) => handleChange('description', e?.target?.value)}
                placeholder={isBugFix ? 'Explain what was broken and how you fixed it' : 'Describe the bug in detail'}
                rows={4}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Bug Fix Specific Fields */}
            {isBugFix && (
              <>
                {/* Previous Code */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Previous Code (Before Fix) *
                  </label>
                  <textarea
                    value={formData?.previousCode}
                    onChange={(e) => handleChange('previousCode', e?.target?.value)}
                    placeholder="Paste the buggy code here"
                    rows={6}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ring font-mono text-sm"
                  />
                </div>

                {/* Fixed Code */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Fixed Code (After Fix) *
                  </label>
                  <textarea
                    value={formData?.fixedCode}
                    onChange={(e) => handleChange('fixedCode', e?.target?.value)}
                    placeholder="Paste the fixed code here"
                    rows={6}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ring font-mono text-sm"
                  />
                </div>

                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Icon name="Info" size={20} className="text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">AI Analysis</h4>
                      <p className="text-sm text-foreground">
                        Our AI will analyze your code changes and provide an explanation of the fix
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Ongoing Bug Code Field */}
            {!isBugFix && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Code Snippet (Optional)
                </label>
                <textarea
                  value={formData?.code}
                  onChange={(e) => handleChange('code', e?.target?.value)}
                  placeholder="Paste relevant code here"
                  rows={6}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ring font-mono text-sm"
                />
              </div>
            )}

            {/* Priority - Changed from grid to single column */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Priority
              </label>
              <select
                value={formData?.priority}
                onChange={(e) => handleChange('priority', e?.target?.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            {/* AI Language Detection Info */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-border rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Icon name="Sparkles" size={20} className="text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-purple-900 mb-1">AI-Powered Analysis</h4>
                  <p className="text-sm text-purple-800">
                    Our AI will automatically detect the programming language, analyze your code, 
                    and highlight relevant tags and bug issues
                  </p>
                </div>
              </div>
            </div>

            {/* Visibility - Context-aware default */}
            {context === 'global' && (
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Icon name="Globe" size={20} className="text-primary" />
                  <div>
                    <span className="text-sm font-medium text-foreground">
                      Posting to Global Feed
                    </span>
                    <p className="text-xs text-muted-foreground mt-1">
                      This {isBugFix ? 'fix' : 'bug'} will be visible to all users
                    </p>
                  </div>
                </div>
              </div>
            )}

            {context === 'company' && (
              <div className="bg-primary/10 border border-border rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Icon name="Building" size={20} className="text-primary" />
                  <div>
                    <span className="text-sm font-medium text-foreground">
                      Posting to Company Board
                    </span>
                    <p className="text-xs text-muted-foreground mt-1">
                      Visible to your company members
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200">
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
                variant="default"
                iconName={isBugFix ? 'CheckCircle' : 'Plus'}
                iconPosition="left"
                disabled={loading}
              >
                {loading ? 'Submitting...' : (isBugFix ? 'Submit Fix' : 'Report Bug')}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}