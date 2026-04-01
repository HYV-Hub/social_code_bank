import React from 'react';
import Icon from '../../../components/AppIcon';

const SocialLinks = () => {
  const socialPlatforms = [
    {
      name: 'Twitter',
      handle: '@HyvHub',
      followers: '12.5K',
      description: 'Follow us for product updates, tips, and community highlights',
      url: 'https://twitter.com/hyvhub',
      icon: 'Twitter',
      color: 'from-blue-400 to-blue-600'
    },
    {
      name: 'GitHub',
      handle: 'hyvhub',
      followers: '8.2K',
      description: 'Star our repos, contribute, and explore our open-source projects',
      url: 'https://github.com/hyvhub',
      icon: 'Github',
      color: 'from-gray-600 to-gray-800'
    },
    {
      name: 'LinkedIn',
      handle: 'HyvHub',
      followers: '15.3K',
      description: 'Connect with us for company news, careers, and professional networking',
      url: 'https://linkedin.com/company/hyvhub',
      icon: 'Linkedin',
      color: 'from-blue-600 to-blue-800'
    },
    {
      name: 'Discord',
      handle: 'HyvHub Community',
      followers: '5.7K',
      description: 'Join our developer community for real-time discussions and support',
      url: 'https://discord.gg/hyvhub',
      icon: 'MessageCircle',
      color: 'from-indigo-500 to-indigo-700'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-foreground)] mb-3">
          Connect With Us on Social Media
        </h2>
        <p className="text-[var(--color-muted-foreground)]">
          Stay updated and engage with our community across multiple platforms
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {socialPlatforms?.map((platform, index) => (
          <a
            key={index}
            href={platform?.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-card dark:bg-slate-800 rounded-xl p-6 border border-[var(--color-border)] hover:shadow-lg transition-all hover:-translate-y-1"
          >
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${platform?.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                <Icon name={platform?.icon} size={24} color="white" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-[var(--color-foreground)] group-hover:text-primary dark:group-hover:text-blue-400 transition-colors">
                    {platform?.name}
                  </h3>
                  <Icon 
                    name="ExternalLink" 
                    size={14} 
                    className="text-[var(--color-muted-foreground)] group-hover:text-primary dark:group-hover:text-blue-400 transition-colors"
                  />
                </div>
                
                <p className="text-sm text-[var(--color-muted-foreground)] mb-2">
                  {platform?.handle}
                </p>
                
                <p className="text-xs text-[var(--color-muted-foreground)] mb-3">
                  {platform?.description}
                </p>
                
                <div className="flex items-center gap-1 text-xs text-[var(--color-muted-foreground)]">
                  <Icon name="Users" size={12} />
                  <span>{platform?.followers} followers</span>
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>
      {/* Newsletter Signup */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-8 border border-primary/20 dark:border-blue-800">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary rounded-full mb-4">
            <Icon name="Mail" size={24} color="white" />
          </div>
          
          <h3 className="text-xl font-bold text-[var(--color-foreground)] mb-2">
            Subscribe to Our Newsletter
          </h3>
          
          <p className="text-sm text-[var(--color-muted-foreground)] mb-6">
            Get the latest updates, tips, and exclusive content delivered to your inbox weekly
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-2 bg-card dark:bg-slate-800 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-[var(--color-foreground)]"
            />
            <button className="px-6 py-2 bg-primary hover:bg-primary text-white font-medium rounded-lg transition-colors whitespace-nowrap">
              Subscribe
            </button>
          </div>
          
          <p className="text-xs text-[var(--color-muted-foreground)] mt-3">
            Unsubscribe anytime. We respect your privacy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SocialLinks;