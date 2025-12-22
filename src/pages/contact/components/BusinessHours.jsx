import React from 'react';
import Icon from '../../../components/AppIcon';

const BusinessHours = () => {
  const supportTiers = [
    {
      tier: 'Standard Support',
      description: 'For all users on Free and Basic plans',
      hours: 'Monday - Friday: 9:00 AM - 6:00 PM (Your Local Time)',
      responseTime: '24-48 hours',
      channels: ['Email', 'Contact Form'],
      icon: 'Mail'
    },
    {
      tier: 'Priority Support',
      description: 'For Pro plan subscribers',
      hours: 'Monday - Sunday: 8:00 AM - 10:00 PM (Your Local Time)',
      responseTime: '4-12 hours',
      channels: ['Email', 'Contact Form', 'Live Chat'],
      icon: 'Zap',
      highlight: true
    },
    {
      tier: 'Enterprise Support',
      description: 'For Enterprise customers',
      hours: '24/7 Availability with Dedicated Account Manager',
      responseTime: '< 1 hour for critical issues',
      channels: ['Email', 'Phone', 'Live Chat', 'Slack', 'Teams'],
      icon: 'Award'
    }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-[var(--color-foreground)] mb-4">
          Support Hours & Response Times
        </h2>
        <p className="text-[var(--color-muted-foreground)] max-w-2xl mx-auto">
          Our support availability varies by plan to ensure you get the level of service you need
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {supportTiers?.map((tier, index) => (
          <div
            key={index}
            className={`relative bg-white dark:bg-slate-800 rounded-xl p-6 border-2 ${
              tier?.highlight 
                ? 'border-blue-500 shadow-lg' 
                : 'border-[var(--color-border)]'
            }`}
          >
            {tier?.highlight && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-blue-500 text-white text-xs font-semibold rounded-full">
                Most Popular
              </div>
            )}

            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                tier?.highlight 
                  ? 'bg-gradient-to-br from-blue-500 to-purple-500' :'bg-gradient-to-br from-gray-400 to-gray-600'
              }`}>
                <Icon name={tier?.icon} size={24} color="white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[var(--color-foreground)]">
                  {tier?.tier}
                </h3>
              </div>
            </div>

            <p className="text-sm text-[var(--color-muted-foreground)] mb-4">
              {tier?.description}
            </p>

            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Icon name="Clock" size={16} className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-[var(--color-foreground)] mb-1">
                    Availability
                  </p>
                  <p className="text-xs text-[var(--color-muted-foreground)]">
                    {tier?.hours}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Icon name="Timer" size={16} className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-[var(--color-foreground)] mb-1">
                    Response Time
                  </p>
                  <p className="text-xs text-[var(--color-muted-foreground)]">
                    {tier?.responseTime}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Icon name="MessageSquare" size={16} className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-[var(--color-foreground)] mb-1">
                    Support Channels
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {tier?.channels?.map((channel, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded"
                      >
                        {channel}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Additional Info */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <Icon name="Info" size={20} className="text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-[var(--color-foreground)] mb-2">
              Holiday Support Schedule
            </h4>
            <p className="text-sm text-[var(--color-muted-foreground)] mb-2">
              During major holidays, our support hours may be reduced. Enterprise customers will be notified 
              in advance of any schedule changes and will maintain access to emergency support channels.
            </p>
            <p className="text-sm text-[var(--color-muted-foreground)]">
              For urgent issues outside business hours, Enterprise customers can reach our emergency hotline 
              at +1 (800) HYVHUB-911.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessHours;