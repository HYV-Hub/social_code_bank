import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, AlertCircle, Building2, Briefcase, Clock, Shield } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const InviteAcceptance = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [inviteData, setInviteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    validateInviteToken();
  }, []);

  const validateInviteToken = async () => {
    const token = searchParams?.get('token');

    if (!token) {
      setError('Invalid invite link. No token provided.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Import supabase
      const { supabase } = await import('../../lib/supabase');

      // Validate token against database
      const { data: invite, error: inviteError } = await supabase
        .from('team_invites')
        .select(`
          *,
          teams(id, name, description),
          companies(id, name)
        `)
        .eq('token', token)
        .eq('status', 'pending')
        .single();

      if (inviteError || !invite) {
        setError('This invite link is invalid or has expired.');
        setLoading(false);
        return;
      }

      // Check if invite has expired
      if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
        setError('This invite link has expired. Please request a new one.');
        setLoading(false);
        return;
      }

      const invitePayload = {
        company: {
          name: invite.companies?.name || 'Unknown Company',
          logo: null,
          logoAlt: ''
        },
        invitedBy: {
          name: invite.inviter_name || 'A team member',
          role: '',
          avatar: null,
          avatarAlt: ''
        },
        role: {
          title: invite.role || 'member',
          permissions: []
        },
        companyContext: {
          teamSize: 0,
          activeProjects: 0,
          snippetsLibrary: 0
        },
        inviteDetails: {
          sentAt: invite.created_at,
          expiresAt: invite.expires_at,
          isExpired: false,
          usageCount: 0,
          maxUsage: 1
        },
        prefilledEmail: invite.email || '',
        token: token
      };

      setInviteData(invitePayload);
      setFormData((prev) => ({ ...prev, email: invitePayload?.prefilledEmail }));
      setError(null);
    } catch (err) {
      setError('Failed to validate invite link. Please contact your team admin.');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData?.fullName?.trim()) {
      errors.fullName = 'Full name is required';
    }

    if (!formData?.email?.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/?.test(formData?.email)) {
      errors.email = 'Invalid email format';
    }

    if (!formData?.password) {
      errors.password = 'Password is required';
    } else if (formData?.password?.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/?.test(formData?.password)) {
      errors.password = 'Password must contain uppercase, lowercase, and number';
    }

    if (formData?.password !== formData?.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (!formData?.acceptTerms) {
      errors.acceptTerms = 'You must accept the terms and conditions';
    }

    setFormErrors(errors);
    return Object.keys(errors)?.length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);

      const { supabase } = await import('../../lib/supabase');

      // Accept the invite
      const { error: acceptError } = await supabase
        .from('team_invites')
        .update({ status: 'accepted', accepted_at: new Date().toISOString() })
        .eq('token', inviteData?.token);

      if (acceptError) throw acceptError;

      // Navigate to onboarding or dashboard
      navigate('/user-dashboard', {
        state: {
          newMember: true,
          role: inviteData?.role?.title
        }
      });
    } catch (err) {
      setFormErrors({ submit: 'Failed to accept invite. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e?.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error for this field
    if (formErrors?.[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Validating invite...</p>
        </div>
      </div>);

  }

  if (error || inviteData?.inviteDetails?.isExpired) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card rounded-lg shadow-lg p-8 text-center">
          <XCircle className="w-16 h-16 text-error mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Invalid Invite</h2>
          <p className="text-muted-foreground mb-6">
            {error || 'This invite link has expired. Please request a new invite from your team admin.'}
          </p>
          <Button onClick={() => navigate('/')} className="w-full">
            Return to Homepage
          </Button>
        </div>
      </div>);

  }

  return (
    <>
      <Helmet>
        <title>Accept Team Invite - Social Code Bank</title>
        <meta name="description" content="Accept your team invitation and join your organization on Social Code Bank" />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Company Information Card */}
          <div className="bg-card rounded-lg shadow-lg p-6 sm:p-8 mb-6">
            <div className="flex items-start space-x-4 mb-6">
              <img
                src={inviteData?.company?.logo}
                alt={inviteData?.company?.logoAlt}
                className="w-16 h-16 rounded-lg object-cover" />

              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                  Join {inviteData?.company?.name}
                </h1>
                <div className="flex items-center text-muted-foreground space-x-2">
                  <img
                    src={inviteData?.invitedBy?.avatar}
                    alt={inviteData?.invitedBy?.avatarAlt}
                    className="w-8 h-8 rounded-full" />

                  <span>
                    Invited by <strong>{inviteData?.invitedBy?.name}</strong>
                    <span className="text-muted-foreground"> · {inviteData?.invitedBy?.role}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Invite Expiry Warning */}
            <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 flex items-start space-x-3">
              <Clock className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-yellow-800">
                  <strong>This invite expires on:</strong> {new Date(inviteData?.inviteDetails?.expiresAt)?.toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Form */}
            <div className="lg:col-span-2 bg-card rounded-lg shadow-lg p-6 sm:p-8">
              <h2 className="text-xl font-bold text-foreground mb-6">Complete Your Profile</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-foreground mb-2">
                    Full Name *
                  </label>
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData?.fullName}
                    onChange={handleInputChange}
                    error={formErrors?.fullName} />

                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                    Email Address *
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData?.email}
                    onChange={handleInputChange}
                    error={formErrors?.email}
                    disabled
                    className="bg-background" />

                  <p className="mt-1 text-xs text-muted-foreground">Email is pre-filled from your invite</p>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                    Password *
                  </label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Create a strong password"
                    value={formData?.password}
                    onChange={handleInputChange}
                    error={formErrors?.password} />

                  <div className="mt-2 space-y-1">
                    <p className={`text-xs ${formData?.password?.length >= 8 ? 'text-success' : 'text-muted-foreground'}`}>
                      {formData?.password?.length >= 8 ? '✓' : '○'} At least 8 characters
                    </p>
                    <p className={`text-xs ${/(?=.*[a-z])(?=.*[A-Z])/?.test(formData?.password) ? 'text-success' : 'text-muted-foreground'}`}>
                      {/(?=.*[a-z])(?=.*[A-Z])/?.test(formData?.password) ? '✓' : '○'} Uppercase and lowercase letters
                    </p>
                    <p className={`text-xs ${/(?=.*\d)/?.test(formData?.password) ? 'text-success' : 'text-muted-foreground'}`}>
                      {/(?=.*\d)/?.test(formData?.password) ? '✓' : '○'} At least one number
                    </p>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">
                    Confirm Password *
                  </label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Re-enter your password"
                    value={formData?.confirmPassword}
                    onChange={handleInputChange}
                    error={formErrors?.confirmPassword} />

                </div>

                <div className="border-t pt-6">
                  <div className="flex items-start space-x-3">
                    <input
                      id="acceptTerms"
                      name="acceptTerms"
                      type="checkbox"
                      checked={formData?.acceptTerms}
                      onChange={handleInputChange}
                      className="mt-1 h-4 w-4 text-primary border-border rounded focus:ring-primary" />

                    <label htmlFor="acceptTerms" className="text-sm text-foreground">
                      I agree to the <a href="/terms" className="text-primary hover:underline">Terms of Service</a> and{' '}
                      <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>
                    </label>
                  </div>
                  {formErrors?.acceptTerms &&
                  <p className="mt-1 text-sm text-error">{formErrors?.acceptTerms}</p>
                  }
                </div>

                {formErrors?.submit &&
                <div className="bg-error/10 border border-error/20 rounded-lg p-4 flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-800">{formErrors?.submit}</p>
                  </div>
                }

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full">

                  {submitting ?
                  <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Joining Team...
                    </> :

                  <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Join {inviteData?.company?.name}
                    </>
                  }
                </Button>
              </form>
            </div>

            {/* Right Column - Role & Context */}
            <div className="space-y-6">
              {/* Role Information */}
              <div className="bg-card rounded-lg shadow-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Briefcase className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground">Your Role</h3>
                </div>
                <p className="text-lg font-medium text-foreground mb-3">
                  {inviteData?.role?.title}
                </p>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Permissions:</p>
                  <ul className="space-y-2">
                    {inviteData?.role?.permissions?.map((permission, index) =>
                    <li key={index} className="flex items-start space-x-2 text-sm text-muted-foreground">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{permission}</span>
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Company Context */}
              <div className="bg-card rounded-lg shadow-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground">Company Overview</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-muted-foreground">Team Members</span>
                    <span className="font-semibold text-foreground">{inviteData?.companyContext?.teamSize}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-muted-foreground">Active Projects</span>
                    <span className="font-semibold text-foreground">{inviteData?.companyContext?.activeProjects}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-muted-foreground">Code Snippets</span>
                    <span className="font-semibold text-foreground">{inviteData?.companyContext?.snippetsLibrary?.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Security Badge */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg shadow p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <Shield className="w-6 h-6 text-success" />
                  <h3 className="font-semibold text-foreground">Secure Invite</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  This invitation is verified and secure. Your data is encrypted and protected.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>);

};

export default InviteAcceptance;