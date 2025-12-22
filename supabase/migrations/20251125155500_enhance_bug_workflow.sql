-- Location: supabase/migrations/20251125155500_enhance_bug_workflow.sql
-- Schema Analysis: Existing bugs table with code, fixed_code, visibility, team_id, company_id
-- Integration Type: Extension - Adding bug fix workflow columns
-- Dependencies: public.bugs (existing table)

-- Add bug fix workflow columns to existing bugs table
ALTER TABLE public.bugs
ADD COLUMN IF NOT EXISTS is_bug_fix BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS previous_code TEXT,
ADD COLUMN IF NOT EXISTS fix_explanation TEXT;

-- Add indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_bugs_is_bug_fix ON public.bugs(is_bug_fix);
CREATE INDEX IF NOT EXISTS idx_bugs_is_bug_fix_status ON public.bugs(is_bug_fix, bug_status);

-- Add comments for documentation
COMMENT ON COLUMN public.bugs.is_bug_fix IS 'Indicates if this is a bug fix submission (true) or an ongoing bug report (false)';
COMMENT ON COLUMN public.bugs.previous_code IS 'Code before the fix was applied (only for bug fixes)';
COMMENT ON COLUMN public.bugs.fix_explanation IS 'AI-generated or user-provided explanation of the bug fix';

-- No RLS changes needed - existing policies already cover these columns