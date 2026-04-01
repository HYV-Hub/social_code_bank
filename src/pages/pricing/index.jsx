import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AppNavigation from '../../components/AppNavigation';
import PublicNavigation from '../../components/PublicNavigation';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

const PricingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (!user) {
      navigate('/register');
    } else {
      navigate('/user-dashboard');
    }
  };

  const handleContactSales = () => {
    navigate('/contact');
  };

  return (
    <div className="min-h-screen bg-background">
      {user ? <AppNavigation /> : <PublicNavigation />}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Currently Free for Everyone
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-4">
            HyvHub is completely free while we build amazing features for you. Enjoy unlimited access to our platform!
          </p>
          <div className="inline-block bg-success/15 text-success px-4 py-2 rounded-full font-semibold">
            🎉 100% Free - No Credit Card Required
          </div>
        </div>

        {/* Current Free Plan */}
        <div className="max-w-2xl mx-auto mb-16">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-2xl p-8 text-white">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold mb-2">Free Tier</h2>
              <p className="text-blue-100 text-lg">All features included at no cost</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Icon name="Check" size={24} className="text-green-300 flex-shrink-0" />
                  <span className="text-white">Unlimited code snippets</span>
                </div>
                <div className="flex items-center gap-3">
                  <Icon name="Check" size={24} className="text-green-300 flex-shrink-0" />
                  <span className="text-white">AI-powered code analysis</span>
                </div>
                <div className="flex items-center gap-3">
                  <Icon name="Check" size={24} className="text-green-300 flex-shrink-0" />
                  <span className="text-white">Private & public snippets</span>
                </div>
                <div className="flex items-center gap-3">
                  <Icon name="Check" size={24} className="text-green-300 flex-shrink-0" />
                  <span className="text-white">Team collaboration</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Icon name="Check" size={24} className="text-green-300 flex-shrink-0" />
                  <span className="text-white">Unlimited storage</span>
                </div>
                <div className="flex items-center gap-3">
                  <Icon name="Check" size={24} className="text-green-300 flex-shrink-0" />
                  <span className="text-white">Advanced search & filters</span>
                </div>
                <div className="flex items-center gap-3">
                  <Icon name="Check" size={24} className="text-green-300 flex-shrink-0" />
                  <span className="text-white">Version history</span>
                </div>
                <div className="flex items-center gap-3">
                  <Icon name="Check" size={24} className="text-green-300 flex-shrink-0" />
                  <span className="text-white">Community support</span>
                </div>
              </div>
            </div>

            <Button
              onClick={handleGetStarted}
              variant="secondary"
              size="lg"
              className="w-full bg-card text-primary hover:bg-primary/10"
              iconName="Rocket"
            >
              Get Started Free
            </Button>
          </div>
        </div>

        {/* Company Plans */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-4">For Companies</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Add up to 10 team members for free. Need more? Contact us for custom solutions.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-card rounded-lg shadow-lg p-8 border-2 border-blue-500">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-foreground mb-2">Free Company Plan</h3>
                <div className="text-4xl font-bold text-primary mb-2">Free</div>
                <p className="text-muted-foreground">Perfect for small teams</p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <Icon name="Check" size={20} className="text-success flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">Up to 10 team members</span>
                </li>
                <li className="flex items-start gap-3">
                  <Icon name="Check" size={20} className="text-success flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">All individual features</span>
                </li>
                <li className="flex items-start gap-3">
                  <Icon name="Check" size={20} className="text-success flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">Team workspace</span>
                </li>
                <li className="flex items-start gap-3">
                  <Icon name="Check" size={20} className="text-success flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">Company dashboard</span>
                </li>
                <li className="flex items-start gap-3">
                  <Icon name="Check" size={20} className="text-success flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">Shared collections</span>
                </li>
                <li className="flex items-start gap-3">
                  <Icon name="Check" size={20} className="text-success flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">Team chat & messaging</span>
                </li>
              </ul>

              <Link to="/company-creation">
                <Button variant="primary" size="lg" className="w-full" iconName="Building">
                  Create Company Account
                </Button>
              </Link>
            </div>

            <div className="bg-card rounded-lg shadow-lg p-8 border border-border">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-foreground mb-2">Enterprise</h3>
                <div className="text-4xl font-bold text-foreground mb-2">Custom</div>
                <p className="text-muted-foreground">For larger organizations</p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <Icon name="Check" size={20} className="text-success flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">More than 10 team members</span>
                </li>
                <li className="flex items-start gap-3">
                  <Icon name="Check" size={20} className="text-success flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">Everything in Free Company Plan</span>
                </li>
                <li className="flex items-start gap-3">
                  <Icon name="Check" size={20} className="text-success flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">Dedicated support</span>
                </li>
                <li className="flex items-start gap-3">
                  <Icon name="Check" size={20} className="text-success flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">Custom integrations</span>
                </li>
                <li className="flex items-start gap-3">
                  <Icon name="Check" size={20} className="text-success flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">Advanced analytics</span>
                </li>
                <li className="flex items-start gap-3">
                  <Icon name="Check" size={20} className="text-success flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">Priority features</span>
                </li>
              </ul>

              <Button
                onClick={handleContactSales}
                variant="outline"
                size="lg"
                className="w-full"
                iconName="Mail"
              >
                Contact Sales
              </Button>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="bg-card rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-foreground mb-2">Will HyvHub always be free?</h3>
              <p className="text-muted-foreground">
                Currently, all features are free while we develop and improve the platform. We'll announce any changes well in advance and existing users will get special benefits.
              </p>
            </div>
            <div className="bg-card rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-foreground mb-2">What happens after 10 users?</h3>
              <p className="text-muted-foreground">
                Companies can add up to 10 users for free. If you need more users, contact our sales team to discuss custom enterprise solutions.
              </p>
            </div>
            <div className="bg-card rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-foreground mb-2">Are there any limits?</h3>
              <p className="text-muted-foreground">
                No! Enjoy unlimited snippets, storage, and AI analysis. The only limit is 10 team members per company on the free tier.
              </p>
            </div>
            <div className="bg-card rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-foreground mb-2">When will premium features launch?</h3>
              <p className="text-muted-foreground">
                We're focused on building the best experience first. Premium features will be announced in the future, and early users will receive exclusive benefits.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Coding?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of developers already using HyvHub to manage, share, and collaborate on code - completely free!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              onClick={handleGetStarted}
              variant="secondary"
              size="lg"
              className="bg-card text-primary hover:bg-primary/10"
              iconName="Rocket"
            >
              Get Started Free
            </Button>
            <Button
              onClick={handleContactSales}
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-card hover:text-primary"
              iconName="Mail"
            >
              Contact Us
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;