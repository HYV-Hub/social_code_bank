/**
 * Seed Data Generator for HYVHub
 * Creates demo users, snippets, hives, challenges, and interactions
 * Run from browser console or import into a component
 *
 * Usage: import { seedAll } from '../utils/seedData'; seedAll();
 */
import { supabase } from '../lib/supabase';

// ─── Demo Users ───
const DEMO_USERS = [
  {
    email: 'sarah.chen@demo.hyvhub.com',
    password: 'DemoPass123!',
    profile: {
      full_name: 'Sarah Chen',
      username: 'sarah_dev',
      bio: 'Senior Full-Stack Engineer | React & Node.js | Open source contributor | Building tools that developers love',
      location: 'San Francisco, CA',
      website: 'https://sarahchen.dev',
      contributor_level: 'expert',
    }
  },
  {
    email: 'mike.rodriguez@demo.hyvhub.com',
    password: 'DemoPass123!',
    profile: {
      full_name: 'Mike Rodriguez',
      username: 'mike_codes',
      bio: 'Backend engineer specializing in Python & Go | API design enthusiast | PostgreSQL advocate',
      location: 'Austin, TX',
      website: 'https://mikerodriguez.io',
      contributor_level: 'advanced',
    }
  },
  {
    email: 'alex.kumar@demo.hyvhub.com',
    password: 'DemoPass123!',
    profile: {
      full_name: 'Alex Kumar',
      username: 'alex_ui',
      bio: 'UI/UX Engineer | CSS wizard | Tailwind & Framer Motion | Creating beautiful, accessible interfaces',
      location: 'London, UK',
      website: 'https://alexkumar.design',
      contributor_level: 'advanced',
    }
  },
  {
    email: 'emma.watson@demo.hyvhub.com',
    password: 'DemoPass123!',
    profile: {
      full_name: 'Emma Watson',
      username: 'emma_ml',
      bio: 'Machine Learning Engineer | Python & TensorFlow | Data science | Turning data into insights',
      location: 'Berlin, Germany',
      contributor_level: 'intermediate',
    }
  },
  {
    email: 'james.park@demo.hyvhub.com',
    password: 'DemoPass123!',
    profile: {
      full_name: 'James Park',
      username: 'james_devops',
      bio: 'DevOps Engineer | Docker & Kubernetes | CI/CD pipelines | Cloud infrastructure at scale',
      location: 'Seoul, South Korea',
      contributor_level: 'expert',
    }
  },
];

