-- =============================================
-- COMPREHENSIVE FIX FOR TEAM SNIPPETS VISIBILITY
-- Migration: 20251121205105_comprehensive_team_snippets_fix.sql
-- Issue: Team snippets not displaying in team dashboard (4th attempt fix)
-- =============================================

-- Step 1: Drop existing RLS policies on snippets FIRST (before dropping functions)
DROP POLICY IF EXISTS "team_members_can_view_team_snippets" ON public.snippets;
DROP POLICY IF EXISTS "public_can_read_public_snippets" ON public.snippets;
DROP POLICY IF EXISTS "users_manage_own_snippets" ON public.snippets;
DROP POLICY IF EXISTS "company_members_can_view_company_snippets" ON public.snippets;

-- Step 2: Now safe to drop and recreate is_team_member function
DROP FUNCTION IF EXISTS public.is_team_member(uuid);

CREATE OR REPLACE FUNCTION public.is_team_member(snippet_team_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.team_members tm
    WHERE tm.team_id = snippet_team_id 
    AND tm.user_id = auth.uid()
  );
$$;

-- Step 3: Create comprehensive RLS policies for snippets visibility
-- Policy 1: Public snippets visible to everyone
CREATE POLICY "public_can_read_public_snippets"
ON public.snippets
FOR SELECT
TO public
USING (visibility = 'public');

-- Policy 2: Users can manage their own snippets
CREATE POLICY "users_manage_own_snippets"
ON public.snippets
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Policy 3: Team members can view ALL team snippets (public, team, private)
CREATE POLICY "team_members_can_view_team_snippets"
ON public.snippets
FOR SELECT
TO authenticated
USING (
  team_id IS NOT NULL 
  AND EXISTS (
    SELECT 1 
    FROM public.team_members tm
    WHERE tm.team_id = snippets.team_id 
    AND tm.user_id = auth.uid()
  )
);

-- Policy 4: Company members can view company snippets
CREATE POLICY "company_members_can_view_company_snippets"
ON public.snippets
FOR SELECT
TO authenticated
USING (
  company_id IS NOT NULL 
  AND company_id IN (
    SELECT c.id 
    FROM public.companies c
    INNER JOIN public.teams t ON t.company_id = c.id
    INNER JOIN public.team_members tm ON tm.team_id = t.id
    WHERE tm.user_id = auth.uid()
  )
);

-- Step 4: Create helper function to get team snippets with proper access control
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
BEGIN
  -- Verify user is team member
  IF NOT EXISTS (
    SELECT 1 
    FROM public.team_members tm
    WHERE tm.team_id = p_team_id 
    AND tm.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Access denied: User is not a member of this team';
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

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.get_team_snippets_feed(uuid, integer, integer) TO authenticated;

-- Step 5: Add helpful indexes if not exist
CREATE INDEX IF NOT EXISTS idx_snippets_team_visibility 
ON public.snippets(team_id, visibility) 
WHERE team_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_team_members_lookup 
ON public.team_members(team_id, user_id);

-- Step 6: Verify RLS is enabled
ALTER TABLE public.snippets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Add comment for future reference
COMMENT ON FUNCTION public.get_team_snippets_feed IS 
'Returns team snippets feed with user profile data. Verifies team membership before returning results.';