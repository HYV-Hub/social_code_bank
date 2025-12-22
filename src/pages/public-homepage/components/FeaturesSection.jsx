import React from 'react';
import Icon from '../../../components/AppIcon';

const FeaturesSection = () => {
  const features = [
    {
      icon: 'Code2',
      title: 'Smart Snippet Sharing',
      description: 'Share code snippets with your team or the community. AI-powered tagging and organization makes finding the right code effortless.',
      color: 'blue'
    },
    {
      icon: 'Bug',
      title: 'Efficient Bug Tracking',
      description: 'Track bugs with before/after code comparisons. Collaborate on fixes with your team and approve solutions with confidence.',
      color: 'red'
    },
    {
      icon: 'Users',
      title: 'Team Collaboration',
      description: 'Create company workspaces, organize teams, and collaborate seamlessly. Role-based permissions ensure secure code sharing.',
      color: 'green'
    },
    {
      icon: 'Sparkles',
      title: 'AI-Powered Analysis',
      description: 'Get instant AI feedback on code quality, optimization suggestions, and automatic bug detection. Improve your code with intelligent insights.',
      color: 'purple'
    },
    {
      icon: 'TrendingUp',
      title: 'Public Discovery',
      description: 'Explore trending snippets, follow top contributors, and discover solutions from the community. Build your developer reputation.',
      color: 'orange'
    },
    {
      icon: 'Shield',
      title: 'Enterprise Security',
      description: 'Advanced permission controls, audit logs, and content review tools. Keep your proprietary code secure while collaborating.',
      color: 'indigo'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
      red: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
      green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
      purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
      orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
      indigo: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
    };
    return colors?.[color] || colors?.blue;
  };

  return (
    <section className="py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 mb-6">
            <Icon name="Zap" size={16} color="var(--color-primary)" />
            <span className="text-sm font-medium text-[var(--color-primary)]">
              Powerful Features
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--color-foreground)] mb-4">
            Everything You Need to
            <br />
            <span className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] bg-clip-text text-transparent">
              Code Better Together
            </span>
          </h2>
          <p className="text-lg text-[var(--color-muted-foreground)] max-w-2xl mx-auto">
            From snippet sharing to bug tracking, we've built the complete toolkit 
            for modern development teams
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features?.map((feature, index) => (
            <div
              key={index}
              className="group bg-white dark:bg-slate-800 rounded-2xl p-8 border border-[var(--color-border)] hover:shadow-xl hover:border-[var(--color-primary)]/50 transition-all duration-300"
            >
              <div className={`w-14 h-14 rounded-xl ${getColorClasses(feature?.color)} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <Icon name={feature?.icon} size={28} />
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

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-[var(--color-muted-foreground)] mb-4">
            Want to see all features in action?
          </p>
          <a 
            href="/features" 
            className="inline-flex items-center gap-2 text-[var(--color-primary)] hover:underline font-semibold"
          >
            <span>View Complete Feature List</span>
            <Icon name="ArrowRight" size={16} />
          </a>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;