// ─── Demo Snippets ───
const DEMO_SNIPPETS = [
  {
    title: 'JWT Authentication Middleware with Refresh Tokens',
    description: 'Production-ready Express middleware that handles JWT verification, automatic token refresh, and role-based access control. Includes error handling for expired/invalid tokens.',
    code: `const jwt = require('jsonwebtoken');
const { promisify } = require('util');

const verifyToken = promisify(jwt.verify);

const authMiddleware = (requiredRoles = []) => {
  return async (req, res, next) => {
    try {
      // 1. Extract token from header
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
      }
      const token = authHeader.split(' ')[1];

      // 2. Verify token
      let decoded;
      try {
        decoded = await verifyToken(token, process.env.JWT_SECRET);
      } catch (err) {
        if (err.name === 'TokenExpiredError') {
          // Try refresh token
          const refreshToken = req.cookies?.refreshToken;
          if (!refreshToken) {
            return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
          }
          const refreshDecoded = await verifyToken(refreshToken, process.env.REFRESH_SECRET);
          const newToken = jwt.sign(
            { userId: refreshDecoded.userId, role: refreshDecoded.role },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
          );
          res.setHeader('X-New-Token', newToken);
          decoded = refreshDecoded;
        } else {
          return res.status(401).json({ error: 'Invalid token' });
        }
      }

      // 3. Check roles
      if (requiredRoles.length > 0 && !requiredRoles.includes(decoded.role)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      req.user = decoded;
      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      res.status(500).json({ error: 'Authentication failed' });
    }
  };
};

module.exports = { authMiddleware };`,
    language: 'javascript',
    snippet_type: 'function',
    visibility: 'public',
    ai_tags: ['authentication', 'jwt', 'middleware', 'express', 'security', 'refresh-token'],
    ai_quality_score: 92,
    ai_analysis_data: { purposeTags: ['Authentication', 'API Middleware'], summary: 'Production-ready JWT auth with automatic token refresh' },
  },
  {
    title: 'React useInfiniteScroll Hook',
    description: 'Custom React hook for infinite scrolling with IntersectionObserver. Handles loading states, error retry, and cleanup. Works with any paginated API.',
    code: `import { useState, useEffect, useRef, useCallback } from 'react';

export function useInfiniteScroll(fetchFn, options = {}) {
  const { threshold = 0.8, initialPage = 1 } = options;
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(initialPage);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const observerRef = useRef(null);
  const sentinelRef = useRef(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    try {
      setLoading(true);
      setError(null);
      const { data, total } = await fetchFn(page);
      setItems(prev => [...prev, ...data]);
      setHasMore(items.length + data.length < total);
      setPage(prev => prev + 1);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore, fetchFn]);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMore(); },
      { threshold }
    );
    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current);
    }
    return () => observerRef.current?.disconnect();
  }, [loadMore, threshold]);

  const reset = () => {
    setItems([]);
    setPage(initialPage);
    setHasMore(true);
    setError(null);
  };

  return { items, loading, hasMore, error, sentinelRef, reset };
}`,
    language: 'typescript',
    snippet_type: 'function',
    visibility: 'public',
    ai_tags: ['react', 'hooks', 'infinite-scroll', 'intersection-observer', 'pagination'],
    ai_quality_score: 88,
    ai_analysis_data: { purposeTags: ['UI Components', 'React Hooks'], summary: 'Reusable infinite scroll hook with IntersectionObserver' },
  },
  {
    title: 'PostgreSQL Full-Text Search with Ranking',
    description: 'Efficient full-text search implementation for PostgreSQL with weighted ranking, trigram similarity for fuzzy matching, and highlight support.',
    code: `-- Create search configuration
CREATE TEXT SEARCH CONFIGURATION custom_english (COPY = english);

-- Add trigram extension for fuzzy matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create GIN indexes for fast search
CREATE INDEX idx_snippets_search ON snippets
  USING GIN (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '')));
CREATE INDEX idx_snippets_trgm ON snippets
  USING GIN (title gin_trgm_ops);

-- Search function with ranking and highlights
CREATE OR REPLACE FUNCTION search_snippets(
  search_query TEXT,
  result_limit INT DEFAULT 20,
  result_offset INT DEFAULT 0
) RETURNS TABLE (
  id UUID, title TEXT, description TEXT,
  rank FLOAT, highlight TEXT, similarity FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id, s.title, s.description,
    ts_rank(
      setweight(to_tsvector('english', coalesce(s.title, '')), 'A') ||
      setweight(to_tsvector('english', coalesce(s.description, '')), 'B'),
      plainto_tsquery('english', search_query)
    ) AS rank,
    ts_headline('english', coalesce(s.description, ''),
      plainto_tsquery('english', search_query),
      'MaxWords=50, MinWords=20, StartSel=<mark>, StopSel=</mark>'
    ) AS highlight,
    similarity(s.title, search_query) AS similarity
  FROM snippets s
  WHERE s.visibility = 'public'
    AND (
      to_tsvector('english', coalesce(s.title, '') || ' ' || coalesce(s.description, ''))
      @@ plainto_tsquery('english', search_query)
      OR similarity(s.title, search_query) > 0.3
    )
  ORDER BY rank DESC, similarity DESC
  LIMIT result_limit OFFSET result_offset;
END;
$$ LANGUAGE plpgsql;`,
    language: 'sql',
    snippet_type: 'query',
    visibility: 'public',
    ai_tags: ['postgresql', 'full-text-search', 'database', 'indexing', 'sql', 'performance'],
    ai_quality_score: 95,
    ai_analysis_data: { purposeTags: ['Database', 'Search'], summary: 'Production PostgreSQL FTS with ranking and fuzzy matching' },
  },
  {
    title: 'Animated Modal with Backdrop Blur',
    description: 'Accessible modal component with smooth enter/exit animations, backdrop blur, focus trapping, and keyboard navigation. Supports Tailwind CSS.',
    code: `import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export function Modal({ isOpen, onClose, title, children }) {
  const [show, setShow] = useState(false);
  const overlayRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setShow(true);
      document.body.style.overflow = 'hidden';
      // Focus trap
      const focusable = contentRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      focusable?.[0]?.focus();
    } else {
      const timer = setTimeout(() => setShow(false), 200);
      document.body.style.overflow = '';
      return () => clearTimeout(timer);
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!show) return null;

  return createPortal(
    <div
      ref={overlayRef}
      onClick={(e) => e.target === overlayRef.current && onClose()}
      className={\`fixed inset-0 z-50 flex items-center justify-center p-4
        backdrop-blur-sm transition-all duration-200
        \${isOpen ? 'bg-black/50 opacity-100' : 'bg-transparent opacity-0'}\`}
    >
      <div
        ref={contentRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={\`bg-white dark:bg-gray-900 rounded-2xl shadow-2xl
          max-w-lg w-full max-h-[85vh] overflow-y-auto
          transform transition-all duration-200
          \${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}\`}
      >
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">✕</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>,
    document.body
  );
}`,
    language: 'typescript',
    snippet_type: 'class',
    visibility: 'public',
    ai_tags: ['react', 'modal', 'animation', 'accessibility', 'ui-component', 'tailwind'],
    ai_quality_score: 85,
    ai_analysis_data: { purposeTags: ['UI Components', 'Animation'], summary: 'Accessible animated modal with focus trap and backdrop blur' },
  },
  {
    title: 'Python FastAPI Rate Limiter with Redis',
    description: 'Production rate limiting middleware for FastAPI using Redis. Supports sliding window algorithm, per-user and per-IP limits, and custom response headers.',
    code: `import time
from typing import Optional, Callable
from fastapi import Request, Response, HTTPException
from fastapi.middleware.base import BaseHTTPMiddleware
import redis.asyncio as redis

class RateLimiter(BaseHTTPMiddleware):
    def __init__(self, app, redis_url: str = "redis://localhost:6379",
                 requests_per_minute: int = 60, burst_limit: int = 10):
        super().__init__(app)
        self.redis = redis.from_url(redis_url, decode_responses=True)
        self.rpm = requests_per_minute
        self.burst = burst_limit

    def _get_identifier(self, request: Request) -> str:
        """Get unique identifier: authenticated user ID or IP address."""
        user = getattr(request.state, "user", None)
        if user and hasattr(user, "id"):
            return f"user:{user.id}"
        forwarded = request.headers.get("X-Forwarded-For")
        ip = forwarded.split(",")[0].strip() if forwarded else request.client.host
        return f"ip:{ip}"

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        identifier = self._get_identifier(request)
        key = f"ratelimit:{identifier}"
        now = time.time()
        window_start = now - 60

        pipe = self.redis.pipeline()
        pipe.zremrangebyscore(key, 0, window_start)  # Remove old entries
        pipe.zadd(key, {str(now): now})                # Add current request
        pipe.zcard(key)                                 # Count requests in window
        pipe.expire(key, 120)                           # TTL for cleanup
        _, _, request_count, _ = await pipe.execute()

        # Set rate limit headers
        remaining = max(0, self.rpm - request_count)
        headers = {
            "X-RateLimit-Limit": str(self.rpm),
            "X-RateLimit-Remaining": str(remaining),
            "X-RateLimit-Reset": str(int(now + 60)),
        }

        if request_count > self.rpm:
            raise HTTPException(
                status_code=429,
                detail="Rate limit exceeded. Please try again later.",
                headers=headers,
            )

        response = await call_next(request)
        for k, v in headers.items():
            response.headers[k] = v
        return response`,
    language: 'python',
    snippet_type: 'class',
    visibility: 'public',
    ai_tags: ['python', 'fastapi', 'rate-limiting', 'redis', 'middleware', 'api', 'performance'],
    ai_quality_score: 91,
    ai_analysis_data: { purposeTags: ['API Middleware', 'Performance'], summary: 'Production rate limiter with sliding window and Redis' },
  },
  {
    title: 'Go Concurrent Worker Pool',
    description: 'Generic worker pool implementation in Go using channels and goroutines. Handles graceful shutdown, error collection, and configurable concurrency.',
    code: `package workerpool

import (
\t"context"
\t"sync"
)

type Job[T any, R any] struct {
\tInput  T
\tResult R
\tErr    error
}

type Pool[T any, R any] struct {
\tworkers int
\tjobs    chan Job[T, R]
\tresults chan Job[T, R]
\twg      sync.WaitGroup
}

func New[T any, R any](workers, bufferSize int) *Pool[T, R] {
\treturn &Pool[T, R]{
\t\tworkers: workers,
\t\tjobs:    make(chan Job[T, R], bufferSize),
\t\tresults: make(chan Job[T, R], bufferSize),
\t}
}

func (p *Pool[T, R]) Start(ctx context.Context, fn func(context.Context, T) (R, error)) {
\tfor i := 0; i < p.workers; i++ {
\t\tp.wg.Add(1)
\t\tgo func() {
\t\t\tdefer p.wg.Done()
\t\t\tfor job := range p.jobs {
\t\t\t\tselect {
\t\t\t\tcase <-ctx.Done():
\t\t\t\t\tjob.Err = ctx.Err()
\t\t\t\t\tp.results <- job
\t\t\t\t\treturn
\t\t\t\tdefault:
\t\t\t\t\tjob.Result, job.Err = fn(ctx, job.Input)
\t\t\t\t\tp.results <- job
\t\t\t\t}
\t\t\t}
\t\t}()
\t}
}

func (p *Pool[T, R]) Submit(input T) { p.jobs <- Job[T, R]{Input: input} }
func (p *Pool[T, R]) Results() <-chan Job[T, R] { return p.results }
func (p *Pool[T, R]) Close() { close(p.jobs); p.wg.Wait(); close(p.results) }`,
    language: 'go',
    snippet_type: 'class',
    visibility: 'public',
    ai_tags: ['go', 'concurrency', 'worker-pool', 'goroutines', 'channels', 'generics'],
    ai_quality_score: 94,
    ai_analysis_data: { purposeTags: ['Concurrency', 'Design Pattern'], summary: 'Generic Go worker pool with graceful shutdown' },
  },
  {
    title: 'CSS-Only Skeleton Loading Animation',
    description: 'Pure CSS skeleton loading placeholder with shimmer animation. No JavaScript required. Works with any layout — just apply the class.',
    code: `.skeleton {
  background: linear-gradient(
    90deg,
    hsl(0 0% 20%) 0%,
    hsl(0 0% 28%) 40%,
    hsl(0 0% 20%) 80%
  );
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s ease-in-out infinite;
  border-radius: 0.5rem;
}

@keyframes skeleton-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Usage examples */
.skeleton-text {
  composes: skeleton;
  height: 1rem;
  width: 75%;
  margin-bottom: 0.5rem;
}

.skeleton-title {
  composes: skeleton;
  height: 1.5rem;
  width: 50%;
  margin-bottom: 1rem;
}

.skeleton-avatar {
  composes: skeleton;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
}

.skeleton-card {
  composes: skeleton;
  height: 12rem;
  width: 100%;
}

/* Dark mode variant */
@media (prefers-color-scheme: dark) {
  .skeleton {
    background: linear-gradient(
      90deg,
      hsl(0 0% 12%) 0%,
      hsl(0 0% 18%) 40%,
      hsl(0 0% 12%) 80%
    );
    background-size: 200% 100%;
  }
}`,
    language: 'css',
    snippet_type: 'code',
    visibility: 'public',
    ai_tags: ['css', 'skeleton', 'loading', 'animation', 'ui-component', 'no-javascript'],
    ai_quality_score: 82,
    ai_analysis_data: { purposeTags: ['UI Components', 'Animation'], summary: 'Pure CSS skeleton loading with shimmer — no JS needed' },
  },
  {
    title: 'Rust Error Handling with Custom Error Types',
    description: 'Idiomatic Rust error handling using thiserror for custom error types and anyhow for application errors. Includes conversion traits and context propagation.',
    code: `use thiserror::Error;
use std::io;

#[derive(Error, Debug)]
pub enum AppError {
    #[error("Database error: {0}")]
    Database(#[from] sqlx::Error),

    #[error("Authentication failed: {0}")]
    Auth(String),

    #[error("Resource not found: {resource_type} with id {id}")]
    NotFound { resource_type: String, id: String },

    #[error("Validation error: {field} - {message}")]
    Validation { field: String, message: String },

    #[error("IO error: {0}")]
    Io(#[from] io::Error),

    #[error("Rate limited: retry after {retry_after_secs} seconds")]
    RateLimited { retry_after_secs: u64 },
}

impl AppError {
    pub fn status_code(&self) -> u16 {
        match self {
            Self::Auth(_) => 401,
            Self::NotFound { .. } => 404,
            Self::Validation { .. } => 422,
            Self::RateLimited { .. } => 429,
            _ => 500,
        }
    }
}

// Usage in handlers:
pub async fn get_user(id: &str) -> Result<User, AppError> {
    let user = db::find_user(id)
        .await?  // sqlx::Error auto-converts via #[from]
        .ok_or_else(|| AppError::NotFound {
            resource_type: "User".into(),
            id: id.into(),
        })?;

    if !user.is_active {
        return Err(AppError::Auth("Account is disabled".into()));
    }

    Ok(user)
}`,
    language: 'rust',
    snippet_type: 'code',
    visibility: 'public',
    ai_tags: ['rust', 'error-handling', 'thiserror', 'patterns', 'backend'],
    ai_quality_score: 90,
    ai_analysis_data: { purposeTags: ['Error Handling', 'Design Pattern'], summary: 'Idiomatic Rust error handling with thiserror + anyhow' },
  },
];

