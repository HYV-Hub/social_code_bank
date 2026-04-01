import React from 'react';
import { Award, Trophy, Medal, Crown, Star, Zap } from 'lucide-react';
import Icon from '../../../components/AppIcon';


const AchievementShowcase = () => {
  const achievements = [
    {
      name: 'Code Master',
      description: '100+ snippets created',
      icon: Crown,
      color: 'bg-warning/100',
      requirement: '100 snippets'
    },
    {
      name: 'Bug Terminator',
      description: '50+ bugs fixed',
      icon: Trophy,
      color: 'bg-error/100',
      requirement: '50 bug fixes'
    },
    {
      name: 'Legend Status',
      description: '1000+ points earned',
      icon: Star,
      color: 'bg-primary/100',
      requirement: '1000 points'
    },
    {
      name: 'Mentor Elite',
      description: '50+ followers',
      icon: Medal,
      color: 'bg-success/100',
      requirement: '50 followers'
    },
    {
      name: 'Code Expert',
      description: '50+ snippets created',
      icon: Award,
      color: 'bg-primary',
      requirement: '50 snippets'
    },
    {
      name: 'Rising Star',
      description: '500+ points earned',
      icon: Zap,
      color: 'bg-orange-500',
      requirement: '500 points'
    }
  ];

  return (
    <div className="mt-12 bg-card rounded-xl shadow-sm p-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">
          Achievement Badges
        </h2>
        <p className="text-muted-foreground">
          Unlock these prestigious badges by contributing to the community
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {achievements?.map((achievement, index) => {
          const Icon = achievement?.icon;
          
          return (
            <div
              key={index}
              className="text-center group cursor-pointer"
            >
              {/* Badge Icon */}
              <div className={`
                w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-3
                ${achievement?.color} text-white shadow-lg
                group-hover:scale-110 group-hover:shadow-xl
                transition-all duration-300
              `}>
                <Icon className="w-10 h-10" />
              </div>
              {/* Badge Name */}
              <h3 className="font-semibold text-foreground mb-1 text-sm">
                {achievement?.name}
              </h3>
              {/* Description */}
              <p className="text-xs text-muted-foreground mb-2">
                {achievement?.description}
              </p>
              {/* Requirement */}
              <div className="bg-muted rounded-full px-3 py-1 text-xs text-foreground font-medium inline-block">
                {achievement?.requirement}
              </div>
            </div>
          );
        })}
      </div>
      {/* Call to Action */}
      <div className="mt-10 text-center">
        <p className="text-muted-foreground mb-4">
          Start contributing today and earn your place on the leaderboard!
        </p>
        <button 
          onClick={() => window.location.href = '/create-snippet'}
          className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary transition-colors duration-200"
        >
          Create Your First Snippet
        </button>
      </div>
    </div>
  );
};

export default AchievementShowcase;