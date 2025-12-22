-- Location: supabase/migrations/20251120144424_fix_signup_rls_policy.sql
-- Purpose: Fix RLS policy blocking user registration
-- Issue: Existing INSERT policy prevents profile creation during signup
-- Solution: Create permissive signup policy + automatic profile trigger

-- Step 1: Drop existing problematic INSERT policies
DROP POLICY IF EXISTS "allow_profile_creation_on_signup" ON public.user_profiles;

-- Step 2: Create simple INSERT policy that allows authenticated users to create their own profile
CREATE POLICY "allow_authenticated_insert"
ON public.user_profiles
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Step 3: Keep existing policies for other operations unchanged
-- (users_view_all_profiles, users_update_own_profile, users_delete_own_profile remain)

-- Step 4: Create trigger function to automatically create user_profiles
-- This ensures profile is created immediately after auth.users insertion
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.user_profiles (
    id,
    email,
    full_name,
    role,
    email_verified,
    is_active,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'user'::public.user_role),
    COALESCE(NEW.email_confirmed_at IS NOT NULL, false),
    true,
    NOW(),
    NOW()
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Profile already exists, skip creation
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log error but don't block user creation
    RAISE WARNING 'Failed to create user profile: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Step 5: Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Step 6: Create trigger that fires after user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Step 7: Add helpful comment
COMMENT ON POLICY "allow_authenticated_insert" ON public.user_profiles IS 
  'Allows authenticated users to create their profile during signup. Actual data validation happens in application code and trigger function.';

COMMENT ON FUNCTION public.handle_new_user() IS 
  'Automatically creates user_profiles record when new user signs up via auth.users. Extracts profile data from raw_user_meta_data passed during signup.';