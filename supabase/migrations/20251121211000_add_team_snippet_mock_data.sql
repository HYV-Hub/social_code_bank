-- =====================================================
-- Team Snippet Mock Data Migration
-- =====================================================
-- Purpose: Add realistic team snippets with proper visibility for testing team dashboard feed
-- Requirements:
--   1. Team-scoped visibility with company_id and team_id set
--   2. Realistic code examples across multiple languages
--   3. Comments and engagement metrics for display
-- =====================================================

DO $$
DECLARE
    v_company_id UUID;
    v_team_id UUID;
    v_user_id UUID;
    v_snippet_1 UUID;
    v_snippet_2 UUID;
    v_snippet_3 UUID;
BEGIN
    -- =====================================================
    -- Step 1: Get Existing IDs for Test Data
    -- =====================================================
    
    -- Get first company (companies has created_at column)
    SELECT id INTO v_company_id 
    FROM companies 
    ORDER BY created_at 
    LIMIT 1;
    
    -- Get first team in that company (teams has created_at column)
    SELECT id INTO v_team_id 
    FROM teams 
    WHERE company_id = v_company_id 
    ORDER BY created_at 
    LIMIT 1;
    
    -- Get first user who is team member (team_members has joined_at, NOT created_at)
    SELECT user_id INTO v_user_id 
    FROM team_members 
    WHERE team_id = v_team_id 
    ORDER BY joined_at 
    LIMIT 1;
    
    -- Validation: Ensure we have required data
    IF v_company_id IS NULL OR v_team_id IS NULL OR v_user_id IS NULL THEN
        RAISE NOTICE 'Missing required data: company_id=%, team_id=%, user_id=%', 
            v_company_id, v_team_id, v_user_id;
        RETURN;
    END IF;

    RAISE NOTICE 'Using company_id=%, team_id=%, user_id=%', 
        v_company_id, v_team_id, v_user_id;

    -- =====================================================
    -- Step 2: Insert Realistic Team Snippets (One at a time)
    -- =====================================================
    
    -- Snippet 1: React Hook
    INSERT INTO public.snippets (
        title, description, language, code, visibility, 
        company_id, team_id, user_id, snippet_type, ai_tags
    ) VALUES (
        'Custom React Hook for API Calls',
        'Reusable hook with automatic error handling and loading states',
        'javascript',
        'import { useState, useEffect } from ''react'';

export const useAPI = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(url, options);
        if (!response.ok) throw new Error(''Network error'');
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [url]);

  return { data, loading, error };
};',
        'team',
        v_company_id,
        v_team_id,
        v_user_id,
        'function',
        ARRAY['react', 'hooks', 'api', 'error-handling']
    ) RETURNING id INTO v_snippet_1;

    -- Snippet 2: Python Database Pool
    INSERT INTO public.snippets (
        title, description, language, code, visibility, 
        company_id, team_id, user_id, snippet_type, ai_tags
    ) VALUES (
        'Python Database Connection Pool',
        'Thread-safe PostgreSQL connection pool with retry logic',
        'python',
        'import psycopg2
from psycopg2 import pool
import time

class DBPool:
    def __init__(self, min_conn=2, max_conn=10):
        self.pool = psycopg2.pool.ThreadedConnectionPool(
            min_conn, max_conn,
            database="mydb",
            user="user",
            password="pass",
            host="localhost"
        )
    
    def get_connection(self, retries=3):
        for attempt in range(retries):
            try:
                return self.pool.getconn()
            except Exception as e:
                if attempt == retries - 1:
                    raise
                time.sleep(1)
    
    def release_connection(self, conn):
        self.pool.putconn(conn)',
        'team',
        v_company_id,
        v_team_id,
        v_user_id,
        'class',
        ARRAY['python', 'database', 'postgresql', 'connection-pool']
    ) RETURNING id INTO v_snippet_2;

    -- Snippet 3: SQL Query
    INSERT INTO public.snippets (
        title, description, language, code, visibility, 
        company_id, team_id, user_id, snippet_type, ai_tags
    ) VALUES (
        'SQL Query Optimization Helper',
        'Performance-optimized query for user analytics dashboard',
        'sql',
        'WITH user_stats AS (
  SELECT 
    u.id,
    u.username,
    COUNT(DISTINCT s.id) as snippet_count,
    COUNT(DISTINCT c.id) as comment_count,
    MAX(s.created_at) as last_activity
  FROM user_profiles u
  LEFT JOIN snippets s ON u.id = s.user_id
  LEFT JOIN snippet_comments c ON u.id = c.user_id
  WHERE s.created_at >= NOW() - INTERVAL ''30 days''
  GROUP BY u.id, u.username
)
SELECT * FROM user_stats
WHERE snippet_count > 0
ORDER BY last_activity DESC
LIMIT 50;',
        'team',
        v_company_id,
        v_team_id,
        v_user_id,
        'query',
        ARRAY['sql', 'optimization', 'analytics', 'postgresql']
    ) RETURNING id INTO v_snippet_3;

    -- =====================================================
    -- Step 3: Add Comments for Engagement
    -- =====================================================
    
    INSERT INTO public.snippet_comments (snippet_id, user_id, content)
    VALUES 
    (v_snippet_1, v_user_id, 'Great hook! We should use this across all our API components.'),
    (v_snippet_2, v_user_id, 'This connection pool implementation is exactly what we needed for our microservices.'),
    (v_snippet_3, v_user_id, 'Perfect for our analytics dashboard. Should we add pagination?');

    -- =====================================================
    -- Step 4: Add Engagement Metrics
    -- =====================================================
    
    -- Add some likes
    INSERT INTO public.snippet_likes (snippet_id, user_id)
    VALUES 
    (v_snippet_1, v_user_id),
    (v_snippet_2, v_user_id),
    (v_snippet_3, v_user_id);
    
    -- Update view counts
    UPDATE public.snippets 
    SET views_count = 15 
    WHERE id = v_snippet_1;
    
    UPDATE public.snippets 
    SET views_count = 12 
    WHERE id = v_snippet_2;
    
    UPDATE public.snippets 
    SET views_count = 8 
    WHERE id = v_snippet_3;

    RAISE NOTICE 'Team snippet mock data created successfully with engagement metrics';
    
END $$;