// ─── Seed Functions ───

export async function seedUsers() {
  const createdUsers = [];
  for (const demo of DEMO_USERS) {
    try {
      // Check if user exists
      const { data: existing } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('username', demo.profile.username)
        .maybeSingle();

      if (existing) {
        console.log(`User ${demo.profile.username} already exists, skipping`);
        createdUsers.push({ id: existing.id, ...demo.profile });
        continue;
      }

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: demo.email,
        password: demo.password,
      });
      if (authError) { console.warn(`Auth error for ${demo.email}:`, authError); continue; }

      // Update profile
      if (authData?.user?.id) {
        await supabase.from('user_profiles').upsert({
          id: authData.user.id,
          ...demo.profile,
          email_verified: true,
        });
        createdUsers.push({ id: authData.user.id, ...demo.profile });
        console.log(`Created user: ${demo.profile.username}`);
      }
    } catch (err) {
      console.warn(`Error creating ${demo.profile.username}:`, err);
    }
  }
  return createdUsers;
}

export async function seedSnippets(userIds) {
  const createdSnippets = [];
  for (let i = 0; i < DEMO_SNIPPETS.length; i++) {
    const snippet = DEMO_SNIPPETS[i];
    const userId = userIds[i % userIds.length];
    try {
      const { data, error } = await supabase
        .from('snippets')
        .insert({
          user_id: userId,
          ...snippet,
          likes_count: Math.floor(Math.random() * 200) + 10,
          views_count: Math.floor(Math.random() * 1000) + 50,
          comments_count: Math.floor(Math.random() * 30),
          reuse_count: Math.floor(Math.random() * 100),
        })
        .select('id')
        .single();
      if (error) { console.warn(`Snippet error:`, error); continue; }
      createdSnippets.push(data.id);
      console.log(`Created snippet: ${snippet.title}`);
    } catch (err) {
      console.warn(`Error creating snippet:`, err);
    }
  }
  return createdSnippets;
}

