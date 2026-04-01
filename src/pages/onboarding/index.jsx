import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Icon from '../../components/AppIcon';
import PageShell from '../../components/PageShell';

const OnboardingPage = () => {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    skills: [],
    skillInput: '',
    interests: [],
    interestInput: '',
    preferredLanguages: [],
    languageInput: '',
    github_url: '',
    linkedin_url: '',
    website_url: '',
    notification_email: true,
    notification_push: true,
    notification_snippet_likes: true,
    notification_comments: true,
    notification_team_invites: true
  });

  const steps = [
    { id: 1, name: 'Profile', icon: 'User' },
    { id: 2, name: 'Skills', icon: 'Code' },
    { id: 3, name: 'Preferences', icon: 'Settings' },
    { id: 4, name: 'Complete', icon: 'CheckCircle' }
  ];

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e?.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddItem = (field, inputField) => {
    const value = formData?.[inputField]?.trim();
    if (value && !formData?.[field]?.includes(value)) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev?.[field], value],
        [inputField]: ''
      }));
    }
  };

  const handleRemoveItem = (field, item) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev?.[field]?.filter(i => i !== item)
    }));
  };

  const handleNext = async () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    } else {
      await handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    setError('');

    try {
      // Update user profile
      const { error: profileError } = await supabase?.from('user_profiles')?.update({
          username: formData?.username,
          bio: formData?.bio,
          skills: formData?.skills,
          interests: formData?.interests,
          preferred_languages: formData?.preferredLanguages,
          github_url: formData?.github_url,
          linkedin_url: formData?.linkedin_url,
          website_url: formData?.website_url,
          onboarding_completed: true
        })?.eq('id', user?.id);

      if (profileError) throw profileError;

      // Update notification preferences
      const { error: prefsError } = await supabase?.from('notification_preferences')?.upsert({
          user_id: user?.id,
          email_notifications: formData?.notification_email,
          push_notifications: formData?.notification_push,
          snippet_likes: formData?.notification_snippet_likes,
          comments: formData?.notification_comments,
          team_invites: formData?.notification_team_invites
        });

      if (prefsError) throw prefsError;

      // Update auth context
      await updateProfile({
        username: formData?.username,
        onboarding_completed: true
      });

      // Navigate to dashboard
      navigate('/user-dashboard');
    } catch (err) {
      console.error('Onboarding error:', err);
      setError(err?.message || 'Failed to complete onboarding');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Welcome to HyvHub!</h2>
              <p className="text-muted-foreground">Let's set up your profile to get started</p>
            </div>
            <div className="space-y-4">
              <Input
                label="Username *"
                name="username"
                value={formData?.username}
                onChange={handleInputChange}
                placeholder="Choose a unique username"
                required
              />

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={formData?.bio}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <Input
                label="GitHub URL"
                name="github_url"
                value={formData?.github_url}
                onChange={handleInputChange}
                placeholder="https://github.com/username"
              />

              <Input
                label="LinkedIn URL"
                name="linkedin_url"
                value={formData?.linkedin_url}
                onChange={handleInputChange}
                placeholder="https://linkedin.com/in/username"
              />

              <Input
                label="Website URL"
                name="website_url"
                value={formData?.website_url}
                onChange={handleInputChange}
                placeholder="https://yourwebsite.com"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Your Skills & Interests</h2>
              <p className="text-muted-foreground">Help us personalize your experience</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Skills
                </label>
                <div className="flex gap-2 mb-2">
                  <Input
                    name="skillInput"
                    value={formData?.skillInput}
                    onChange={handleInputChange}
                    placeholder="Add a skill"
                    onKeyPress={(e) => e?.key === 'Enter' && (e?.preventDefault(), handleAddItem('skills', 'skillInput'))}
                  />
                  <Button
                    type="button"
                    onClick={() => handleAddItem('skills', 'skillInput')}
                    iconName="Plus"
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData?.skills?.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-primary/15 text-foreground rounded-full text-sm"
                    >
                      {skill}
                      <button
                        onClick={() => handleRemoveItem('skills', skill)}
                        className="hover:text-foreground"
                      >
                        <Icon name="X" size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Interests
                </label>
                <div className="flex gap-2 mb-2">
                  <Input
                    name="interestInput"
                    value={formData?.interestInput}
                    onChange={handleInputChange}
                    placeholder="Add an interest"
                    onKeyPress={(e) => e?.key === 'Enter' && (e?.preventDefault(), handleAddItem('interests', 'interestInput'))}
                  />
                  <Button
                    type="button"
                    onClick={() => handleAddItem('interests', 'interestInput')}
                    iconName="Plus"
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData?.interests?.map((interest, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-success/15 text-success rounded-full text-sm"
                    >
                      {interest}
                      <button
                        onClick={() => handleRemoveItem('interests', interest)}
                        className="hover:text-green-900"
                      >
                        <Icon name="X" size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Preferred Programming Languages
                </label>
                <div className="flex gap-2 mb-2">
                  <Input
                    name="languageInput"
                    value={formData?.languageInput}
                    onChange={handleInputChange}
                    placeholder="Add a language"
                    onKeyPress={(e) => e?.key === 'Enter' && (e?.preventDefault(), handleAddItem('preferredLanguages', 'languageInput'))}
                  />
                  <Button
                    type="button"
                    onClick={() => handleAddItem('preferredLanguages', 'languageInput')}
                    iconName="Plus"
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData?.preferredLanguages?.map((lang, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                    >
                      {lang}
                      <button
                        onClick={() => handleRemoveItem('preferredLanguages', lang)}
                        className="hover:text-purple-900"
                      >
                        <Icon name="X" size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Notification Preferences</h2>
              <p className="text-muted-foreground">Choose how you want to be notified</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-background rounded-lg">
                <div>
                  <h3 className="font-medium text-foreground">Email Notifications</h3>
                  <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                </div>
                <input
                  type="checkbox"
                  name="notification_email"
                  checked={formData?.notification_email}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-primary rounded focus:ring-ring"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-background rounded-lg">
                <div>
                  <h3 className="font-medium text-foreground">Push Notifications</h3>
                  <p className="text-sm text-muted-foreground">Receive push notifications in browser</p>
                </div>
                <input
                  type="checkbox"
                  name="notification_push"
                  checked={formData?.notification_push}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-primary rounded focus:ring-ring"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-background rounded-lg">
                <div>
                  <h3 className="font-medium text-foreground">Snippet Likes</h3>
                  <p className="text-sm text-muted-foreground">When someone likes your snippets</p>
                </div>
                <input
                  type="checkbox"
                  name="notification_snippet_likes"
                  checked={formData?.notification_snippet_likes}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-primary rounded focus:ring-ring"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-background rounded-lg">
                <div>
                  <h3 className="font-medium text-foreground">Comments</h3>
                  <p className="text-sm text-muted-foreground">When someone comments on your snippets</p>
                </div>
                <input
                  type="checkbox"
                  name="notification_comments"
                  checked={formData?.notification_comments}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-primary rounded focus:ring-ring"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-background rounded-lg">
                <div>
                  <h3 className="font-medium text-foreground">Team Invites</h3>
                  <p className="text-sm text-muted-foreground">When you're invited to join a team</p>
                </div>
                <input
                  type="checkbox"
                  name="notification_team_invites"
                  checked={formData?.notification_team_invites}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-primary rounded focus:ring-ring"
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6 text-center">
            <div className="w-20 h-20 bg-success/15 rounded-full flex items-center justify-center mx-auto">
              <Icon name="CheckCircle" size={48} className="text-success" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">You're All Set!</h2>
              <p className="text-muted-foreground">Your profile is ready. Let's start coding!</p>
            </div>
            <div className="bg-primary/10 rounded-lg p-6 text-left">
              <h3 className="font-semibold text-foreground mb-3">What's Next?</h3>
              <ul className="space-y-2 text-foreground">
                <li className="flex items-start gap-2">
                  <Icon name="CheckCircle" size={20} className="text-primary mt-0.5" />
                  <span>Create your first code snippet</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="CheckCircle" size={20} className="text-primary mt-0.5" />
                  <span>Explore trending snippets from the community</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="CheckCircle" size={20} className="text-primary mt-0.5" />
                  <span>Join teams and collaborate with others</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="CheckCircle" size={20} className="text-primary mt-0.5" />
                  <span>Get AI-powered insights on your code</span>
                </li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <PageShell>
      <div className="max-w-3xl mx-auto">
        {/* Progress Bar */}
        <div className="bg-card rounded-lg shadow-lg p-8 mb-6">
          <div className="flex items-center justify-between mb-8">
            {steps?.map((step, index) => (
              <React.Fragment key={step?.id}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      currentStep >= step?.id
                        ? 'bg-primary text-white' :'bg-muted text-muted-foreground'
                    }`}
                  >
                    <Icon name={step?.icon} size={24} />
                  </div>
                  <span className="text-xs mt-2 text-muted-foreground">{step?.name}</span>
                </div>
                {index < steps?.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      currentStep > step?.id ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-card rounded-lg shadow-lg p-8">
          {error && (
            <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-lg">
              <p className="text-error text-sm">{error}</p>
            </div>
          )}

          {renderStep()}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                iconName="ChevronLeft"
                iconPosition="left"
              >
                Back
              </Button>
            )}
            <div className="ml-auto">
              <Button
                type="button"
                onClick={handleNext}
                disabled={loading || (currentStep === 1 && !formData?.username)}
                iconName={currentStep === 4 ? 'CheckCircle' : 'ChevronRight'}
                iconPosition="right"
              >
                {loading ? 'Processing...' : currentStep === 4 ? 'Get Started' : 'Next'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
};

export default OnboardingPage;