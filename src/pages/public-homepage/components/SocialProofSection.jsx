import React from 'react';
import Icon from '../../../components/AppIcon';
import { Link } from 'react-router-dom';
import Button from '../../../components/ui/Button';

const SocialProofSection = () => {
  const benefits = [
    {
      icon: 'Shield',
      title: 'Secure & Private',
      description: 'Your code is protected with industry-standard encryption and granular access controls.'
    },
    {
      icon: 'Zap',
      title: 'Lightning Fast',
      description: 'Built for performance with instant search, real-time sync, and optimized infrastructure.'
    },
    {
      icon: 'Globe',
      title: 'Works Everywhere',
      description: 'Access your code from any device with our responsive web platform and seamless sync.'
    },
    {
      icon: 'Heart',
      title: 'Developer First',
      description: 'Built by developers, for developers. Every feature designed with your workflow in mind.'
    }
  ];

  const techStack = [
    { name: 'React', icon: 'Code2' },
    { name: 'Supabase', icon: 'Database' },
    { name: 'AI Powered', icon: 'Sparkles' },
    { name: 'Real-time', icon: 'Zap' }
  ];

  return (
    <section className="py-20 lg:py-32 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-foreground)] mb-4">
            Why Choose HyvHub?
          </h2>
          <p className="text-lg text-[var(--color-muted-foreground)] max-w-2xl mx-auto">
            A modern platform built with cutting-edge technology for today's developers
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {benefits?.map((benefit, index) => (
            <div
              key={index}
              className="text-center p-6 bg-white dark:bg-slate-800 rounded-2xl border border-[var(--color-border)] hover:shadow-lg transition-all duration-300"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] mb-4">
                <Icon name={benefit?.icon} size={24} color="white" />
              </div>
              <h3 className="text-lg font-bold text-[var(--color-foreground)] mb-2">
                {benefit?.title}
              </h3>
              <p className="text-sm text-[var(--color-muted-foreground)]">
                {benefit?.description}
              </p>
            </div>
          ))}
        </div>

        {/* Tech Stack */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-700 rounded-3xl p-12 border border-[var(--color-border)]">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-[var(--color-foreground)] mb-3">
              Built with Modern Technology
            </h3>
            <p className="text-[var(--color-muted-foreground)]">
              Powered by industry-leading tools and frameworks
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            {techStack?.map((tech, index) => (
              <div
                key={index}
                className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-800 rounded-xl border border-[var(--color-border)] hover:shadow-md transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center mb-3">
                  <Icon name={tech?.icon} size={24} color="white" />
                </div>
                <span className="font-semibold text-[var(--color-foreground)]">
                  {tech?.name}
                </span>
              </div>
            ))}
          </div>

          {/* Beta CTA */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm mb-4">
              <Icon name="Sparkles" size={16} color="var(--color-primary)" />
              <span className="text-sm font-medium text-[var(--color-foreground)]">
                Now in Beta - Free to Join
              </span>
            </div>
            <p className="text-[var(--color-muted-foreground)] mb-6 max-w-2xl mx-auto">
              Be among the first to experience HyvHub and help shape its future
            </p>
            <Link to="/register">
              <Button size="lg" iconName="Rocket" iconPosition="left">
                Join Beta Program
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialProofSection;