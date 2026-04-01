import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../components/AuthContext';
import { supabase } from '../../lib/supabase';
import AppNavigation from '../../components/AppNavigation';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import AppIcon from '../../components/AppIcon';

const CompanyCreationPage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [checkingExistingCompany, setCheckingExistingCompany] = useState(true);
  const [userHasCompany, setUserHasCompany] = useState(false);
  const hasCheckedRef = useRef(false);
  const isRedirectingRef = useRef(false);

  const [formData, setFormData] = useState({
    name: '',
    website: '',
    description: '',
    invite_emails: ''
  });

  // CRITICAL FIX: Check if user already has a company using AuthContext profile
  useEffect(() => {
    // Wait for auth to fully load
    if (authLoading) {
      console.log('Auth still loading, waiting...');
      return;
    }

    // Only run this check once per page load
    if (hasCheckedRef?.current || isRedirectingRef?.current) {
      return;
    }

    const checkExistingCompany = async () => {
      // Check authentication AFTER auth has loaded
      if (!user?.id) {
        console.log('No authenticated user, redirecting to login');
        navigate('/login', { replace: true });
        return;
      }

      hasCheckedRef.current = true;

      try {
        console.log('Checking company status for user:', user?.id);
        
        // CRITICAL FIX: Use userProfile from AuthContext first if available
        let profileToCheck = userProfile;
        
        // If userProfile not loaded yet, fetch it
        if (!profileToCheck) {
          const { data: profile, error: profileError } = await supabase
            ?.from('user_profiles')
            ?.select('company_id, id')
            ?.eq('id', user?.id)
            ?.single();

          if (profileError) {
            console.error('Error checking user profile:', profileError);
            setCheckingExistingCompany(false);
            return;
          }
          
          profileToCheck = profile;
        }

        // CRITICAL FIX: If user has a company_id, verify the company actually exists
        if (profileToCheck?.company_id) {
          console.log('User has company_id, verifying company exists:', profileToCheck?.company_id);
          
          const { data: company, error: companyError } = await supabase
            ?.from('companies')
            ?.select('id, name')
            ?.eq('id', profileToCheck?.company_id)
            ?.maybeSingle();

          // CRITICAL FIX: Handle deleted company case
          if (companyError && companyError?.code !== 'PGRST116') {
            console.error('❌ Company fetch error:', companyError);
            setError(`Database error: ${companyError?.message || 'Failed to verify company'}`);
            setCheckingExistingCompany(false);
            return;
          }

          if (company) {
            // Company exists - redirect to dashboard
            console.log('✅ User company verified, redirecting to dashboard:', company?.name);
            setUserHasCompany(true);
            isRedirectingRef.current = true;
            window.location.href = '/company-dashboard';
            return;
          } else {
            // CRITICAL FIX: Company was deleted - clear invalid company_id
            console.warn('⚠️ Company ID exists in profile but company was deleted, clearing invalid data');
            
            try {
              const { error: clearError } = await supabase
                ?.from('user_profiles')
                ?.update({ 
                  company_id: null,
                  role: 'user' // Reset role to regular user
                })
                ?.eq('id', user?.id);

              if (clearError) {
                console.error('Failed to clear invalid company_id:', clearError);
                setError('Your previous company was deleted. Please refresh the page and try again.');
              } else {
                console.log('✅ Invalid company_id cleared successfully');
                setError('Your previous company no longer exists. You can create a new company below.');
              }
            } catch (clearErr) {
              console.error('Error clearing invalid company_id:', clearErr);
              setError('Your previous company was deleted. Please refresh the page to create a new one.');
            }
            
            setCheckingExistingCompany(false);
            return;
          }
        }

        console.log('❌ No existing company found, showing creation form');
        setCheckingExistingCompany(false);
      } catch (err) {
        console.error('Error checking existing company:', err);
        setError(err?.message || 'Failed to verify company status. Please try again.');
        setCheckingExistingCompany(false);
      }
    };

    checkExistingCompany();
  }, [authLoading, user, userProfile, navigate]);

  // UPDATED: Show loading state while auth is loading OR checking company
  if (authLoading || checkingExistingCompany || userHasCompany) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {authLoading ? 'Loading authentication...' : userHasCompany ?'Redirecting to company dashboard...': 'Checking company status...'}
          </p>
        </div>
      </div>
    );
  }

  // Auto-generate unique slug from company name
  const generateUniqueSlug = async (baseName) => {
    if (!baseName) return null;

    // Create base slug from company name
    let baseSlug = baseName?.toLowerCase()?.replace(/[^a-z0-9]+/g, '-')?.replace(/(^-|-$)/g, '');
    
    if (!baseSlug) return null;

    // Check if slug exists
    const { data: existingCompany } = await supabase?.from('companies')?.select('slug')?.eq('slug', baseSlug)?.maybeSingle();

    // If slug is available, return it
    if (!existingCompany) {
      return baseSlug;
    }

    // If slug exists, append random string to make it unique
    const randomSuffix = Math.random()?.toString(36)?.substring(2, 8);
    const uniqueSlug = `${baseSlug}-${randomSuffix}`;

    // Verify the unique slug doesn't exist (unlikely but safe)
    const { data: checkUnique } = await supabase?.from('companies')?.select('slug')?.eq('slug', uniqueSlug)?.maybeSingle();

    if (checkUnique) {
      // If still exists (very rare), use timestamp
      return `${baseSlug}-${Date.now()}`;
    }

    return uniqueSlug;
  };

  const handleInputChange = (e) => {
    const { name, value } = e?.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = (e) => {
    if (e) e?.preventDefault(); // Prevent form submission
    
    if (step === 1) {
      if (!formData?.name?.trim()) {
        setError('Company name is required');
        return;
      }
    }
    setError('');
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setError('');
    setStep(prev => prev - 1);
  };

  const handleSkipTeam = async (e) => {
    if (e) {
      e?.preventDefault(); // Prevent default form behavior
      e?.stopPropagation(); // Stop event bubbling
    }
    // Submit without team members
    await handleSubmit(null, true);
  };

  const handleSubmit = async (e, skipTeam = false) => {
    if (e) {
      e?.preventDefault();
      e?.stopPropagation();
    }
    
    if (step !== 2) {
      console.log('Submission blocked - not on step 2. Current step:', step);
      return;
    }
    
    if (loading) {
      console.log('Submission blocked - already in progress');
      return;
    }
    
    if (!user?.id) {
      setError('You must be logged in to create a company');
      navigate('/login');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const uniqueSlug = await generateUniqueSlug(formData?.name);

      if (!uniqueSlug) {
        setError('Failed to generate company identifier. Please try again.');
        setLoading(false);
        return;
      }

      const { data: company, error: companyError } = await supabase?.from('companies')?.insert({
          name: formData?.name?.trim(),
          slug: uniqueSlug,
          website: formData?.website?.trim() || null,
          description: formData?.description?.trim() || null,
          created_by: user?.id
        })?.select()?.single();

      if (companyError) {
        console.error('Company creation error:', companyError);
        throw companyError;
      }

      console.log('Company created successfully:', company?.id);

      const { error: profileError } = await supabase?.from('user_profiles')?.update({
          company_id: company?.id,
          role: 'company_admin'
        })?.eq('id', user?.id);

      if (profileError) {
        console.error('Profile update error:', profileError);
        throw profileError;
      }

      console.log('Profile updated successfully');

      if (!skipTeam && formData?.invite_emails?.trim()) {
        const emails = formData?.invite_emails?.split(',')?.map(email => email?.trim())?.filter(email => email);

        if (emails?.length > 0) {
          const invites = emails?.map(email => ({
            company_id: company?.id,
            invited_by: user?.id,
            email: email,
            role: 'member',
            status: 'pending'
          }));

          const { error: inviteError } = await supabase?.from('company_invites')?.insert(invites);
          
          if (inviteError) {
            console.error('Invite error (non-blocking):', inviteError);
          } else {
            console.log('Invitations sent successfully');
          }
        }
      }

      // CRITICAL FIX: Wait for database changes to propagate before redirect
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log('Navigating to company dashboard...');
      
      // CRITICAL FIX: Use window.location.href for hard redirect
      // This forces a full page reload, ensuring AppNavigation gets fresh company data
      window.location.href = '/company-dashboard';
    } catch (err) {
      console.error('Company creation error:', err);
      setError(err?.message || 'Failed to create company. Please try again.');
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Company Information</h2>
              <p className="text-muted-foreground">Let's start with the basics about your company</p>
            </div>
            <Input
              label="Company Name *"
              name="name"
              value={formData?.name}
              onChange={handleInputChange}
              placeholder="Acme Corporation"
              helperText="A unique URL identifier will be generated automatically"
              required
            />
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData?.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring"
                placeholder="Brief description of your company..."
              />
            </div>
            <Input
              label="Website URL"
              name="website"
              value={formData?.website}
              onChange={handleInputChange}
              placeholder="https://acme.com"
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Invite Team Members (Optional)</h2>
              <p className="text-muted-foreground">You can skip this step and invite team members later</p>
            </div>

            {/* User Limit Notice */}
            <div className="bg-primary/10 rounded-lg p-6 border border-primary/20">
              <div className="flex items-start gap-3">
                <AppIcon name="Users" size={24} className="text-primary flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Free Tier - 10 Users Included</h3>
                  <p className="text-foreground mb-3">
                    Your company can add up to <strong>10 team members completely free</strong>. 
                    Need more users? Contact our sales team for custom enterprise solutions.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-primary/15 text-foreground px-3 py-1 rounded-full text-sm font-medium">
                      ✓ 10 Free Users
                    </span>
                    <span className="bg-primary/15 text-foreground px-3 py-1 rounded-full text-sm font-medium">
                      ✓ All Features Included
                    </span>
                    <span className="bg-primary/15 text-foreground px-3 py-1 rounded-full text-sm font-medium">
                      ✓ No Credit Card Required
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email Addresses (Optional - Up to 9 more users)
              </label>
              <textarea
                name="invite_emails"
                value={formData?.invite_emails}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring"
                placeholder="Enter email addresses separated by commas&#10;john@company.com, jane@company.com"
              />
              <p className="text-sm text-muted-foreground mt-2">
                Leave empty to skip team invitations. You can invite members later from your company dashboard.
              </p>
            </div>

            {/* Need More Users? */}
            <div className="bg-background rounded-lg p-4 border border-border">
              <div className="flex items-start gap-3">
                <AppIcon name="HelpCircle" size={20} className="text-muted-foreground flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Need more than 10 users?</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Contact our sales team after creating your company to discuss enterprise options for larger teams.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    iconName="Mail"
                    onClick={() => window.open('/contact', '_blank')}
                  >
                    Contact Sales
                  </Button>
                </div>
              </div>
            </div>

            <div className="bg-primary/10 rounded-lg p-6">
              <h3 className="font-semibold text-foreground mb-3">What happens next?</h3>
              <ul className="space-y-2 text-foreground">
                <li className="flex items-start gap-2">
                  <AppIcon name="Check" size={20} className="text-primary flex-shrink-0 mt-0.5" />
                  <span>Your company workspace will be created with a 10-user limit</span>
                </li>
                <li className="flex items-start gap-2">
                  <AppIcon name="Check" size={20} className="text-primary flex-shrink-0 mt-0.5" />
                  <span>Invitations will be sent to team members (if provided)</span>
                </li>
                <li className="flex items-start gap-2">
                  <AppIcon name="Check" size={20} className="text-primary flex-shrink-0 mt-0.5" />
                  <span>You'll be taken to your company dashboard</span>
                </li>
                <li className="flex items-start gap-2">
                  <AppIcon name="Check" size={20} className="text-primary flex-shrink-0 mt-0.5" />
                  <span>Start collaborating with unlimited features!</span>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <AppNavigation />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Progress Indicator */}
        <div className="bg-card rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            {[1, 2]?.map((num, index) => (
              <React.Fragment key={num}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      step >= num
                        ? 'bg-primary text-white' :'bg-muted text-muted-foreground'
                    }`}
                  >
                    {num}
                  </div>
                  <span className="text-xs mt-2 text-muted-foreground">
                    {num === 1 ? 'Company Info' : 'Team (Optional)'}
                  </span>
                </div>
                {index < 1 && (
                  <div
                    className={`flex-1 h-1 mx-4 ${
                      step > num ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="bg-card rounded-lg shadow-lg p-8">
          {error && (
            <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-lg">
              <div className="flex items-start gap-2">
                <AppIcon name="AlertCircle" size={20} className="text-error flex-shrink-0 mt-0.5" />
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            </div>
          )}

          {renderStep()}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            {step > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                iconName="ChevronLeft"
                iconPosition="left"
                disabled={loading}
              >
                Back
              </Button>
            )}
            <div className="ml-auto flex gap-3">
              {step === 2 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSkipTeam}
                  disabled={loading}
                  iconName="ArrowRight"
                  iconPosition="right"
                >
                  {loading ? 'Creating...' : 'Skip & Create Company'}
                </Button>
              )}
              {step < 2 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  iconName="ChevronRight"
                  iconPosition="right"
                  disabled={loading}
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  iconName="Building"
                  iconPosition="left"
                >
                  {loading ? 'Creating Company...' : 'Create Company & Invite Team'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyCreationPage;