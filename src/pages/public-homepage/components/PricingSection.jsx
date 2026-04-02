import React from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const PricingSection = () => {
  const plans = [
    {
      id: 1,
      name: "Individual",
      price: "Free",
      period: "forever",
      description: "Perfect for solo developers and personal projects",
      features: [
        "Unlimited public snippets",
        "5 private snippets",
        "Basic bug tracking",
        "Community support",
        "AI code analysis (limited)",
        "1 GB storage"
      ],
      cta: "Get Started Free",
      popular: false
    },
    {
      id: 2,
      name: "Team",
      price: "$29",
      period: "per user/month",
      description: "Ideal for small to medium development teams",
      features: [
        "Everything in Individual",
        "Unlimited private snippets",
        "Advanced bug tracking",
        "Team collaboration tools",
        "Priority support",
        "Full AI features",
        "50 GB storage per user",
        "Team analytics"
      ],
      cta: "Start Free Trial",
      popular: true
    },
    {
      id: 3,
      name: "Enterprise",
      price: "Custom",
      period: "contact sales",
      description: "For large organizations with advanced needs",
      features: [
        "Everything in Team",
        "Unlimited storage",
        "Advanced security features",
        "SSO integration",
        "Dedicated support",
        "Custom integrations",
        "Audit logging",
        "SLA guarantee"
      ],
      cta: "Contact Sales",
      popular: false
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Choose the plan that fits your needs. All plans include a 14-day free trial.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {plans?.map((plan) => (
            <div 
              key={plan?.id}
              className={`relative bg-card border-2 rounded-xl p-8 ${
                plan?.popular 
                  ? 'border-blue-600 shadow-xl scale-105' 
                  : 'border-border hover:shadow-lg'
              } transition-all duration-300`}
            >
              {plan?.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  {plan?.name}
                </h3>
                <div className="mb-2">
                  <span className="text-5xl font-bold text-foreground">
                    {plan?.price}
                  </span>
                  {plan?.price !== "Free" && plan?.price !== "Custom" && (
                    <span className="text-muted-foreground ml-2">/{plan?.period}</span>
                  )}
                  {plan?.price === "Custom" && (
                    <span className="text-muted-foreground ml-2 text-lg">{plan?.period}</span>
                  )}
                </div>
                <p className="text-muted-foreground">
                  {plan?.description}
                </p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan?.features?.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Icon 
                      name="Check" 
                      size={20} 
                      className="text-success flex-shrink-0 mt-0.5"
                    />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button 
                variant={plan?.popular ? "default" : "outline"}
                size="lg"
                fullWidth
                iconName="ArrowRight"
                iconPosition="right"
              >
                {plan?.cta}
              </Button>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            Need help choosing? <a href="/features" className="text-primary hover:underline">Compare all features</a>
          </p>
          <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Icon name="Shield" size={16} className="text-success" />
              <span>Secure payments</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="RefreshCw" size={16} className="text-success" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="CreditCard" size={16} className="text-success" />
              <span>No hidden fees</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;