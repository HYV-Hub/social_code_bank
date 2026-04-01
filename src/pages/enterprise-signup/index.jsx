import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppIcon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { Checkbox } from '../../components/ui/Checkbox';
import PublicNavigation from '../../components/PublicNavigation';

const EnterpriseSignup = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    // Organization Details
    companyName: '',
    industry: '',
    companySize: '',
    website: '',
    
    // Contact Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    jobTitle: '',
    
    // Technical Requirements
    estimatedUsers: '',
    integrationNeeds: [],
    dataResidency: '',
    
    // Compliance Requirements
    complianceNeeds: [],
    
    // Additional Information
    projectTimeline: '',
    additionalNotes: '',
    
    // Agreements
    agreedToTerms: false
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const industries = [
    { value: 'technology', label: 'Technology & Software' },
    { value: 'finance', label: 'Finance & Banking' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'education', label: 'Education' },
    { value: 'retail', label: 'Retail & E-commerce' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'consulting', label: 'Consulting' },
    { value: 'other', label: 'Other' }
  ];

  const companySizes = [
    { value: '50-200', label: '50-200 employees' },
    { value: '201-500', label: '201-500 employees' },
    { value: '501-1000', label: '501-1000 employees' },
    { value: '1001-5000', label: '1001-5000 employees' },
    { value: '5000+', label: '5000+ employees' }
  ];

  const userCountOptions = [
    { value: '10-50', label: '10-50 users' },
    { value: '51-100', label: '51-100 users' },
    { value: '101-500', label: '101-500 users' },
    { value: '501-1000', label: '501-1000 users' },
    { value: '1000+', label: '1000+ users' }
  ];

  const integrationOptions = [
    'Single Sign-On (SSO)',
    'SAML Authentication',
    'Active Directory Integration',
    'Custom API Integration',
    'Slack Integration',
    'Jira Integration',
    'GitHub Integration',
    'Other'
  ];

  const complianceOptions = [
    'GDPR Compliance',
    'HIPAA Compliance',
    'SOC 2 Certification',
    'ISO 27001 Certification',
    'PCI DSS Compliance',
    'UK Data Protection Act',
    'Industry-Specific Regulations'
  ];

  const dataResidencyOptions = [
    { value: 'uk', label: 'United Kingdom' },
    { value: 'eu', label: 'European Union' },
    { value: 'us', label: 'United States' },
    { value: 'custom', label: 'Custom Requirements' }
  ];

  const timelineOptions = [
    { value: 'immediate', label: 'Immediate (Within 1 month)' },
    { value: '1-3months', label: '1-3 months' },
    { value: '3-6months', label: '3-6 months' },
    { value: '6+months', label: '6+ months' },
    { value: 'flexible', label: 'Flexible' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e?.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors?.[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleCheckboxChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev?.[field]?.includes(value)
        ? prev?.[field]?.filter(item => item !== value)
        : [...prev?.[field], value]
    }));
  };

  const handleBooleanChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields validation
    if (!formData?.companyName?.trim()) newErrors.companyName = 'Company name is required';
    if (!formData?.industry) newErrors.industry = 'Industry is required';
    if (!formData?.companySize) newErrors.companySize = 'Company size is required';
    if (!formData?.firstName?.trim()) newErrors.firstName = 'First name is required';
    if (!formData?.lastName?.trim()) newErrors.lastName = 'Last name is required';
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData?.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex?.test(formData?.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Phone validation (basic)
    if (!formData?.phone?.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!formData?.jobTitle?.trim()) newErrors.jobTitle = 'Job title is required';
    if (!formData?.estimatedUsers) newErrors.estimatedUsers = 'Estimated users is required';
    if (!formData?.projectTimeline) newErrors.projectTimeline = 'Project timeline is required';
    
    // Terms agreement
    if (!formData?.agreedToTerms) {
      newErrors.agreedToTerms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();

    if (!validateForm()) {
      // Scroll to first error
      const firstError = document.querySelector('.text-destructive');
      if (firstError) {
        firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call - In production, this would send to your backend
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Success
      setSubmitSuccess(true);
      
      // Show success message for 3 seconds then redirect
      setTimeout(() => {
        navigate('/');
      }, 3000);

    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors({ submit: 'Failed to submit form. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-success/15 rounded-full flex items-center justify-center mx-auto mb-6">
            <AppIcon name="CheckCircle" size={48} className="text-success" />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Thank You for Your Interest!
          </h2>
          <p className="text-muted-foreground mb-6">
            Our enterprise team will review your information and contact you within 24 hours to discuss 
            your requirements and schedule a demo.
          </p>
          <p className="text-sm text-muted-foreground">
            Redirecting to homepage...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PublicNavigation />
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Enterprise Signup
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Complete this form to get started with HyvHub Enterprise. Our team will contact you to 
            discuss your needs and provide a custom solution.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Organization Details */}
          <div className="bg-card rounded-lg border border-border p-6">
            <h2 className="text-2xl font-bold text-card-foreground mb-6 flex items-center">
              <AppIcon name="Building2" size={24} className="mr-2 text-primary" />
              Organization Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Company Name *
                </label>
                <Input
                  name="companyName"
                  value={formData?.companyName}
                  onChange={handleInputChange}
                  placeholder="Enter company name"
                  error={errors?.companyName}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Industry *
                </label>
                <Select
                  name="industry"
                  value={formData?.industry}
                  onChange={handleInputChange}
                  options={industries}
                  placeholder="Select industry"
                  error={errors?.industry}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Company Size *
                </label>
                <Select
                  name="companySize"
                  value={formData?.companySize}
                  onChange={handleInputChange}
                  options={companySizes}
                  placeholder="Select company size"
                  error={errors?.companySize}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Website
                </label>
                <Input
                  name="website"
                  value={formData?.website}
                  onChange={handleInputChange}
                  placeholder="https://www.example.com"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-card rounded-lg border border-border p-6">
            <h2 className="text-2xl font-bold text-card-foreground mb-6 flex items-center">
              <AppIcon name="User" size={24} className="mr-2 text-primary" />
              Contact Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  First Name *
                </label>
                <Input
                  name="firstName"
                  value={formData?.firstName}
                  onChange={handleInputChange}
                  placeholder="John"
                  error={errors?.firstName}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Last Name *
                </label>
                <Input
                  name="lastName"
                  value={formData?.lastName}
                  onChange={handleInputChange}
                  placeholder="Doe"
                  error={errors?.lastName}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Work Email *
                </label>
                <Input
                  name="email"
                  type="email"
                  value={formData?.email}
                  onChange={handleInputChange}
                  placeholder="john.doe@company.com"
                  error={errors?.email}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Phone Number *
                </label>
                <Input
                  name="phone"
                  value={formData?.phone}
                  onChange={handleInputChange}
                  placeholder="+44 20 1234 5678"
                  error={errors?.phone}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Job Title *
                </label>
                <Input
                  name="jobTitle"
                  value={formData?.jobTitle}
                  onChange={handleInputChange}
                  placeholder="e.g., CTO, VP of Engineering"
                  error={errors?.jobTitle}
                />
              </div>
            </div>
          </div>

          {/* Technical Requirements */}
          <div className="bg-card rounded-lg border border-border p-6">
            <h2 className="text-2xl font-bold text-card-foreground mb-6 flex items-center">
              <AppIcon name="Settings" size={24} className="mr-2 text-primary" />
              Technical Requirements
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Estimated Number of Users *
                </label>
                <Select
                  name="estimatedUsers"
                  value={formData?.estimatedUsers}
                  onChange={handleInputChange}
                  options={userCountOptions}
                  placeholder="Select user count"
                  error={errors?.estimatedUsers}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-card-foreground mb-4">
                  Integration Requirements
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {integrationOptions?.map(option => (
                    <Checkbox
                      key={option}
                      label={option}
                      checked={formData?.integrationNeeds?.includes(option)}
                      onChange={() => handleCheckboxChange('integrationNeeds', option)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Data Residency Requirements
                </label>
                <Select
                  name="dataResidency"
                  value={formData?.dataResidency}
                  onChange={handleInputChange}
                  options={dataResidencyOptions}
                  placeholder="Select data residency"
                />
              </div>
            </div>
          </div>

          {/* Compliance Requirements */}
          <div className="bg-card rounded-lg border border-border p-6">
            <h2 className="text-2xl font-bold text-card-foreground mb-6 flex items-center">
              <AppIcon name="Shield" size={24} className="mr-2 text-primary" />
              Compliance & Security Requirements
            </h2>

            <div>
              <label className="block text-sm font-medium text-card-foreground mb-4">
                Compliance Standards
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {complianceOptions?.map(option => (
                  <Checkbox
                    key={option}
                    label={option}
                    checked={formData?.complianceNeeds?.includes(option)}
                    onChange={() => handleCheckboxChange('complianceNeeds', option)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-card rounded-lg border border-border p-6">
            <h2 className="text-2xl font-bold text-card-foreground mb-6 flex items-center">
              <AppIcon name="FileText" size={24} className="mr-2 text-primary" />
              Additional Information
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Project Timeline *
                </label>
                <Select
                  name="projectTimeline"
                  value={formData?.projectTimeline}
                  onChange={handleInputChange}
                  options={timelineOptions}
                  placeholder="Select timeline"
                  error={errors?.projectTimeline}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Additional Notes or Requirements
                </label>
                <textarea
                  name="additionalNotes"
                  value={formData?.additionalNotes}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  placeholder="Tell us about your specific needs, use cases, or any questions you have..."
                />
              </div>
            </div>
          </div>

          {/* Terms Agreement */}
          <div className="bg-card rounded-lg border border-border p-6">
            <Checkbox
              label={
                <span className="text-sm">
                  I agree to the{' '}
                  <button
                    type="button"
                    onClick={() => window.open('/terms-of-service', '_blank')}
                    className="text-primary hover:underline"
                  >
                    Terms of Service
                  </button>
                  {' '}and{' '}
                  <button
                    type="button"
                    onClick={() => window.open('/privacy-policy', '_blank')}
                    className="text-primary hover:underline"
                  >
                    Privacy Policy
                  </button>
                </span>
              }
              checked={formData?.agreedToTerms}
              onChange={(checked) => handleBooleanChange('agreedToTerms', checked)}
            />
            {errors?.agreedToTerms && (
              <p className="text-destructive text-sm mt-2">{errors?.agreedToTerms}</p>
            )}
          </div>

          {/* Submit Error */}
          {errors?.submit && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start">
              <AppIcon name="AlertCircle" size={20} className="text-destructive mr-3 flex-shrink-0 mt-0.5" />
              <p className="text-destructive">{errors?.submit}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              iconName={isSubmitting ? "Loader2" : "Send"}
              iconClassName={isSubmitting ? "animate-spin" : ""}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EnterpriseSignup;