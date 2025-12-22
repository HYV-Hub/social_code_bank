-- Location: supabase/migrations/20251120210729_add_bug_fix_workflow.sql
-- Schema Analysis: Extending existing bugs table with bug fix workflow support
-- Integration Type: MODIFICATIVE - Adding fixed_code column to bugs table
-- Dependencies: public.bugs (existing table)

-- Add fixed_code column to bugs table to store the corrected version
ALTER TABLE public.bugs
ADD COLUMN fixed_code TEXT;

-- Add index for better query performance when filtering bugs with fixes
CREATE INDEX idx_bugs_has_fix ON public.bugs((fixed_code IS NOT NULL));

-- Add comment for documentation
COMMENT ON COLUMN public.bugs.fixed_code IS 'Stores the corrected/fixed version of the buggy code';