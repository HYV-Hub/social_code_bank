import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import NavigationBar from '../public-homepage/components/NavigationBar';
import Footer from '../public-homepage/components/Footer';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import { AppImage } from '../../components/AppImage';

const Features = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('code-management');

  const categories = [
    { id: 'code-management', label: 'Code Management', icon: 'Code' },
    { id: 'collaboration', label: 'Team Collaboration', icon: 'Users' },
    { id: 'ai-analysis', label: 'AI Analysis', icon: 'Brain' },
    { id: 'security', label: 'Security', icon: 'Shield' },
    { id: 'enterprise', label: 'Enterprise Tools', icon: 'Building' }
  ];

  const featuresByCategory = {
    'code-management': [
      {
        title: "Smart Code Storage",
        description: "Organize and store code snippets with intelligent categorization and tagging",
        benefits: ["Instant search across all snippets", "Automatic language detection", "Version control integration"],
        image: "/assets/images/no_image.png",
        alt: "Dashboard showing organized code snippets with intelligent categorization and tagging system"
      },
      {
        title: "Syntax Highlighting",
        description: "Beautiful syntax highlighting for 50+ programming languages",
        benefits: ["Enhanced readability", "Dark/light themes", "Custom color schemes"],
        image: "/assets/images/no_image.png",
        alt: "Code editor displaying multi-language syntax highlighting with various color themes"
      },
      {
        title: "Version Control",
        description: "Track changes and maintain complete history of your code snippets",
        benefits: ["Git-like versioning", "Compare versions side-by-side", "Rollback to any version"],
        image: "/assets/images/no_image.png",
        alt: "Version control interface showing code diff comparison and change history timeline"
      }
    ],
    'collaboration': [
      {
        title: "Real-time Collaboration",
        description: "Work together with your team on code snippets in real-time",
        benefits: ["Live cursors and edits", "Instant sync across devices", "Conflict resolution"],
        image: "/assets/images/no_image.png",
        alt: "Multiple developers collaborating on code with live cursor positions and real-time updates"
      },
      {
        title: "Team Workspaces",
        description: "Create dedicated spaces for different teams and projects",
        benefits: ["Custom access controls", "Team libraries", "Shared collections"],
        image: "/assets/images/no_image.png",
        alt: "Team workspace dashboard showing multiple project spaces with member access controls"
      },
      {
        title: "Code Reviews",
        description: "Built-in code review workflow with comments and suggestions",
        benefits: ["Inline commenting", "Approval workflows", "Review analytics"],
        image: "/assets/images/no_image.png",
        alt: "Code review interface with inline comments, suggestions, and approval workflow status"
      }
    ],
    'ai-analysis': [
      {
        title: "AI Code Optimization",
        description: "Get intelligent suggestions to improve your code quality and performance",
        benefits: ["Performance optimization tips", "Best practice recommendations", "Security vulnerability detection"],
        accuracy: "95% accuracy rate",
        image: "/assets/images/no_image.png",
        alt: "AI analysis dashboard showing code optimization suggestions and performance improvement metrics"
      },
      {
        title: "Smart Style Matching",
        description: "Automatically match your team\'s coding style and conventions",
        benefits: ["Consistent formatting", "Custom style rules", "Auto-correction"],
        accuracy: "98% style consistency",
        image: "/assets/images/no_image.png",
        alt: "Style matching interface displaying code formatting rules and consistency analysis"
      },
      {
        title: "Automated Tagging",
        description: "AI-powered automatic categorization and tagging of code snippets",
        benefits: ["Smart categorization", "Context-aware tags", "Custom tag rules"],
        accuracy: "92% tagging accuracy",
        image: "/assets/images/no_image.png",
        alt: "AI tagging system automatically categorizing code snippets with relevant metadata tags"
      }
    ],
    'security': [
      {
        title: "Enterprise-Grade Security",
        description: "Bank-level security with end-to-end encryption",
        benefits: ["256-bit AES encryption", "SOC 2 Type II certified", "GDPR compliant"],
        image: "/assets/images/no_image.png",
        alt: "Security dashboard showing encryption protocols, compliance certifications, and access logs"
      },
      {
        title: "Access Control",
        description: "Granular permissions and role-based access control",
        benefits: ["Custom role definitions", "IP whitelisting", "2FA authentication"],
        image: "/assets/images/no_image.png",
        alt: "Access control panel with role management, permissions matrix, and authentication settings"
      },
      {
        title: "Audit Logging",
        description: "Complete audit trail of all activities and changes",
        benefits: ["Detailed activity logs", "Compliance reporting", "Real-time alerts"],
        image: "/assets/images/no_image.png",
        alt: "Audit log interface displaying chronological activity trail with detailed event information"
      }
    ],
    'enterprise': [
      {
        title: "SSO Integration",
        description: "Seamless single sign-on with your existing identity provider",
        benefits: ["SAML 2.0 support", "Active Directory integration", "Okta, Azure AD compatible"],
        image: "/assets/images/no_image.png",
        alt: "SSO integration dashboard showing supported identity providers and configuration options"
      },
      {
        title: "API Access",
        description: "Robust REST API for custom integrations and automation",
        benefits: ["Comprehensive documentation", "Rate limiting", "Webhook support"],
        image: "/assets/images/no_image.png",
        alt: "API documentation interface with endpoint references, code examples, and testing tools"
      },
      {
        title: "Analytics & Insights",
        description: "Deep insights into team productivity and code usage patterns",
        benefits: ["Custom dashboards", "Export capabilities", "Trend analysis"],
        image: "/assets/images/no_image.png",
        alt: "Analytics dashboard displaying team productivity metrics, usage patterns, and trend graphs"
      }
    ]
  };

  const integrations = [
    { name: "GitHub", icon: "Github", description: "Direct repository integration" },
    { name: "VS Code", icon: "Code", description: "IDE extension available" },
    { name: "Slack", icon: "MessageSquare", description: "Team notifications" },
    { name: "Jira", icon: "CheckSquare", description: "Project management sync" }
  ];

  const pricingTiers = [
    { tier: "Free", features: ["Up to 100 snippets", "Basic AI features", "Community support"] },
    { tier: "Pro", features: ["Unlimited snippets", "Advanced AI analysis", "Priority support", "Team collaboration"] },
    { tier: "Enterprise", features: ["Everything in Pro", "SSO & Advanced security", "Custom integrations", "Dedicated support"] }
  ];

  return (
    <>
      <Helmet>
        <title>Features - HyvHub | AI-Powered Code Collaboration Platform</title>
        <meta name="description" content="Explore HyvHub's comprehensive features including AI code optimization, real-time collaboration, enterprise security, and seamless integrations." />
      </Helmet>
      <div className="min-h-screen bg-slate-50">
        <NavigationBar />

        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-600 to-purple-700 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
                Powerful Features for Modern Development Teams
              </h1>
              <p className="text-xl text-blue-100 mb-8">
                Everything you need to collaborate, optimize, and secure your code
              </p>
              <Button 
                variant="secondary"
                size="lg"
                iconName="Rocket"
                iconPosition="right"
                onClick={() => navigate('/register')}
              >
                Start Free Trial
              </Button>
            </div>
          </div>
        </section>

        {/* Category Navigation */}
        <section className="bg-white border-b border-slate-200 sticky top-16 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex overflow-x-auto gap-2 py-4 scrollbar-hide">
              {categories?.map((category) => (
                <button
                  key={category?.id}
                  onClick={() => setActiveCategory(category?.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
                    activeCategory === category?.id
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Icon name={category?.icon} size={20} />
                  {category?.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Features Display */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-16">
              {featuresByCategory?.[activeCategory]?.map((feature, index) => (
                <div 
                  key={index}
                  className={`flex flex-col lg:flex-row items-center gap-12 ${
                    index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                  }`}
                >
                  <div className="flex-1">
                    <div className="bg-white rounded-xl shadow-lg p-8">
                      <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
                        {feature?.title}
                      </h3>
                      <p className="text-lg text-slate-600 mb-6">
                        {feature?.description}
                      </p>
                      
                      {feature?.accuracy && (
                        <div className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full font-semibold mb-6">
                          {feature?.accuracy}
                        </div>
                      )}

                      <div className="space-y-3 mb-6">
                        {feature?.benefits?.map((benefit, idx) => (
                          <div key={idx} className="flex items-start gap-3">
                            <Icon name="Check" className="text-green-600 flex-shrink-0 mt-1" size={20} />
                            <span className="text-slate-700">{benefit}</span>
                          </div>
                        ))}
                      </div>

                      <Button 
                        variant="outline"
                        onClick={() => navigate('/register')}
                      >
                        Try This Feature
                      </Button>
                    </div>
                  </div>

                  <div className="flex-1">
                    <AppImage 
                      src={feature?.image}
                      alt={feature?.alt}
                      className="w-full h-auto rounded-xl shadow-lg"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Integrations Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                Seamless Integrations
              </h2>
              <p className="text-xl text-slate-600">
                Connect with your favorite development tools
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {integrations?.map((integration, index) => (
                <div 
                  key={index}
                  className="bg-slate-50 rounded-xl p-6 text-center hover:shadow-lg transition-shadow"
                >
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon name={integration?.icon} className="text-blue-600" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    {integration?.name}
                  </h3>
                  <p className="text-slate-600">
                    {integration?.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Tiers */}
        <section className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                Feature Availability by Plan
              </h2>
              <p className="text-xl text-slate-600">
                Choose the plan that fits your needs
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {pricingTiers?.map((plan, index) => (
                <div 
                  key={index}
                  className="bg-white rounded-xl p-8 shadow-md hover:shadow-xl transition-shadow"
                >
                  <h3 className="text-2xl font-bold text-slate-900 mb-6">
                    {plan?.tier}
                  </h3>
                  <ul className="space-y-4 mb-8">
                    {plan?.features?.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <Icon name="Check" className="text-green-600 flex-shrink-0 mt-1" size={20} />
                        <span className="text-slate-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    variant={index === 1 ? 'default' : 'outline'}
                    fullWidth
                    onClick={() => navigate('/register')}
                  >
                    Get Started
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-blue-600 to-purple-700 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Ready to Experience These Features?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Start your free trial today and transform how your team collaborates on code
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                variant="secondary"
                size="lg"
                iconName="Rocket"
                iconPosition="right"
                onClick={() => navigate('/register')}
              >
                Start Free Trial
              </Button>
              <Button 
                variant="outline"
                size="lg"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                onClick={() => navigate('/team-chat')}
              >
                Schedule Demo
              </Button>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default Features;