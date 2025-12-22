-- Fix auth.uid() undefined handling in get_team_snippets_feed function
-- Migration: 20251121210900_fix_auth_uid_handling.sql

-- Drop existing function
DROP FUNCTION IF EXISTS public.get_team_snippets_feed(uuid, integer, integer);

-- Recreate function with proper auth.uid() validation
CREATE OR REPLACE FUNCTION public.get_team_snippets_feed(
  p_team_id uuid, 
  p_limit integer DEFAULT 20, 
  p_offset integer DEFAULT 0
)
RETURNS TABLE(
  id uuid,
  title text,
  description text,
  code text,
  language language,
  snippet_type snippet_type,
  visibility visibility,
  team_id uuid,
  company_id uuid,
  user_id uuid,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  likes_count integer,
  views_count integer,
  comments_count integer,
  version integer,
  ai_tags text[],
  ai_quality_score integer,
  user_full_name text,
  user_username text,
  user_avatar_url text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id uuid;
  v_is_member boolean;
  v_is_creator boolean;
BEGIN
  -- CRITICAL FIX: Get and validate auth.uid() first
  v_user_id := auth.uid();
  
  -- If no authenticated user, raise clear error
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required: No active user session';
  END IF;

  -- Check if user is a team member
  SELECT EXISTS (
    SELECT 1 
    FROM public.team_members tm
    WHERE tm.team_id = p_team_id 
    AND tm.user_id = v_user_id
  ) INTO v_is_member;

  -- Check if user is the team creator
  SELECT EXISTS (
    SELECT 1 
    FROM public.teams t
    WHERE t.id = p_team_id 
    AND t.created_by = v_user_id
  ) INTO v_is_creator;

  -- Verify user has access (either member or creator)
  IF NOT (v_is_member OR v_is_creator) THEN
    RAISE EXCEPTION 'Access denied: User is not a member or creator of team %', p_team_id;
  END IF;

  -- Return team snippets with user profile data
  RETURN QUERY
  SELECT 
    s.id,
    s.title,
    s.description,
    s.code,
    s.language,
    s.snippet_type,
    s.visibility,
    s.team_id,
    s.company_id,
    s.user_id,
    s.created_at,
    s.updated_at,
    s.likes_count,
    s.views_count,
    s.comments_count,
    s.version,
    s.ai_tags,
    s.ai_quality_score,
    up.full_name,
    up.username,
    up.avatar_url
  FROM public.snippets s
  INNER JOIN public.user_profiles up ON up.id = s.user_id
  WHERE s.team_id = p_team_id
  ORDER BY s.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_team_snippets_feed(uuid, integer, integer) TO authenticated;

-- Add helpful comment
COMMENT ON FUNCTION public.get_team_snippets_feed IS 
'Fetches team code snippets feed with proper authentication validation. 
Returns snippets only if user is a team member or team creator. 
Includes proper error handling for undefined auth sessions.';