export async function seedInteractions(userIds, snippetIds) {
  // Create follows between users
  for (let i = 0; i < userIds.length; i++) {
    for (let j = 0; j < userIds.length; j++) {
      if (i !== j && Math.random() > 0.3) {
        try {
          await supabase.from('follows').upsert({
            follower_id: userIds[i],
            following_id: userIds[j],
          }, { onConflict: 'follower_id,following_id' });
        } catch (e) { /* ignore duplicates */ }
      }
    }
  }
  console.log('Created follow relationships');

  // Create some likes
  for (const snippetId of snippetIds) {
    for (const userId of userIds) {
      if (Math.random() > 0.4) {
        try {
          await supabase.from('snippet_likes').upsert({
            snippet_id: snippetId,
            user_id: userId,
          }, { onConflict: 'snippet_id,user_id' });
        } catch (e) { /* ignore */ }
      }
    }
  }
  console.log('Created likes');

  // Create some comments
  const sampleComments = [
    'Great pattern! I\'ve been looking for exactly this.',
    'Clean implementation. One suggestion: consider adding error boundaries.',
    'This saved me hours of work. Thanks for sharing!',
    'Nice approach. How does this handle edge cases with large datasets?',
    'Really well-structured code. The error handling is solid.',
    'I forked this and adapted it for my project. Works perfectly!',
    'The documentation in the code is excellent. Easy to understand.',
    'Have you considered adding TypeScript types? Would make it even better.',
  ];

  for (const snippetId of snippetIds.slice(0, 4)) {
    const numComments = Math.floor(Math.random() * 4) + 1;
    for (let i = 0; i < numComments; i++) {
      const userId = userIds[Math.floor(Math.random() * userIds.length)];
      const comment = sampleComments[Math.floor(Math.random() * sampleComments.length)];
      try {
        await supabase.from('snippet_comments').insert({
          snippet_id: snippetId,
          user_id: userId,
          content: comment,
        });
      } catch (e) { /* ignore */ }
    }
  }
  console.log('Created comments');
}

