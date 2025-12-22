-- =============================================
-- FIX TEAM CREATOR ACCESS TO TEAM SNIPPETS
-- Migration: 20251121210000_fix_team_creator_access.sql
-- Issue: Team creators cannot access their own teams unless they are also in team_members
-- =============================================

-- Step 1: Update get_team_snippets_feed to include team creator check
CREATE OR REPLACE FUNCTION public.get_team_snippets_feed(
  p_team_id uuid,
  p_limit integer DEFAULT 20,
  p_offset integer DEFAULT 0
)
RETURNS TABLE (
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
  created_at timestamptz,
  updated_at timestamptz,
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
SET search_path = public
AS $$
DECLARE
  v_is_member boolean;
  v_is_creator boolean;
BEGIN
  -- Check if user is a team member
  SELECT EXISTS (
    SELECT 1 
    FROM public.team_members tm
    WHERE tm.team_id = p_team_id 
    AND tm.user_id = auth.uid()
  ) INTO v_is_member;

  -- Check if user is the team creator
  SELECT EXISTS (
    SELECT 1 
    FROM public.teams t
    WHERE t.id = p_team_id 
    AND t.created_by = auth.uid()
  ) INTO v_is_creator;

  -- Verify user has access (either member or creator)
  IF NOT (v_is_member OR v_is_creator) THEN
    RAISE EXCEPTION 'Access denied: User is not a member or creator of this team';
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

-- Step 2: Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_team_snippets_feed(uuid, integer, integer) TO authenticated;

-- Step 3: Update comment
COMMENT ON FUNCTION public.get_team_snippets_feed IS 
'Returns team snippets feed with user profile data. Verifies user is either a team member OR team creator before returning results.';

-- Step 4: Create trigger to automatically add team creator as member
CREATE OR REPLACE FUNCTION public.add_creator_as_team_member()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Automatically add team creator as a team member with admin role
  INSERT INTO public.team_members (team_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'admin')
  ON CONFLICT (team_id, user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Step 5: Attach trigger to teams table
DROP TRIGGER IF EXISTS ensure_creator_is_member ON public.teams;

CREATE TRIGGER ensure_creator_is_member
  AFTER INSERT ON public.teams
  FOR EACH ROW
  EXECUTE FUNCTION public.add_creator_as_team_member();

-- Step 6: Backfill existing teams - add creators as members if not already
INSERT INTO public.team_members (team_id, user_id, role)
SELECT t.id, t.created_by, 'admin'
FROM public.teams t
WHERE NOT EXISTS (
  SELECT 1 
  FROM public.team_members tm 
  WHERE tm.team_id = t.id 
  AND tm.user_id = t.created_by
)
ON CONFLICT (team_id, user_id) DO NOTHING;

-- Add helpful comment
COMMENT ON TRIGGER ensure_creator_is_member ON public.teams IS 
'Automatically adds team creator as admin member when a new team is created';