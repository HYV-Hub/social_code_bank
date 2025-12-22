# HyvHub - Social Code Bank

![HyvHub Logo](public/assets/images/ChatGPT_Image_Nov_20_2025_12_07_46_PM-1763640643146.png)

**HyvHub.com** - The collaborative platform for developers to share, discover, and optimize code snippets.

## 🎯 Overview

HyvHub is a modern, full-featured social platform designed specifically for developers to collaborate on code snippets, share knowledge, and build better software together.

## ✨ Features

- 🔐 **Secure Authentication** - Supabase-powered auth with company and individual accounts
- 💼 **Company & Team Management** - Organize your development teams effectively
- 📝 **Code Snippet Sharing** - Share, discover, and save code snippets
- 🤖 **AI-Powered Optimization** - Get intelligent code suggestions and improvements
- 🐛 **Bug Tracking** - Kanban-style bug board for project management
- 💬 **Team Chat** - Real-time communication channels
- 🔔 **Smart Notifications** - Stay updated on important activities
- 📊 **Analytics Dashboard** - Track your team's productivity and code quality

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- Supabase account
- OpenAI API key (for AI features)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/hyvhub.git

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase and API keys

# Run database migrations
# (Instructions in supabase/migrations folder)

# Start development server
npm run dev
```

## 🗄️ Database Setup

1. Create a new Supabase project
2. Run migrations in order:
   - `20251119213800_notifications_system.sql`
   - `20251119214800_auth_module_complete.sql`
   - `20251119224700_social_code_bank_core_schema.sql`

## 🌐 Deployment

The application is ready to deploy on:
- **Netlify** (recommended)
- **Vercel**
- **Any static hosting service**

### Deploy to Netlify

1. Push your code to GitHub
2. Connect repository to Netlify
3. Set environment variables in Netlify dashboard
4. Deploy!

Your app will be live at: `https://HyvHub.com`

## 🔑 Environment Variables

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_OPENAI_API_KEY=your-openai-api-key
```

## 🛡️ Security

- Row Level Security (RLS) policies protect company and team data
- Authentication required for all protected routes
- Environment variables for sensitive keys
- CORS configured for HyvHub.com domain

## 📱 Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **AI**: OpenAI GPT integration
- **State**: React Context API, Redux Toolkit
- **Routing**: React Router v6

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines.

## 📄 License

MIT License - see LICENSE file for details

## 🐝 About HyvHub

HyvHub represents the hive of developer collaboration - just like bees work together in a hive, developers collaborate in HyvHub to build amazing software.

Visit us at: **[HyvHub.com](https://HyvHub.com)**

---

Built with ❤️ by the HyvHub Team