export async function seedHive(creatorId) {
  try {
    const { data: hive, error } = await supabase
      .from('hives')
      .insert({
        name: 'Frontend Masters',
        description: 'A community for frontend developers sharing React, Vue, CSS, and UI component patterns. Join us to level up your frontend game!',
        privacy: 'public',
        created_by: creatorId,
        tags: ['react', 'css', 'javascript', 'ui', 'frontend'],
      })
      .select('id')
      .single();
    if (error) { console.warn('Hive error:', error); return null; }
    console.log('Created hive: Frontend Masters');
    return hive.id;
  } catch (err) {
    console.warn('Error creating hive:', err);
    return null;
  }
}

export async function seedAll() {
  console.log('🌱 Starting seed...');

  const users = await seedUsers();
  const userIds = users.map(u => u.id).filter(Boolean);

  if (userIds.length === 0) {
    console.error('No users created. Check Supabase auth settings.');
    return;
  }

  const snippetIds = await seedSnippets(userIds);
  await seedInteractions(userIds, snippetIds);

  const hiveId = await seedHive(userIds[0]);

  console.log('✅ Seed complete!');
  console.log(`Created: ${userIds.length} users, ${snippetIds.length} snippets, 1 hive`);
  console.log('Demo login: sarah.chen@demo.hyvhub.com / DemoPass123!');

  return { userIds, snippetIds, hiveId };
}
