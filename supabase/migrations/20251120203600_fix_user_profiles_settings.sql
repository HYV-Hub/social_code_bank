-- Add missing columns for user profile settings
-- These columns are needed for the Settings page functionality

-- Add location column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_profiles' 
    AND column_name = 'location'
  ) THEN
    ALTER TABLE public.user_profiles ADD COLUMN location TEXT;
  END IF;
END $$;

-- Add profile_visibility column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_profiles' 
    AND column_name = 'profile_visibility'
  ) THEN
    ALTER TABLE public.user_profiles ADD COLUMN profile_visibility TEXT DEFAULT 'public' CHECK (profile_visibility IN ('public', 'private', 'friends'));
  END IF;
END $$;

-- Add show_email column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_profiles' 
    AND column_name = 'show_email'
  ) THEN
    ALTER TABLE public.user_profiles ADD COLUMN show_email BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Add allow_messages column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_profiles' 
    AND column_name = 'allow_messages'
  ) THEN
    ALTER TABLE public.user_profiles ADD COLUMN allow_messages BOOLEAN DEFAULT true;
  END IF;
END $$;

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS idx_user_profiles_profile_visibility ON public.user_profiles(profile_visibility);

-- Update RLS policies to include new columns
-- No additional RLS policies needed as existing policies cover these columns