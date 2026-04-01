import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../../components/AppShell';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Icon from '../../components/AppIcon';

const HelpCenterPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  const categories = [
    { id: 'all', name: 'All Topics', icon: 'Grid' },
    { id: 'getting-started', name: 'Getting Started', icon: 'Rocket' },
    { id: 'snippets', name: 'Code Snippets', icon: 'Code' },
    { id: 'ai-features', name: 'AI Features', icon: 'Sparkles' },
    { id: 'teams', name: 'Teams & Collaboration', icon: 'Users' },
    { id: 'account', name: 'Account & Billing', icon: 'CreditCard' },
    { id: 'security', name: 'Security & Privacy', icon: 'Shield' }
  ];

  const faqs = [
    {
      category: 'getting-started',
      question: 'How do I create my first code snippet?',
      answer: 'To create your first snippet, click the "+" button in the navigation bar or go to the Create Snippet page. Add your code, provide a title and description, select the programming language, and click "Save Snippet". Your snippet will be analyzed by our AI for quality insights.'
    },
    {
      category: 'getting-started',
      question: 'What is the onboarding process?',
      answer: 'After signing up, you\'ll be guided through a 4-step onboarding process: (1) Complete your profile with username and bio, (2) Add your skills and interests, (3) Set notification preferences, and (4) Review and complete setup. This helps personalize your HyvHub experience.'
    },
    {
      category: 'snippets',
      question: 'How does snippet versioning work?',
      answer: 'Every time you update a snippet, HyvHub automatically creates a new version. You can view version history, compare changes, and restore previous versions from the snippet details page. This helps track code evolution and maintain audit trails.'
    },
    {
      category: 'snippets',
      question: 'Can I make my snippets private?',
      answer: 'Yes! When creating or editing a snippet, you can set visibility to Public (everyone), Team Only (your team members), or Private (only you). You can change visibility settings at any time from the snippet editor.'
    },
    {
      category: 'ai-features',
      question: 'What AI features does HyvHub offer?',
      answer: 'HyvHub uses OpenAI GPT-4 to provide: (1) Code quality scoring (0-100), (2) Automatic tagging and categorization, (3) Security vulnerability detection, (4) Performance optimization suggestions, (5) Best practices recommendations, and (6) Company coding style matching.'
    },
    {
      category: 'ai-features',
      question: 'How accurate is the AI code analysis?',
      answer: 'Our AI analysis is powered by OpenAI GPT-4 and is highly accurate for common programming languages. It analyzes syntax, security patterns, performance issues, and coding standards. However, always review AI suggestions as they are recommendations, not absolute rules.'
    },
    {
      category: 'teams',
      question: 'How do I create or join a team?',
      answer: 'To create a team, go to Company Dashboard and click "Create Team". To join a team, you need an invitation from a team admin. Once invited, you\'ll receive a notification and can accept from your notifications page or the invite acceptance link.'
    },
    {
      category: 'teams',
      question: 'What are team roles and permissions?',
      answer: 'HyvHub has three roles: (1) Admin - full control including team management, (2) Member - can create and share snippets, participate in reviews, (3) Viewer - read-only access to team snippets. Admins can change member roles anytime.'
    },
    {
      category: 'account',
      question: 'How do I change my password?',
      answer: 'Go to Settings > Security tab, enter your current password, new password, and confirm. Passwords must be at least 8 characters. If you forgot your password, use the "Forgot Password" link on the login page to reset via email.'
    },
    {
      category: 'account',
      question: 'What subscription plans are available?',
      answer: 'HyvHub offers: (1) Free - 10 snippets, basic features, (2) Pro ($9.99/month) - unlimited snippets, advanced AI, priority support, (3) Team ($29.99/month) - team collaboration, company dashboard, custom integrations. See the Pricing page for full details.'
    },
    {
      category: 'security',
      question: 'How is my code secured?',
      answer: 'Your code is stored in Supabase with enterprise-grade security: (1) End-to-end encryption, (2) Row Level Security (RLS) policies, (3) Regular security audits, (4) GDPR compliance, (5) Private snippets are never shared, (6) All data transfers use HTTPS.'
    },
    {
      category: 'security',
      question: 'Who can see my private snippets?',
      answer: 'Private snippets are only visible to you. Team snippets are visible to team members only. Public snippets are searchable by everyone. You control visibility for each snippet independently. Even admins cannot access your private snippets without explicit permission.'
    }
  ];

  const quickLinks = [
    { title: 'Getting Started Guide', description: 'Learn the basics of HyvHub', icon: 'BookOpen', link: '/features' },
    { title: 'API Documentation', description: 'Integrate HyvHub with your tools', icon: 'Code', link: '/api-documentation' },
    { title: 'Video Tutorials', description: 'Watch step-by-step guides', icon: 'Video', link: '#' },
    { title: 'Community Forum', description: 'Connect with other developers', icon: 'MessageCircle', link: '#' },
    { title: 'Report a Bug', description: 'Help us improve HyvHub', icon: 'Bug', link: '/bug-board' },
    { title: 'Contact Support', description: 'Get help from our team', icon: 'Mail', link: '/contact' }
  ];

  const filteredFAQs = faqs?.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq?.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      faq?.question?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
      faq?.answer?.toLowerCase()?.includes(searchQuery?.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <AppShell pageTitle="Help">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Help Center</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Find answers to common questions and learn how to make the most of HyvHub
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Icon 
              name="Search" 
              size={20} 
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground"
            />
            <Input
              type="text"
              placeholder="Search for help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e?.target?.value)}
              className="pl-12 py-4 text-lg"
            />
          </div>
        </div>

        {/* Quick Links */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Quick Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickLinks?.map((link, index) => (
              <Link
                key={index}
                to={link?.link}
                className="bg-card rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/15 rounded-lg flex items-center justify-center group-hover:bg-primary/25 transition-colors">
                    <Icon name={link?.icon} size={24} className="text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                      {link?.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{link?.description}</p>
                  </div>
                  <Icon name="ChevronRight" size={20} className="text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {categories?.map((category) => (
              <button
                key={category?.id}
                onClick={() => setSelectedCategory(category?.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === category?.id
                    ? 'bg-primary text-white' :'bg-card text-foreground hover:bg-background'
                }`}
              >
                <Icon name={category?.icon} size={18} />
                {category?.name}
              </button>
            ))}
          </div>
        </div>

        {/* FAQs */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Frequently Asked Questions
            {searchQuery && ` (${filteredFAQs?.length} results)`}
          </h2>
          <div className="space-y-4">
            {filteredFAQs?.length === 0 ? (
              <div className="bg-card rounded-lg shadow-sm p-8 text-center">
                <Icon name="Search" size={48} className="text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No results found</h3>
                <p className="text-muted-foreground">Try adjusting your search or browse by category</p>
              </div>
            ) : (
              filteredFAQs?.map((faq, index) => (
                <div key={index} className="bg-card rounded-lg shadow-sm overflow-hidden">
                  <button
                    onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                    className="w-full flex items-center justify-between p-6 text-left hover:bg-background transition-colors"
                  >
                    <span className="font-semibold text-foreground pr-4">{faq?.question}</span>
                    <Icon 
                      name={expandedFAQ === index ? 'ChevronUp' : 'ChevronDown'} 
                      size={20} 
                      className="text-muted-foreground flex-shrink-0"
                    />
                  </button>
                  {expandedFAQ === index && (
                    <div className="px-6 pb-6">
                      <p className="text-muted-foreground leading-relaxed">{faq?.answer}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Contact Support */}
        <div className="bg-primary rounded-lg shadow-lg p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Still need help?</h2>
          <p className="text-white/80 mb-6 max-w-2xl mx-auto">
            Our support team is here to help you with any questions or issues you may have.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/contact">
              <Button variant="secondary" iconName="Mail" iconPosition="left">
                Contact Support
              </Button>
            </Link>
            <Button variant="outline" iconName="MessageCircle" iconPosition="left" className="bg-card text-primary hover:bg-primary/10">
              Start Live Chat
            </Button>
          </div>
        </div>
    </AppShell>
  );
};

export default HelpCenterPage;