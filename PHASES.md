# HYVHub Development Phases — Reference for Claude

## Current State (as of 2026-04-01)
- Branch: `fix/comprehensive`
- 62 routes, 27 services, React + Supabase + Tailwind
- AppShell (3-column layout) applied to all authenticated pages
- Dark theme with semantic tokens (primary=#8b5cf6, accent=#06b6d4)
- AI features: tagging, quality scoring, optimization reports, style matching, snippet enhancement, hive insights
- Social: comments, likes, follows, friend requests, notifications, team chat, hives

## Phase 1: Explore Overhaul (IMPLEMENTING NOW)
- Intent-first snippet cards (no code preview, tags as visual identity)
- Smart category chips (problem-based: Auth, API, DB, UI, etc.)
- Sort: Trending / Newest / Most Reused / Top Rated
- View toggle: Card Grid vs Compact List
- Right sidebar: Trending tags, Top Contributors, Platform Stats
- Skeleton loading states

### Files Modified
- `src/services/hiveService.js` — getTrendingTags, getTopContributors, getExploreStats, getCategoryCounts
- `src/pages/global-explore-feed/index.jsx` — full restructure
- `src/pages/global-explore-feed/components/FilterControls.jsx` — chip UI rewrite
- `src/pages/global-explore-feed/components/FeedItemCard.jsx` — intent-first cards
- `src/pages/global-explore-feed/components/CompactListItem.jsx` — NEW
- `src/pages/global-explore-feed/components/ExploreSidebar.jsx` — NEW

---

## Phase 2: Social Core

### 2.1 Fork/Remix System
- Add `forked_from` column to snippets table (UUID FK → snippets)
- Fork button on snippet details → creates copy with lineage link
- Fork chain display: "Forked from @sarah → improved by @mike"
- Notification: "Your snippet was forked by @user"
- Service: extend snippetService with forkSnippet(), getForkTree()
- Files: snippet-details/index.jsx (fork button), snippetService.js, new ForkTree component

### 2.2 @Mentions
- Parse @username in comments (snippets + bugs)
- Regex: /@([a-zA-Z0-9_]+)/g
- On comment save: extract mentions → create notifications
- Display: render @mentions as clickable links to profiles
- Files: CommentSection.jsx, snippetService.js (addComment), notificationService.js
- DB: mentions parsed server-side or via Supabase function trigger

### 2.3 Direct Messages
- New tables: `dm_conversations` (id, participant_ids[], created_at), `dm_messages` (id, conversation_id, sender_id, content, created_at, read_at)
- New service: `dmService.js` — getConversations, getMessages, sendMessage, markAsRead
- New page: `/inbox` — conversation list + message thread (similar to team-chat layout)
- Real-time: Supabase subscription on dm_messages
- Files: NEW src/pages/inbox/index.jsx, NEW src/services/dmService.js
- Add "Message" button on user-profile page

### 2.4 Personalized "For You" Feed
- New default landing for authenticated users (or tab on dashboard)
- Algorithm: snippets from followed users (50%) + trending in user's languages (30%) + AI recommended (20%)
- Service: new method in hiveService or dashboardService
- Uses: user's language preferences (from their snippets), follow list, engagement history
- Files: NEW src/pages/feed/index.jsx or extend user-dashboard

### 2.5 Share-to-Hive
- When creating/viewing a snippet, button to "Share to Hive"
- Modal: select hives user is member of → adds snippet to hive
- Service: hiveService.shareSnippetToHive(snippetId, hiveId)
- Files: snippet-details/index.jsx, create-snippet/index.jsx, hiveService.js

---

## Phase 3: Engagement & Growth

### 3.1 "Your Code Was Reused" Notifications
- Track reuse events (copy button, fork, save-to-collection)
- Send notification to original author: "Your snippet 'JWT Handler' was reused by @mike"
- This is THE engagement hook — developers love knowing their code is used
- Files: snippetService.js (track reuse), notificationService.js

### 3.2 Code Challenges
- Weekly coding challenges posted by admins or AI-generated
- Users submit snippets tagged with challenge ID
- Community votes (likes) determine winner
- Winner gets featured on explore page
- New tables: `challenges` (id, title, description, deadline, created_by), challenge_id on snippets
- Files: NEW src/pages/challenges/index.jsx, NEW src/services/challengeService.js

### 3.3 Snippet Series (Threads)
- Link related snippets into ordered series (like Twitter threads)
- "Part 1: Setting up Express → Part 2: Adding Auth → Part 3: Database Layer"
- New table: `snippet_series` (id, title, snippet_ids[], created_by)
- Files: NEW src/pages/snippet-series/index.jsx, extend snippetService

### 3.4 Vanity URLs
- `/u/sarah_dev` instead of `/user-profile/uuid`
- `/s/jwt-refresh-retry` instead of `/snippet-details?id=uuid`
- Requires username uniqueness (already enforced) and slug generation for snippets
- Add `slug` column to snippets table
- Update router in App.jsx

### 3.5 AI "Similar Snippets" Recommendations
- On snippet detail page: "Developers who used this also used..."
- Compare ai_tags overlap between snippets
- Service: snippetService.getSimilarSnippets(snippetId) — query by overlapping ai_tags
- Files: snippet-details/index.jsx (add section), snippetService.js

### 3.6 AI Quality Gates
- Snippets below quality score 40 get "Needs Improvement" badge
- Snippets above 80 get "Verified Quality" badge
- Display on cards and detail page
- Auto-trigger on snippet creation (already partially exists via aiTaggingService)

### 3.7 Tag Pages
- `/explore/react` → all snippets tagged "react"
- `/explore/authentication` → all snippets tagged "authentication"
- Reuse ExploreService.searchAll with tag filter
- NEW route + page, or redirect to explore with tag filter pre-applied

### 3.8 Trending Page
- `/trending` — what's hot now
- Sections: Trending Snippets (24h), Trending Tags, Rising Authors, Hot Hives
- Time windows: Today, This Week, This Month
- Service: aggregate views/likes over time windows
- Files: NEW src/pages/trending/index.jsx

---

## Architecture Notes for Future Claude

### Key Patterns
- All authenticated pages use `<AppShell pageTitle="X" rightSidebar={<Component />}>`
- Services use `supabase` from `../../lib/supabase` (pages) or `./supabaseClient` (services)
- Icons via `<Icon name="LucideIconName" size={N} />` from `../../components/AppIcon`
- CSS classes: hyv-card, hyv-tag, hyv-tag-ai, hyv-skeleton, hyv-empty, hyv-search
- Field naming: DB uses snake_case, services transform to camelCase for components
- Feed items structure: `{ id, type: 'snippet'|'discussion'|'collection', data: {...} }`

### Database Tables (key ones)
- snippets (id, user_id, title, description, code, language, snippet_type, visibility, ai_tags[], ai_quality_score, ai_analysis_data JSONB, likes_count, views_count, reuse_count)
- bugs (id, user_id, title, description, code, bug_status, priority, visibility)
- hives (id, name, description, privacy, created_by)
- hive_members (hive_id, user_id, role)
- follows (follower_id, following_id)
- notifications (id, user_id, type, title, message, priority, read_at)
- snippet_collections, collection_snippets (junction)
- team_channels, team_messages (real-time chat)

### Services (27 total, key ones)
- snippetService.js — CRUD, likes, comments, search
- hiveService.js — hive CRUD, global feed, membership
- aiTaggingService.js — OpenAI analysis, quality scoring
- notificationService.js — CRUD, real-time subscription
- exploreService.js — search, tag suggestions
- teamChatService.js — channels, messages, presence
- collectionService.js — user collections
- friendRequestService.js — friend system
