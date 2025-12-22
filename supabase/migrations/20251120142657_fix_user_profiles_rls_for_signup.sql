-- Location: supabase/migrations/20251120142657_fix_user_profiles_rls_for_signup.sql
-- Schema Analysis: user_profiles table exists with RLS policies that block user creation during signup
-- Integration Type: Modificative - Fix existing RLS policies
-- Dependencies: user_profiles table, existing RLS policies

-- Drop the problematic INSERT policy that requires auth.uid() during signup
DROP POLICY IF EXISTS "users_can_insert_own_profile" ON public.user_profiles;

-- Create a new INSERT policy that allows profile creation during signup
-- This policy allows authenticated users to insert their own profile
-- OR allows service role to insert profiles (used by trigger/backend)
CREATE POLICY "allow_profile_creation_on_signup"
ON public.user_profiles
FOR INSERT
TO authenticated, service_role
WITH CHECK (
    -- Allow if the user is inserting their own profile (id matches auth.uid)
    id = auth.uid()
    -- Service role can insert any profile (for trigger-based creation)
    OR auth.role() = 'service_role'
);

-- Keep existing policies for SELECT, UPDATE, DELETE
-- These already work correctly with Pattern 1 (simple ownership check)

-- Note: This migration fixes the signup issue by allowing profile creation
-- when the user's auth.users record exists but they're not fully authenticated yet