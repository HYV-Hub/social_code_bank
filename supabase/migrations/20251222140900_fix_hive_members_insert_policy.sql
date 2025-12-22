-- Migration: Fix hive_members RLS policy to allow users to join public hives
-- Issue: Users cannot join public hives because INSERT policy is missing
-- Solution: Add policy allowing authenticated users to insert themselves as members in public hives

-- Drop existing policy if it exists (for idempotency)
DROP POLICY IF EXISTS "users_can_join_public_hives" ON public.hive_members;

-- Create policy allowing users to join public hives
-- Users can only insert their own user_id and can only join public hives
CREATE POLICY "users_can_join_public_hives"
ON public.hive_members
FOR INSERT
TO authenticated
WITH CHECK (
    -- User can only insert themselves
    user_id = auth.uid()
    AND
    -- Can only join public hives
    EXISTS (
        SELECT 1 FROM public.hives
        WHERE hives.id = hive_members.hive_id
        AND hives.privacy = 'public'::hive_privacy
    )
    AND
    -- Role must be 'member' (not 'admin' or 'owner')
    role = 'member'::hive_member_role
);

-- Comment explaining the policy
COMMENT ON POLICY "users_can_join_public_hives" ON public.hive_members IS 
'Allows authenticated users to join public hives by inserting themselves as members. Private hives require join request approval.';