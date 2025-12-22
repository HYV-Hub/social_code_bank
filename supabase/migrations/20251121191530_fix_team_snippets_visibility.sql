-- Location: supabase/migrations/20251121191530_fix_team_snippets_visibility.sql
-- Schema Analysis: Existing snippets table with team_id, existing team_members junction table
-- Integration Type: Enhancement - Adding RLS policy for team snippet visibility
-- Dependencies: public.snippets, public.team_members

-- ✅ STEP 1: Create helper function for team membership validation
-- This function checks if the current user is a member of the specified team
CREATE OR REPLACE FUNCTION public.is_team_member(snippet_team_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 
    FROM public.team_members tm
    WHERE tm.team_id = snippet_team_id 
    AND tm.user_id = auth.uid()
)
$$;

-- ✅ STEP 2: Add RLS policy for team members to view team snippets
-- This allows authenticated users to read snippets from teams they belong to
CREATE POLICY "team_members_can_view_team_snippets"
ON public.snippets
FOR SELECT
TO authenticated
USING (
    team_id IS NOT NULL 
    AND public.is_team_member(team_id)
);

-- ✅ Note: Existing policies remain unchanged:
-- - users_manage_own_snippets: Users can still manage their own snippets
-- - public_can_read_public_snippets: Public snippets remain accessible to everyone
-- This new policy adds team-based access without breaking existing functionality