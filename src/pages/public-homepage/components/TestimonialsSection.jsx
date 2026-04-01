import React from 'react';
import Icon from '../../../components/AppIcon';
import { Link } from 'react-router-dom';
import Button from '../../../components/ui/Button';

const TestimonialsSection = () => {
  const features = [
    {
      icon: 'Code2',
      title: 'Smart Code Organization',
      description: 'Organize your code snippets with AI-powered tagging and intelligent search capabilities.',
      color: 'text-primary'
    },
    {
      icon: 'Users',
      title: 'Team Collaboration',
      description: 'Collaborate seamlessly with your team through shared workspaces and real-time updates.',
      color: 'text-primary'
    },
    {
      icon: 'Bug',
      title: 'Bug Tracking',
      description: 'Track and resolve bugs efficiently with our integrated kanban-style bug board.',
      color: 'text-error'
    },
    {
      icon: 'Sparkles',
      title: 'AI Code Analysis',
      description: 'Get intelligent insights and suggestions powered by advanced AI technology.',
      color: 'text-warning'
    },
    {
      icon: 'Lock',
      title: 'Privacy Controls',
      description: 'Full control over snippet visibility - keep them private, share with team, or make public.',
      color: 'text-success'
    },
    {
      icon: 'Zap',
      title: 'Lightning Fast',
      description: 'Built for performance with instant search and real-time synchronization.',
      color: 'text-orange-600'
    }
  ];

  return (
    <section className="py-20 lg:py-32 bg-gradient-to-b from-white to-blue-50/30 dark:from-slate-900 dark:to-slate-800/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 mb-6">
            <Icon name="Rocket" size={16} color="var(--color-primary)" />
            <span className="text-sm font-medium text-[var(--color-primary)]">
              Beta Launch Features
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--color-foreground)] mb-4">
            Built for Modern Developers
          </h2>
          <p className="text-lg text-[var(--color-muted-foreground)] max-w-2xl mx-auto">
            Everything you need to organize, share, and collaborate on code - all in one place
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features?.map((feature, index) => (
            <div
              key={index}
              className="bg-card dark:bg-slate-800 rounded-xl p-8 border border-[var(--color-border)] hover:shadow-xl transition-all duration-300 group"
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${feature?.color?.replace('text-', 'bg-')}/10 mb-4 group-hover:scale-110 transition-transform`}>
                <Icon name={feature?.icon} size={24} color={`var(--color-${feature?.color?.replace('text-', '')})`} />
              </div>
              <h3 className="text-xl font-bold text-[var(--color-foreground)] mb-3">
                {feature?.title}
              </h3>
              <p className="text-[var(--color-muted-foreground)] leading-relaxed">
                {feature?.description}
              </p>
            </div>
          ))}
        </div>

        {/* Beta Call to Action */}
        <div className="bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] rounded-3xl p-12 text-center text-white">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/20 backdrop-blur-sm mb-6">
              <Icon name="Users" size={16} />
              <span className="text-sm font-medium">
                Join the Beta Program
              </span>
            </div>
            <h3 className="text-3xl sm:text-4xl font-bold mb-4">
              Be Part of Our Launch Story
            </h3>
            <p className="text-lg mb-8 opacity-90">
              Sign up now and get early access to all features. Your feedback will help shape HyvHub's future.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" variant="secondary" iconName="Sparkles" iconPosition="left">
                  Get Started Free
                </Button>
              </Link>
              <Link to="/features">
                <Button size="lg" variant="ghost" className="text-white border-white hover:bg-card/10" iconName="ArrowRight" iconPosition="right">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;