import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const TrendingSnippetsSection = () => {
  const capabilities = [
    {
      icon: 'Code2',
      title: 'Code Snippet Library',
      description: 'Create, organize, and share code snippets across multiple programming languages with syntax highlighting.',
      features: ['Multi-language support', 'Syntax highlighting', 'Version control', 'Code search']
    },
    {
      icon: 'Users',
      title: 'Team Workspaces',
      description: 'Collaborate with your team in shared workspaces with real-time updates and access controls.',
      features: ['Team channels', 'Role-based access', 'Real-time sync', 'Activity tracking']
    },
    {
      icon: 'Bug',
      title: 'Bug Management',
      description: 'Track bugs efficiently with kanban boards, priority levels, and team assignment features.',
      features: ['Kanban boards', 'Priority tracking', 'Assignment system', 'Status workflows']
    }
  ];

  return (
    <section className="py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 mb-6">
            <Icon name="Zap" size={16} color="var(--color-primary)" />
            <span className="text-sm font-medium text-[var(--color-primary)]">
              Core Capabilities
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--color-foreground)] mb-4">
            Everything You Need to Code Smarter
          </h2>
          <p className="text-lg text-[var(--color-muted-foreground)] max-w-2xl mx-auto">
            Powerful features designed to streamline your development workflow
          </p>
        </div>

        {/* Capabilities Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {capabilities?.map((capability, index) => (
            <div
              key={index}
              className="bg-card dark:bg-slate-800 rounded-xl border border-[var(--color-border)] overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              {/* Card Header */}
              <div className="p-8 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-700 dark:to-slate-800 border-b border-[var(--color-border)]">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] mb-4">
                  <Icon name={capability?.icon} size={28} color="white" />
                </div>
                <h3 className="text-2xl font-bold text-[var(--color-foreground)] mb-3">
                  {capability?.title}
                </h3>
                <p className="text-[var(--color-muted-foreground)]">
                  {capability?.description}
                </p>
              </div>

              {/* Features List */}
              <div className="p-8">
                <ul className="space-y-3">
                  {capability?.features?.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-success/15 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                        <Icon name="Check" size={14} color="var(--color-success)" />
                      </div>
                      <span className="text-[var(--color-foreground)]">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-700 rounded-xl p-12 border border-[var(--color-border)]">
          <h3 className="text-2xl font-bold text-[var(--color-foreground)] mb-4">
            Ready to Transform Your Workflow?
          </h3>
          <p className="text-[var(--color-muted-foreground)] mb-6 max-w-2xl mx-auto">
            Join HyvHub today and experience a better way to organize and share code
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" iconName="Sparkles" iconPosition="left">
                Start Free Trial
              </Button>
            </Link>
            <Link to="/public-feed">
              <Button size="lg" variant="outline" iconName="Eye" iconPosition="left">
                View Demo
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrendingSnippetsSection;