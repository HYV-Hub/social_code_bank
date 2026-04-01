import React from 'react';
import Icon from '../../../components/AppIcon';

const ContactMethods = () => {
  const contactMethods = [
    {
      icon: 'Mail',
      title: 'Email Support',
      description: 'Get help via email within 24 hours',
      contact: 'blackhoundproducts@gmail.com',
      action: 'Send Email',
      actionType: 'email'
    },
    {
      icon: 'Phone',
      title: 'Phone Support',
      description: 'Mon-Fri, 9 AM - 6 PM EST',
      contact: '07807454439',
      action: 'Call Now',
      actionType: 'phone'
    },
    {
      icon: 'Users',
      title: 'Community Forum',
      description: 'Connect with other developers',
      contact: 'Join Discussion',
      action: 'Visit Forum',
      actionType: 'forum'
    }
  ];

  const handleAction = (method) => {
    switch(method?.actionType) {
      case 'email':
        window.location.href = `mailto:${method?.contact}`;
        break;
      case 'phone':
        window.location.href = `tel:${method?.contact}`;
        break;
      case 'forum':
        console.log('Opening community forum...');
        break;
      default:
        break;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {contactMethods?.map((method, index) => (
        <div
          key={index}
          className="bg-card dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow"
        >
          <div className="w-12 h-12 bg-primary/15 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
            <Icon name={method?.icon} size={24} className="text-primary dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-[var(--color-foreground)] mb-2">
            {method?.title}
          </h3>
          <p className="text-sm text-[var(--color-muted-foreground)] mb-3">
            {method?.description}
          </p>
          <p className="text-sm font-medium text-primary dark:text-blue-400 mb-4">
            {method?.contact}
          </p>
          <button
            onClick={() => handleAction(method)}
            className="w-full px-4 py-2 bg-primary hover:bg-primary text-white rounded-lg transition-colors text-sm font-medium"
          >
            {method?.action}
          </button>
        </div>
      ))}
    </div>
  );
};

export default ContactMethods;