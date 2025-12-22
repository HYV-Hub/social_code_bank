-- =====================================================
-- FIX: Attach handle_new_user trigger to auth.users
-- =====================================================
-- Problem: Trigger function exists but isn't attached to auth.users table
-- Solution: Create trigger on auth.users INSERT to call handle_new_user()

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger on auth.users to automatically create user_profiles
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- Verification: Check trigger is properly attached
-- =====================================================
-- You can verify with: 
-- SELECT * FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created';