import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const PricingTeaser = () => {
  const plans = [
    {
      name: 'Individual',
      price: 'Free',
      period: 'Forever',
      description: 'Perfect for individual developers getting started',
      features: [
        'Unlimited public snippets',
        '50 private snippets',
        'Basic bug tracking',
        'Community access',
        'AI-powered tagging'
      ],
      cta: 'Get Started Free',
      popular: false,
      icon: 'User'
    },
    {
      name: 'Team',
      price: '£9.99',
      period: 'per user/month',
      description: 'For small to medium development teams',
      features: [
        'Unlimited private snippets',
        'Team workspaces',
        'Advanced bug tracking',
        'Role-based permissions',
        'AI code analysis',
        'Priority support'
      ],
      cta: 'Start Free Trial',
      popular: true,
      icon: 'Users'
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'Contact sales',
      description: 'For large organizations with advanced needs',
      features: [
        'Everything in Team',
        'Custom integrations',
        'Advanced security',
        'Audit logs',
        'SSO authentication',
        'Dedicated support',
        'SLA guarantee'
      ],
      cta: 'Contact Sales',
      popular: false,
      icon: 'Building2'
    }
  ];

  return (
    <section className="py-20 lg:py-32 bg-gradient-to-b from-blue-50/30 to-transparent dark:from-slate-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 mb-6">
            <Icon name="DollarSign" size={16} color="var(--color-primary)" />
            <span className="text-sm font-medium text-[var(--color-primary)]">
              Simple Pricing
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--color-foreground)] mb-4">
            Plans That Grow
            <br />
            <span className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] bg-clip-text text-transparent">
              With Your Team
            </span>
          </h2>
          <p className="text-lg text-[var(--color-muted-foreground)] max-w-2xl mx-auto">
            The ultimate platform for developers to share code snippets, track bugs efficiently, 
            and collaborate with teams. Powered by AI for intelligent code analysis and optimization.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {plans?.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-card dark:bg-slate-800 rounded-xl p-8 border-2 transition-all duration-300 ${
                plan?.popular
                  ? 'border-[var(--color-primary)] shadow-2xl scale-105'
                  : 'border-[var(--color-border)] hover:border-[var(--color-primary)]/50 hover:shadow-xl'
              }`}
            >
              {/* Popular Badge */}
              {plan?.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                    <Icon name="Star" size={14} />
                    <span>Most Popular</span>
                  </div>
                </div>
              )}

              {/* Plan Icon */}
              <div className={`w-14 h-14 rounded-xl mb-6 flex items-center justify-center ${
                plan?.popular
                  ? 'bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] text-white'
                  : 'bg-[var(--color-muted)] text-[var(--color-primary)]'
              }`}>
                <Icon name={plan?.icon} size={28} />
              </div>

              {/* Plan Name */}
              <h3 className="text-2xl font-bold text-[var(--color-foreground)] mb-2">
                {plan?.name}
              </h3>
              <p className="text-sm text-[var(--color-muted-foreground)] mb-6">
                {plan?.description}
              </p>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-[var(--color-foreground)]">
                    {plan?.price}
                  </span>
                  {plan?.period && (
                    <span className="text-[var(--color-muted-foreground)]">
                      {plan?.period}
                    </span>
                  )}
                </div>
              </div>

              {/* Features List */}
              <ul className="space-y-4 mb-8">
                {plan?.features?.map((feature, fIndex) => (
                  <li key={fIndex} className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <Icon name="Check" size={20} color="var(--color-success)" />
                    </div>
                    <span className="text-sm text-[var(--color-foreground)]">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <Link to={plan?.popular ? '/register' : '/pricing'}>
                <Button
                  variant={plan?.popular ? 'default' : 'outline'}
                  size="lg"
                  fullWidth
                  iconName="ArrowRight"
                  iconPosition="right"
                >
                  {plan?.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>

        {/* Bottom Info */}
        <div className="text-center">
          <p className="text-[var(--color-muted-foreground)] mb-4">
            All plans include 14-day free trial • No credit card required
          </p>
          <Link 
            to="/pricing" 
            className="inline-flex items-center gap-2 text-[var(--color-primary)] hover:underline font-semibold"
          >
            <span>View Detailed Pricing Comparison</span>
            <Icon name="ArrowRight" size={16} />
          </Link>
        </div>

        {/* FAQ Snippet */}
        <div className="mt-20 bg-card dark:bg-slate-800 rounded-xl p-8 border border-[var(--color-border)]">
          <div className="text-center mb-8">
            <Icon name="HelpCircle" size={32} color="var(--color-primary)" className="mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-[var(--color-foreground)] mb-2">
              Frequently Asked Questions
            </h3>
            <p className="text-[var(--color-muted-foreground)]">
              Have questions? We've got answers.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-[var(--color-foreground)] mb-2">
                Can I switch plans anytime?
              </h4>
              <p className="text-sm text-[var(--color-muted-foreground)]">
                Yes! Upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-[var(--color-foreground)] mb-2">
                What payment methods do you accept?
              </h4>
              <p className="text-sm text-[var(--color-muted-foreground)]">
                We accept all major credit cards, PayPal, and bank transfers for enterprise plans.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-[var(--color-foreground)] mb-2">
                Is my code secure?
              </h4>
              <p className="text-sm text-[var(--color-muted-foreground)]">
                Absolutely. We use enterprise-grade encryption and security measures to protect your data.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-[var(--color-foreground)] mb-2">
                Do you offer student discounts?
              </h4>
              <p className="text-sm text-[var(--color-muted-foreground)]">
                Yes! Students get 50% off Team plans. Contact support with your student ID.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingTeaser;