import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '../../contexts/AuthContext';
import { profileService } from '../../services/profileService';
import AppShell from '../../components/AppShell';
import { User, Mail, AtSign, FileText, Upload, Loader2, Check, X, Camera } from 'lucide-react';

export default function ProfileEditor() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    bio: ''
  });

  // UI state
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  // Load profile data on mount
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadProfile();
  }, [user, navigate]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const profile = await profileService?.getCurrentProfile();
      
      setFormData({
        fullName: profile?.fullName || '',
        username: profile?.username || '',
        email: profile?.email || '',
        bio: profile?.bio || ''
      });

      // Load avatar URL if exists
      if (profile?.avatarUrl) {
        const url = await profileService?.getAvatarUrl(profile?.avatarUrl);
        setAvatarUrl(url);
      }
    } catch (err) {
      setError(err?.message || 'Failed to load profile');
      console.error('Profile load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e?.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setHasChanges(true);
    setFieldErrors(prev => ({ ...prev, [name]: '' }));
    setError('');
    setSuccessMessage('');
  };

  const handleAvatarClick = () => {
    fileInputRef?.current?.click();
  };

  const handleAvatarChange = (e) => {
    const file = e?.target?.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes?.includes(file?.type)) {
      setError('Please upload a JPEG, PNG, WebP, or GIF image');
      return;
    }

    // Validate file size (2MB)
    if (file?.size > 2097152) {
      setError('Image size must be less than 2MB');
      return;
    }

    setAvatarFile(file);
    setHasChanges(true);
    setError('');

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader?.result);
    };
    reader?.readAsDataURL(file);
  };

  const validateForm = () => {
    const errors = {};

    if (!formData?.fullName?.trim()) {
      errors.fullName = 'Full name is required';
    }

    if (!formData?.username?.trim()) {
      errors.username = 'Username is required';
    } else if (formData?.username?.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/?.test(formData?.username)) {
      errors.username = 'Username can only contain letters, numbers, and underscores';
    }

    if (formData?.bio && formData?.bio?.length > 500) {
      errors.bio = 'Bio must be less than 500 characters';
    }

    setFieldErrors(errors);
    return Object.keys(errors)?.length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!validateForm()) {
      setError('Please fix the errors before saving');
      return;
    }

    setSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      let newAvatarUrl = null;

      // Upload avatar if changed
      if (avatarFile) {
        setUploading(true);
        const filePath = await profileService?.uploadAvatar(avatarFile, user?.id);
        newAvatarUrl = filePath;
        setUploading(false);
      }

      // Update profile
      const updateData = {
        fullName: formData?.fullName?.trim(),
        username: formData?.username?.trim(),
        bio: formData?.bio?.trim()
      };

      if (newAvatarUrl) {
        updateData.avatarUrl = newAvatarUrl;
      }

      await profileService?.updateProfile(updateData);

      // Reload avatar URL if changed
      if (newAvatarUrl) {
        const url = await profileService?.getAvatarUrl(newAvatarUrl);
        setAvatarUrl(url);
        setAvatarPreview(null);
        setAvatarFile(null);
      }

      setSuccessMessage('Profile updated successfully!');
      setHasChanges(false);

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/user-profile');
      }, 2000);

    } catch (err) {
      setError(err?.message || 'Failed to update profile');
      console.error('Profile update error:', err);
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        navigate('/user-profile');
      }
    } else {
      navigate('/user-profile');
    }
  };

  if (loading) {
    return (
      <AppShell pageTitle="Edit Profile">
        <Helmet>
          <title>Loading Profile - HYVhub</title>
        </Helmet>
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell pageTitle="Edit Profile">
      <Helmet>
        <title>Edit Profile - HYVhub</title>
        <meta name="description" content="Edit your profile information and settings" />
      </Helmet>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Edit Profile</h1>
          <p className="mt-2 text-muted-foreground">Update your personal information and profile settings</p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-lg flex items-start gap-3">
            <X className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-error font-medium">Error</p>
              <p className="text-error text-sm">{error}</p>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-success/10 border border-success/20 rounded-lg flex items-start gap-3">
            <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-success font-medium">Success</p>
              <p className="text-success text-sm">{successMessage}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Profile Picture Section */}
          <div className="bg-card rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Profile Picture</h2>
            
            <div className="flex items-center gap-6">
              <div className="relative">
                <div 
                  className="w-32 h-32 rounded-full overflow-hidden bg-muted border-4 border-white shadow-lg cursor-pointer group"
                  onClick={handleAvatarClick}
                >
                  {avatarPreview || avatarUrl ? (
                    <img 
                      src={avatarPreview || avatarUrl} 
                      alt="Profile avatar" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
                      <User className="w-16 h-16 text-white" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                </div>
                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-card bg-opacity-75 rounded-full">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                )}
              </div>

              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={handleAvatarClick}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  Upload New Photo
                </button>
                <p className="mt-2 text-sm text-muted-foreground">
                  JPG, PNG, WebP or GIF. Max size 2MB.
                </p>
                {avatarFile && (
                  <p className="mt-1 text-sm text-success">
                    ✓ New photo selected: {avatarFile?.name}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Basic Information Section */}
          <div className="bg-card rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Basic Information</h2>

            <div className="space-y-4">
              {/* Full Name */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-foreground mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData?.fullName}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent ${
                      fieldErrors?.fullName ? 'border-error' : 'border-border'
                    }`}
                    placeholder="Enter your full name"
                  />
                </div>
                {fieldErrors?.fullName && (
                  <p className="mt-1 text-sm text-error">{fieldErrors?.fullName}</p>
                )}
              </div>

              {/* Username */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-foreground mb-1">
                  Username *
                </label>
                <div className="relative">
                  <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData?.username}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent ${
                      fieldErrors?.username ? 'border-error' : 'border-border'
                    }`}
                    placeholder="Choose a username"
                  />
                </div>
                {fieldErrors?.username && (
                  <p className="mt-1 text-sm text-error">{fieldErrors?.username}</p>
                )}
              </div>

              {/* Email (Read-only) */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData?.email}
                    disabled
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-muted-foreground cursor-not-allowed"
                  />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">Email cannot be changed</p>
              </div>

              {/* Bio */}
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-foreground mb-1">
                  Bio
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData?.bio}
                    onChange={handleInputChange}
                    rows={4}
                    maxLength={500}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent resize-none ${
                      fieldErrors?.bio ? 'border-error' : 'border-border'
                    }`}
                    placeholder="Tell us about yourself..."
                  />
                </div>
                <div className="flex justify-between items-center mt-1">
                  {fieldErrors?.bio && (
                    <p className="text-sm text-error">{fieldErrors?.bio}</p>
                  )}
                  <p className="text-sm text-muted-foreground ml-auto">
                    {formData?.bio?.length}/500 characters
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving || !hasChanges}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="px-6 py-3 border border-border text-foreground rounded-lg hover:bg-background transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>

          {/* Change Indicator */}
          {hasChanges && !saving && (
            <p className="mt-4 text-center text-sm text-amber-600">
              You have unsaved changes
            </p>
          )}
        </form>
    </AppShell>
  );
}