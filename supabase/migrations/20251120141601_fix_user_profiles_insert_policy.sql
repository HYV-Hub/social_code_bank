-- Location: supabase/migrations/20251120141601_fix_user_profiles_insert_policy.sql
-- Schema Analysis: user_profiles table exists with SELECT, UPDATE, DELETE policies
-- Integration Type: Fix missing INSERT policy for user registration
-- Dependencies: user_profiles table (existing)

-- Add missing INSERT policy for user_profiles table
-- This allows authenticated users to create their own profile during registration
CREATE POLICY "users_can_insert_own_profile"
ON public.user_profiles
FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());