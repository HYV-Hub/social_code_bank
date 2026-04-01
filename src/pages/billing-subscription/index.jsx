import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Users, Gift } from 'lucide-react';
import AppShell from '../../components/AppShell';
import Button from '../../components/ui/Button';

const BillingSubscriptionPage = () => {
  const navigate = useNavigate();

  return (
    <AppShell pageTitle="Billing">
      <Helmet>
        <title>Subscription - HyvHub</title>
      </Helmet>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Your Subscription</h1>
            <p className="mt-2 text-muted-foreground">Currently enjoying full access to HyvHub</p>
          </div>

          {/* Current Plan Status */}
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-lg p-8 text-white mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Gift size={32} />
              <div>
                <h2 className="text-2xl font-bold">Free Access</h2>
                <p className="text-green-100">All features included</p>
              </div>
            </div>
            <div className="bg-card/20 rounded-lg p-4 backdrop-blur-sm">
              <div className="grid md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-3xl font-bold mb-1">∞</div>
                  <div className="text-sm text-green-100">Code Snippets</div>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-1">∞</div>
                  <div className="text-sm text-green-100">Storage</div>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-1">∞</div>
                  <div className="text-sm text-green-100">AI Analysis</div>
                </div>
              </div>
            </div>
          </div>

          {/* Features Card */}
          <div className="bg-card rounded-lg shadow-sm border border-border p-8 mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-6">
              What You Get
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Sparkles size={20} className="text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-foreground">Unlimited Snippets</h3>
                    <p className="text-sm text-muted-foreground">Create and save as many code snippets as you need</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Sparkles size={20} className="text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-foreground">AI-Powered Analysis</h3>
                    <p className="text-sm text-muted-foreground">Get intelligent code insights and suggestions</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Sparkles size={20} className="text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-foreground">Team Collaboration</h3>
                    <p className="text-sm text-muted-foreground">Work together with your team seamlessly</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Sparkles size={20} className="text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-foreground">Unlimited Storage</h3>
                    <p className="text-sm text-muted-foreground">No limits on what you can store</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Sparkles size={20} className="text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-foreground">Version History</h3>
                    <p className="text-sm text-muted-foreground">Track and restore previous versions</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Sparkles size={20} className="text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-foreground">Advanced Search</h3>
                    <p className="text-sm text-muted-foreground">Find anything instantly with powerful search</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Company Limits */}
          <div className="bg-primary/10 rounded-lg border border-primary/20 p-6 mb-8">
            <div className="flex items-start gap-4">
              <Users size={24} className="text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-foreground mb-2">Company Plan Information</h3>
                <p className="text-foreground mb-3">
                  Companies can add up to <strong>10 team members for free</strong>. Need to add more users to your team?
                </p>
                <Button
                  onClick={() => navigate('/contact')}
                  variant="primary"
                  size="sm"
                  iconName="Mail"
                >
                  Contact Sales Team
                </Button>
              </div>
            </div>
          </div>

          {/* Future Plans Notice */}
          <div className="bg-card rounded-lg shadow-sm border border-border p-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              About Future Premium Features
            </h2>
            <p className="text-muted-foreground mb-4">
              HyvHub is currently free for all users as we continue to develop and improve the platform. 
              When we introduce premium features in the future, you'll be notified well in advance.
            </p>
            <p className="text-muted-foreground">
              As an early user, you'll receive special benefits and exclusive offers when premium tiers become available.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <Button
              onClick={() => navigate('/user-dashboard')}
              variant="primary"
              iconName="Home"
            >
              Go to Dashboard
            </Button>
            <Button
              onClick={() => navigate('/pricing')}
              variant="outline"
              iconName="Info"
            >
              Learn More About Plans
            </Button>
          </div>
    </AppShell>
  );
};

export default BillingSubscriptionPage;