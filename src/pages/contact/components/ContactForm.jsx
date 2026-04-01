import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';

const ContactForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm();

  const inquiryTypes = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'sales', label: 'Sales & Pricing' },
    { value: 'support', label: 'Technical Support' },
    { value: 'partnership', label: 'Partnership Opportunity' },
    { value: 'feedback', label: 'Feedback & Suggestions' },
    { value: 'other', label: 'Other' }
  ];

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log('Form submitted:', data);
    setSubmitSuccess(true);
    reset();
    
    setTimeout(() => {
      setSubmitSuccess(false);
      setIsSubmitting(false);
    }, 3000);
  };

  return (
    <div className="bg-card dark:bg-slate-800 rounded-xl p-8 border border-[var(--color-border)] shadow-lg">
      {submitSuccess ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-success/15 dark:bg-green-900/30 rounded-full mb-4">
            <Icon name="CheckCircle" size={32} className="text-success dark:text-green-400" />
          </div>
          <h3 className="text-2xl font-bold text-[var(--color-foreground)] mb-2">
            Message Sent Successfully!
          </h3>
          <p className="text-[var(--color-muted-foreground)]">
            Thank you for contacting us. We'll get back to you within 24 hours.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Name and Email Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[var(--color-foreground)] mb-2">
                Full Name *
              </label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                {...register('name', { 
                  required: 'Name is required',
                  minLength: { value: 2, message: 'Name must be at least 2 characters' }
                })}
                error={errors?.name?.message}
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[var(--color-foreground)] mb-2">
                Email Address *
              </label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                error={errors?.email?.message}
              />
            </div>
          </div>

          {/* Company and Phone Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-[var(--color-foreground)] mb-2">
                Company Name
              </label>
              <Input
                id="company"
                type="text"
                placeholder="Acme Corporation"
                {...register('company')}
              />
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-[var(--color-foreground)] mb-2">
                Phone Number
              </label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                {...register('phone')}
              />
            </div>
          </div>

          {/* Inquiry Type */}
          <div>
            <label htmlFor="inquiryType" className="block text-sm font-medium text-[var(--color-foreground)] mb-2">
              Inquiry Type *
            </label>
            <Select
              id="inquiryType"
              {...register('inquiryType', { required: 'Please select an inquiry type' })}
              error={errors?.inquiryType?.message}
            >
              <option value="">Select inquiry type...</option>
              {inquiryTypes?.map((type) => (
                <option key={type?.value} value={type?.value}>
                  {type?.label}
                </option>
              ))}
            </Select>
          </div>

          {/* Message */}
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-[var(--color-foreground)] mb-2">
              Message *
            </label>
            <textarea
              id="message"
              rows={6}
              placeholder="Tell us more about your inquiry..."
              className="w-full px-4 py-3 bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] resize-none"
              {...register('message', { 
                required: 'Message is required',
                minLength: { value: 10, message: 'Message must be at least 10 characters' }
              })}
            />
            {errors?.message && (
              <p className="mt-1 text-sm text-error dark:text-error">
                {errors?.message?.message}
              </p>
            )}
          </div>

          {/* Privacy Acknowledgment */}
          <div className="flex items-start gap-3 p-4 bg-primary/10 dark:bg-blue-900/20 rounded-lg">
            <Checkbox
              id="privacy"
              {...register('privacy', { required: 'You must acknowledge our privacy policy' })}
            />
            <div className="flex-1">
              <label htmlFor="privacy" className="text-sm text-[var(--color-foreground)] cursor-pointer">
                I acknowledge that HyvHub will process my personal data according to the{' '}
                <a href="/privacy" className="text-primary dark:text-blue-400 hover:underline">
                  Privacy Policy
                </a>
                . My data will be used solely to respond to this inquiry.
              </label>
              {errors?.privacy && (
                <p className="mt-1 text-sm text-error dark:text-error">
                  {errors?.privacy?.message}
                </p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-between pt-4">
            <p className="text-sm text-[var(--color-muted-foreground)]">
              * Required fields
            </p>
            <Button
              type="submit"
              variant="default"
              size="lg"
              disabled={isSubmitting}
              iconName={isSubmitting ? "Loader" : "Send"}
              iconPosition="right"
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ContactForm;