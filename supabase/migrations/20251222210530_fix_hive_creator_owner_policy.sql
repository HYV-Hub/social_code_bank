-- Migration: Fix hive_members RLS policy to allow automatic owner insertion
-- 
-- Problem: The trigger add_hive_creator_as_owner fails because the RLS policy 
-- users_can_join_public_hives blocks private hive owner insertions
--
-- Solution: Add a new policy that allows hive creators to be added as owners
-- during hive creation, regardless of privacy setting

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "users_can_join_public_hives" ON hive_members;

-- Create a new comprehensive INSERT policy that allows:
-- 1. Hive creators to be added as owners (by the trigger)
-- 2. Users to join public hives themselves
-- 3. Admins to add members to their hives
CREATE POLICY "allow_hive_member_insertions" ON hive_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Allow if inserting as the hive owner (used by trigger)
    (
      user_id IN (
        SELECT owner_id 
        FROM hives 
        WHERE id = hive_id
      )
      AND role = 'owner'
    )
    OR
    -- Allow users to join public hives themselves
    (
      user_id = auth.uid()
      AND role = 'member'
      AND EXISTS (
        SELECT 1 
        FROM hives 
        WHERE id = hive_id 
        AND privacy = 'public'
      )
    )
    OR
    -- Allow hive admins/owners to add members
    (
      role IN ('member', 'editor', 'viewer')
      AND can_manage_hive_roles(hive_id)
    )
  );

-- Add comment for future reference
COMMENT ON POLICY "allow_hive_member_insertions" ON hive_members IS 
  'Allows: (1) automatic owner insertion by trigger, (2) self-join to public hives, (3) admin member additions';