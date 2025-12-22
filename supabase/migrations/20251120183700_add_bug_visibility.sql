-- Location: supabase/migrations/20251120183700_add_bug_visibility.sql
-- Schema Analysis: Existing bugs table without visibility field
-- Integration Type: Extension - Adding visibility column to bugs
-- Dependencies: public.bugs, public.visibility enum

-- Add visibility column to bugs table (defaults to private for existing records)
ALTER TABLE public.bugs
ADD COLUMN visibility public.visibility DEFAULT 'private'::public.visibility;

-- Add index for visibility queries
CREATE INDEX idx_bugs_visibility ON public.bugs(visibility);

-- Update RLS policies to allow public read access to public bugs
DROP POLICY IF EXISTS "public_can_read_open_bugs" ON public.bugs;

CREATE POLICY "public_can_read_public_bugs"
ON public.bugs
FOR SELECT
TO public
USING (visibility = 'public'::public.visibility);

-- Keep existing user management policy
-- Policy already exists: users_manage_own_bugs