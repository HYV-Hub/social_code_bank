-- Fix user_profiles RLS policy to allow signup
-- Problem: Existing policy blocks profile creation during signup
-- Solution: Allow SECURITY DEFINER trigger to insert profiles

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "allow_profile_creation_on_signup" ON public.user_profiles;

-- Create new policy that works with trigger-based profile creation
-- The trigger runs with SECURITY DEFINER, so it bypasses RLS
-- But we need to allow the initial INSERT to pass through
CREATE POLICY "allow_authenticated_profile_insert"
ON public.user_profiles
FOR INSERT
TO authenticated, anon
WITH CHECK (true);

-- Keep existing policies for other operations
-- Users can view all profiles
CREATE POLICY "users_view_all_profiles_v2"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (true);

-- Users can update only their own profile
CREATE POLICY "users_update_own_profile_v2"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Users can delete only their own profile
CREATE POLICY "users_delete_own_profile_v2"
ON public.user_profiles
FOR DELETE
TO authenticated
USING (id = auth.uid());