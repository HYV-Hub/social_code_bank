import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { AppImage } from '../../../components/AppImage';

const HeroSection = () => {
  return (
    <section className="relative bg-background pt-20 pb-24 overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/30 dark:bg-blue-900/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200/30 dark:bg-purple-900/20 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <AppImage 
              src="public/assets/images/ChatGPT_Image_Nov_20_2025_12_07_46_PM-1763647303691.png" 
              alt="HyvHub Logo - Bee with honeycomb hexagon pattern representing productivity and technology"
              className="w-24 h-24 object-contain animate-bounce-slow"
            />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
            Welcome to <span className="text-primary">HyvHub</span>
          </h1>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 mb-6">
              <Icon name="Sparkles" size={16} color="var(--color-primary)" />
              <span className="text-sm font-medium text-[var(--color-primary)]">
                Now in Beta - Join the Launch!
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--color-foreground)] mb-6">
              Share Code,
              <br />
              <span className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] bg-clip-text text-transparent">
                Collaborate Smarter
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg text-[var(--color-muted-foreground)] mb-8 max-w-2xl">
              The ultimate platform for developers to share code snippets, track bugs efficiently, 
              and collaborate with teams. Powered by AI for intelligent code analysis and optimization.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
              <Link to="/register">
                <Button size="lg" iconName="Rocket" iconPosition="left">
                  Be an Early Adopter
                </Button>
              </Link>
              <Link to="/public-feed">
                <Button variant="outline" size="lg" iconName="Eye" iconPosition="left">
                  Explore Features
                </Button>
              </Link>
            </div>

            {/* Beta Launch Message */}
            <div className="inline-flex items-center gap-2 px-4 py-3 bg-primary/10 dark:bg-blue-900/20 rounded-lg border border-primary/20 dark:border-blue-800">
              <Icon name="Sparkles" size={18} color="var(--color-primary)" />
              <p className="text-sm text-[var(--color-foreground)]">
                <span className="font-semibold">Fresh Launch:</span> Be among the first to shape HyvHub's future
              </p>
            </div>
          </div>

          {/* Right Content - Visual */}
          <div className="relative">
            <div className="relative bg-card dark:bg-slate-800 rounded-xl shadow-2xl border border-[var(--color-border)] p-6">
              {/* Code Editor Mock */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-4 border-b border-[var(--color-border)]">
                  <div className="w-3 h-3 rounded-full bg-error/100" />
                  <div className="w-3 h-3 rounded-full bg-warning/100" />
                  <div className="w-3 h-3 rounded-full bg-success/100" />
                  <span className="ml-4 text-sm font-mono text-[var(--color-muted-foreground)]">
                    snippet.js
                  </span>
                </div>
                
                <div className="font-mono text-sm space-y-2">
                  <div className="text-primary dark:text-purple-400">
                    <span className="text-[var(--color-muted-foreground)]">1</span> 
                    <span className="ml-4">const</span> 
                    <span className="text-primary dark:text-blue-400"> calculateTotal</span> 
                    <span className="text-[var(--color-foreground)]"> = (items) =&gt; {"{"}</span>
                  </div>
                  <div className="text-[var(--color-foreground)]">
                    <span className="text-[var(--color-muted-foreground)]">2</span>
                    <span className="ml-8">return</span>
                    <span className="text-primary dark:text-blue-400"> items.reduce</span>
                    <span>(</span>
                  </div>
                  <div className="text-[var(--color-foreground)]">
                    <span className="text-[var(--color-muted-foreground)]">3</span>
                    <span className="ml-12">(sum, item) =&gt; sum +</span>
                    <span className="text-primary dark:text-blue-400"> item.price</span>
                    <span>, 0</span>
                  </div>
                  <div className="text-[var(--color-foreground)]">
                    <span className="text-[var(--color-muted-foreground)]">4</span>
                    <span className="ml-8">);</span>
                  </div>
                  <div className="text-[var(--color-foreground)]">
                    <span className="text-[var(--color-muted-foreground)]">5</span>
                    <span className="ml-4">{"}"};</span>
                  </div>
                </div>

                {/* Interaction Buttons - Functional but clean */}
                <div className="flex items-center gap-4 pt-4 border-t border-[var(--color-border)]">
                  <button className="flex items-center gap-2 text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]">
                    <Icon name="Heart" size={16} />
                    <span>Like</span>
                  </button>
                  <button className="flex items-center gap-2 text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]">
                    <Icon name="MessageCircle" size={16} />
                    <span>Comment</span>
                  </button>
                  <button className="flex items-center gap-2 text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]">
                    <Icon name="Bookmark" size={16} />
                    <span>Save</span>
                  </button>
                </div>
              </div>

              {/* AI Badge Overlay */}
              <div className="absolute -top-4 -right-4 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                <Icon name="Sparkles" size={16} />
                <span className="text-sm font-semibold">AI Powered</span>
              </div>
            </div>

            {/* Feature Badge */}
            <div className="absolute -bottom-6 -left-6 bg-card dark:bg-slate-800 rounded-xl shadow-lg border border-[var(--color-border)] p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-success/15 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <Icon name="Zap" size={20} color="var(--color-success)" />
              </div>
              <div>
                <div className="text-sm font-semibold text-[var(--color-foreground)]">Lightning Fast</div>
                <div className="text-xs text-[var(--color-muted-foreground)]">Real-time collaboration</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;