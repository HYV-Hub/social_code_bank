import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppIcon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import PublicNavigation from '../../components/PublicNavigation';

const DocumentationHub = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All Topics', icon: 'Book' },
    { id: 'getting-started', label: 'Getting Started', icon: 'Rocket' },
    { id: 'snippets', label: 'Code Snippets', icon: 'Code' },
    { id: 'collaboration', label: 'Collaboration', icon: 'Users' },
    { id: 'ai-features', label: 'AI Features', icon: 'Sparkles' },
    { id: 'billing', label: 'Billing & Plans', icon: 'CreditCard' },
    { id: 'api', label: 'API Reference', icon: 'Terminal' }
  ];

  const documentationContent = [
    {
      id: 1,
      category: 'getting-started',
      title: 'Quick Start Guide',
      description: 'Get up and running with HyvHub in minutes',
      content: `Welcome to HyvHub! Follow these simple steps to start sharing and discovering code snippets:

1. Create Your Account
   - Sign up with your email or use OAuth (Google, GitHub)
   - Verify your email address
   - Complete your profile with bio and avatar

2. Explore the Platform
   - Browse trending snippets on the homepage
   - Search for specific programming languages or frameworks
   - Follow other developers to see their snippets

3. Create Your First Snippet
   - Click "Create Snippet" in the navigation
   - Add your code and description
   - Tag it with relevant languages and frameworks
   - Choose visibility (public, private, or team)

4. Engage with the Community
   - Like and comment on snippets you find useful
   - Share snippets with your team
   - Report bugs or issues you encounter

Pro Tips:
- Use the AI-powered code analysis to get quality insights
- Join teams to collaborate with colleagues
- Set up notification preferences to stay updated`
    },
    {
      id: 2,
      category: 'getting-started',
      title: 'Account Setup & Profile',
      description: 'Complete your profile and customize your account',
      content: `Setting up your HyvHub profile helps you connect with the community and showcase your expertise.

Profile Information:
- Full Name: Your display name visible to others
- Username: Unique identifier (used in URLs)
- Bio: Tell others about your coding interests
- Avatar: Upload a profile picture
- Location: Optional, helps find local developers
- Social Links: Connect your GitHub, LinkedIn, Twitter

Privacy Settings:
- Email Visibility: Choose who can see your email
- Profile Visibility: Public, private, or connections only
- Activity Visibility: Control who sees your activity

Notification Preferences:
- Email Notifications: Comments, likes, follows, mentions
- In-App Notifications: Real-time updates
- Push Notifications: Mobile alerts (if enabled)

Security:
- Two-Factor Authentication: Enable for extra security
- Password: Change regularly for account safety
- Active Sessions: View and revoke active sessions`
    },
    {
      id: 3,
      category: 'snippets',
      title: 'Creating Code Snippets',
      description: 'Learn how to create and share effective code snippets',
      content: `Creating high-quality snippets helps the community and establishes your expertise.

Best Practices for Snippets:

1. Title & Description
   - Use clear, descriptive titles
   - Explain what the code does and when to use it
   - Include example use cases

2. Code Quality
   - Format code properly with proper indentation
   - Add inline comments for complex logic
   - Follow language-specific conventions
   - Test code before sharing

3. Tags & Metadata
   - Tag with programming languages
   - Add framework/library tags
   - Include difficulty level
   - Specify use case categories

4. Visibility Options
   - Public: Anyone can view and fork
   - Private: Only you can access
   - Team: Accessible to team members
   - Company: Visible within your organization

5. AI-Powered Insights
   - Use AI analysis to improve code quality
   - Get suggestions for optimization
   - Identify potential bugs or issues
   - Ensure coding standards compliance

Advanced Features:
- Version Control: Track snippet revisions
- Collections: Organize related snippets
- Code Review: Request peer reviews
- Collaboration: Allow team edits`
    },
    {
      id: 4,
      category: 'snippets',
      title: 'Snippet Discovery & Search',
      description: 'Find the perfect code snippet for your needs',
      content: `HyvHub offers powerful search and discovery features to find exactly what you need.

Search Capabilities:

1. Basic Search
   - Keywords: Search by code content or description
   - Language Filter: Filter by programming language
   - Framework Filter: Find specific framework snippets
   - Author Search: Find snippets by specific users

2. Advanced Filters
   - Date Range: Recent or all-time snippets
   - Popularity: Sort by likes or views
   - Quality Score: AI-rated snippets
   - Difficulty Level: Beginner to expert

3. Discovery Features
   - Trending: Popular snippets this week
   - Recommended: AI-powered suggestions
   - Following: Snippets from people you follow
   - Collections: Curated snippet collections

4. Search Operators
   - Exact Match: "react hooks"
   - Exclude: -deprecated
   - Language: lang:python
   - Author: author:username

Tips for Better Results:
- Use specific technical terms
- Combine multiple filters
- Save frequent searches
- Follow relevant tags`
    },
    {
      id: 5,
      category: 'collaboration',
      title: 'Team Collaboration',
      description: 'Work together with your team effectively',
      content: `HyvHub's collaboration features help teams share knowledge and code efficiently.

Team Features:

1. Creating Teams
   - Team Name & Description
   - Invite members via email
   - Set team visibility (public/private)
   - Assign roles (admin, member, viewer)

2. Team Snippets
   - Share snippets within team
   - Collaborative editing
   - Version control for team changes
   - Review and approval workflows

3. Team Chat
   - Real-time messaging
   - Code sharing in chat
   - File attachments
   - @mentions for notifications

4. Team Dashboard
   - Team activity feed
   - Member contributions
   - Popular team snippets
   - Team analytics

Collaboration Best Practices:
- Establish coding standards
- Use snippet collections for organization
- Regular code reviews
- Document team conventions
- Set up notification preferences

Permissions:
- Admin: Full control over team
- Editor: Create and edit snippets
- Reviewer: Review and comment
- Viewer: Read-only access`
    },
    {
      id: 6,
      category: 'collaboration',title: 'Bug Reporting & Management',description: 'Track and resolve bugs efficiently',content: `HyvHub's bug board helps teams track and resolve issues systematically.

Bug Reporting:

1. Creating Bug Reports
   - Clear, descriptive title
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details
   - Screenshots or code samples

2. Bug Priority Levels
   - Critical: System-breaking issues
   - High: Major functionality affected
   - Medium: Notable but not blocking
   - Low: Minor improvements

3. Bug Lifecycle
   - Open: Newly reported
   - In Progress: Being worked on
   - Resolved: Fix implemented
   - Closed: Verified and closed
   - Reopened: Issue persists

4. Assignment & Tracking
   - Assign to team members
   - Set due dates
   - Add labels and tags
   - Track time spent
   - Link related snippets

Bug Board Features:
- Kanban-style workflow
- Filtering and sorting
- Activity timeline
- Comment threads
- Email notifications

Best Practices:
- Report bugs promptly
- Provide complete information
- Update status regularly
- Test fixes thoroughly
- Document solutions`
    },
    {
      id: 7,
      category: 'ai-features',
      title: 'AI Code Analysis',
      description: 'Leverage AI to improve your code quality',
      content: `HyvHub's AI-powered features help you write better code and learn faster.

AI Capabilities:

1. Code Quality Analysis
   - Syntax checking
   - Performance optimization suggestions
   - Security vulnerability detection
   - Best practices recommendations
   - Complexity analysis

2. Code Style Matching
   - Compare against team standards
   - Identify style violations
   - Suggest corrections
   - Track consistency metrics

3. Auto-Tagging
   - Automatic language detection
   - Framework identification
   - Use case categorization
   - Difficulty level assessment

4. Smart Suggestions
   - Alternative implementations
   - Library recommendations
   - Refactoring opportunities
   - Documentation improvements

Using AI Features:

Step 1: Enable AI Analysis
- Go to snippet editor
- Click "AI Analysis" button
- Choose analysis type
- Wait for results

Step 2: Review Insights
- Quality score (0-100)
- Issue categorization
- Specific recommendations
- Code examples

Step 3: Apply Improvements
- Accept/reject suggestions
- Implement changes
- Re-analyze updated code
- Track improvements

AI Privacy:
- Your code is not stored by AI
- Analysis happens in real-time
- No third-party sharing
- GDPR compliant`
    },
    {
      id: 8,
      category: 'ai-features',title: 'AI Optimization Reports',description: 'Get detailed insights into your code improvements',
      content: `AI Optimization Reports provide comprehensive analysis of your code quality and suggestions for improvement.

Report Components:

1. Quality Score
   - Overall score (0-100)
   - Historical tracking
   - Comparison with standards
   - Improvement trends

2. Issue Categories
   - Performance: Speed optimizations
   - Security: Vulnerability fixes
   - Maintainability: Code readability
   - Best Practices: Industry standards

3. Detailed Recommendations
   - Specific line-level feedback
   - Code before/after examples
   - Priority ranking
   - Estimated impact

4. Learning Resources
   - Related documentation
   - Tutorial links
   - Community examples
   - Video guides

Report Features:
- Export to PDF
- Share with team
- Track progress over time
- Set improvement goals

How to Use Reports:

1. Generate Report
   - Select snippet or collection
   - Choose analysis depth
   - Wait for AI processing

2. Review Findings
   - Check quality score
   - Read recommendations
   - Prioritize fixes

3. Implement Changes
   - Apply suggested fixes
   - Test modifications
   - Re-run analysis

4. Track Progress
   - Monitor score changes
   - Compare versions
   - Share improvements`
    },
    {
      id: 9,
      category: 'billing',title: 'Pricing Plans',description: 'Choose the right plan for your needs',
      content: `HyvHub offers flexible pricing plans for individuals and teams.

Plans Overview:

1. Free Plan
   - 50 public snippets
   - Basic search
   - Community features
   - AI analysis (limited)
   - Best for: Individual learners

2. Premium Plan (£9.99/month)
   - Unlimited snippets
   - Private snippets
   - Advanced search
   - Full AI features
   - Priority support
   - Best for: Professional developers

3. Enterprise Plan (Custom pricing)
   - Everything in Premium
   - Unlimited team members
   - Custom integrations
   - SLA guarantees
   - Dedicated support
   - SSO/SAML authentication
   - Best for: Organizations

Plan Features Comparison:

Storage:
- Free: 50 snippets
- Premium: Unlimited
- Enterprise: Unlimited + backup

AI Analysis:
- Free: 10 per month
- Premium: Unlimited
- Enterprise: Unlimited + custom models

Team Collaboration:
- Free: Not available
- Premium: Up to 5 members
- Enterprise: Unlimited members

Support:
- Free: Community support
- Premium: Email support
- Enterprise: 24/7 dedicated support

Billing Information:
- Monthly or annual billing
- Cancel anytime
- Pro-rated refunds
- Secure payment processing
- Multiple payment methods`
    },
    {
      id: 10,
      category: 'billing',title: 'Managing Your Subscription',description: 'Handle billing, upgrades, and cancellations',
      content: `Manage your HyvHub subscription and billing preferences easily.

Subscription Management:

1. Viewing Current Plan
   - Go to Settings > Billing
   - See current plan details
   - Check usage statistics
   - View billing history

2. Upgrading Your Plan
   - Click "Upgrade Plan"
   - Select desired tier
   - Choose billing cycle
   - Complete payment
   - Instant activation

3. Downgrading Your Plan
   - Request downgrade
   - Effective at period end
   - Data retention rules
   - Feature access changes

4. Payment Methods
   - Add/remove credit cards
   - Update billing info
   - Set default payment
   - View transaction history

Billing Features:

Invoices:
- Automatic email delivery
- PDF downloads
- VAT/GST information
- Company details

Usage Tracking:
- Snippet count
- AI analysis usage
- Team member count
- Storage used

Subscription Changes:

Upgrade Process:
1. Select new plan
2. Preview pricing
3. Confirm upgrade
4. Immediate access
5. Pro-rated billing

Downgrade Process:
1. Request downgrade
2. Review feature changes
3. Confirm change
4. Takes effect after period
5. No refund for current period

Cancellation:
- Cancel anytime
- Access until period end
- Export your data
- Re-subscribe anytime
- No cancellation fees

Payment Security:
- PCI DSS compliant
- Encrypted transactions
- No stored card details
- Secure processing
- Fraud protection`
    },
    {
      id: 11,
      category: 'api',title: 'API Authentication',description: 'Secure authentication for API access',
      content: `HyvHub API uses secure authentication methods to protect your data.

Authentication Methods:

1. API Keys (Recommended)
   - Generate in Settings > API
   - Include in request headers
   - Rotate regularly for security
   - Different keys for environments

2. OAuth 2.0
   - For third-party applications
   - User authorization flow
   - Refresh tokens supported
   - Scope-based permissions

API Key Usage:

Generate API Key:
1. Go to Settings > API
2. Click "Generate New Key"
3. Name your key
4. Set permissions
5. Copy and secure key

Using API Keys:
Include in request headers:
Authorization: Bearer YOUR_API_KEY

Example Request:
curl -H "Authorization: Bearer YOUR_API_KEY" \\
  https://api.hyvhub.com/v1/snippets

Security Best Practices:
- Never commit keys to git
- Use environment variables
- Rotate keys quarterly
- Limit key permissions
- Monitor key usage
- Revoke compromised keys

Rate Limiting:
- Free: 100 requests/hour
- Premium: 1000 requests/hour
- Enterprise: Custom limits

Error Responses:
- 401: Invalid API key
- 403: Insufficient permissions
- 429: Rate limit exceeded

OAuth Flow:
1. Register application
2. User authorization
3. Receive access token
4. Make authenticated requests
5. Refresh token when expired`
    },
    {
      id: 12,
      category: 'api',title: 'API Endpoints Reference',description: 'Complete reference for HyvHub API endpoints',
      content: `HyvHub API provides programmatic access to all platform features.

Base URL: https://api.hyvhub.com/v1

Snippets Endpoints:

GET /snippets
List all snippets
Query Parameters:
- page: Page number (default: 1)
- limit: Items per page (default: 20)
- language: Filter by language
- sort: Sort order (likes, recent, views)

GET /snippets/:id
Get specific snippet
Returns: Snippet object with full details

POST /snippets
Create new snippet
Body: {
  title: string,
  description: string,
  code: string,
  language: string,
  tags: array,
  visibility: string
}

PUT /snippets/:id
Update existing snippet
Body: Same as POST

DELETE /snippets/:id
Delete snippet
Returns: 204 No Content

Users Endpoints:

GET /users/:id
Get user profile
Returns: User object with public info

GET /users/:id/snippets
List user's public snippets
Query Parameters: Same as /snippets

POST /users/follow/:id
Follow a user
Returns: 201 Created

DELETE /users/unfollow/:id
Unfollow a user
Returns: 204 No Content

Collections Endpoints:

GET /collections
List user's collections
Returns: Array of collection objects

POST /collections
Create new collection
Body: {
  name: string,
  description: string,
  visibility: string
}

POST /collections/:id/snippets
Add snippet to collection
Body: { snippet_id: string }

Teams Endpoints:

GET /teams
List user's teams
Returns: Array of team objects

POST /teams
Create new team
Body: {
  name: string,
  description: string
}

POST /teams/:id/members
Invite team member
Body: { email: string, role: string }

Response Format:

Success Response:
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "total": 100
  }
}

Error Response:
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description"
  }
}

Status Codes:
- 200: Success
- 201: Created
- 204: No Content
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 429: Too Many Requests
- 500: Server Error`
    }
  ];

  const filteredDocs = documentationContent?.filter(doc => {
    const matchesCategory = selectedCategory === 'all' || doc?.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      doc?.title?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
      doc?.description?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
      doc?.content?.toLowerCase()?.includes(searchQuery?.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      <PublicNavigation />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Documentation & Help Center
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about using HyvHub effectively
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <AppIcon name="Search" size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e?.target?.value)}
              className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Category Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg border border-border p-4 sticky top-4">
              <h2 className="font-semibold text-card-foreground mb-4">Categories</h2>
              <div className="space-y-2">
                {categories?.map(category => (
                  <button
                    key={category?.id}
                    onClick={() => setSelectedCategory(category?.id)}
                    className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors ${
                      selectedCategory === category?.id
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    <AppIcon name={category?.icon} size={18} className="mr-2" />
                    <span className="text-sm">{category?.label}</span>
                  </button>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-border">
                <h3 className="font-semibold text-card-foreground mb-3 text-sm">Need More Help?</h3>
                <Button
                  onClick={() => navigate('/contact')}
                  className="w-full mb-2"
                  size="sm"
                  iconName="Mail"
                >
                  Contact Support
                </Button>
                <Button
                  onClick={() => navigate('/about-us')}
                  variant="outline"
                  className="w-full"
                  size="sm"
                  iconName="Info"
                >
                  About Us
                </Button>
              </div>
            </div>
          </div>

          {/* Documentation Content */}
          <div className="lg:col-span-3">
            {filteredDocs?.length === 0 ? (
              <div className="bg-card rounded-lg border border-border p-12 text-center">
                <AppIcon name="Search" size={48} className="text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-card-foreground mb-2">
                  No Results Found
                </h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filters
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredDocs?.map(doc => (
                  <div key={doc?.id} className="bg-card rounded-lg border border-border p-6">
                    <h2 className="text-2xl font-bold text-card-foreground mb-2">
                      {doc?.title}
                    </h2>
                    <p className="text-muted-foreground mb-4">
                      {doc?.description}
                    </p>
                    <div className="prose prose-sm max-w-none text-card-foreground">
                      <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                        {doc?.content}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentationHub;