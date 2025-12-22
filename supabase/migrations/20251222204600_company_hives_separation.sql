-- Migration: Ensure Company Hives are Completely Separate from Global Hives
-- Purpose: Add company_id and is_global columns, then enforce strict separation

-- Step 1: Add missing columns to hives table
ALTER TABLE hives 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS is_global BOOLEAN DEFAULT true;

-- Step 2: Update existing hives to be global (backward compatibility)
UPDATE hives 
SET is_global = true, company_id = NULL
WHERE is_global IS NULL OR company_id IS NOT NULL;

-- Step 3: Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_hives_company_global 
ON hives(company_id, is_global) 
WHERE company_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_hives_company_members 
ON hives(company_id) 
WHERE is_global = false;

-- Step 4: Update RLS policy for company hives
DROP POLICY IF EXISTS "Users can view company hives" ON hives;

CREATE POLICY "Users can view company hives"
ON hives FOR SELECT
USING (
  -- Company members can see their company's hives
  (company_id IS NOT NULL AND is_global = false AND EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.company_id = hives.company_id
  ))
  OR
  -- Global hives are separate (for global explore)
  (is_global = true AND company_id IS NULL)
  OR
  -- Hive members can always see their hives
  EXISTS (
    SELECT 1 FROM hive_members
    WHERE hive_members.hive_id = hives.id
    AND hive_members.user_id = auth.uid()
  )
);

-- Step 5: Update insert policy to enforce company hive rules (FIXED: Use correct enum values)
DROP POLICY IF EXISTS "Admins and directors can create company hives" ON hives;

CREATE POLICY "Admins and directors can create company hives"
ON hives FOR INSERT
WITH CHECK (
  -- For company hives: must be company_admin or team_admin of that company
  (company_id IS NOT NULL AND is_global = false AND EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.company_id = hives.company_id
    AND user_profiles.role IN ('company_admin', 'team_admin')
  ))
  OR
  -- For global hives: any authenticated user (separate logic)
  (is_global = true AND company_id IS NULL AND auth.uid() IS NOT NULL)
);

-- Step 6: Add constraint to ensure company hives are not global
ALTER TABLE hives DROP CONSTRAINT IF EXISTS check_company_hive_not_global;

ALTER TABLE hives ADD CONSTRAINT check_company_hive_not_global 
CHECK (
  (company_id IS NOT NULL AND is_global = false) OR 
  (company_id IS NULL AND is_global = true)
);

-- Step 7: Function to validate hive type on update
CREATE OR REPLACE FUNCTION validate_hive_company_global()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure company hives remain company-specific
  IF NEW.company_id IS NOT NULL AND NEW.is_global = true THEN
    RAISE EXCEPTION 'Company hives cannot be marked as global';
  END IF;
  
  -- Ensure global hives remain global
  IF NEW.company_id IS NULL AND NEW.is_global = false THEN
    RAISE EXCEPTION 'Global hives cannot be assigned to a company';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 8: Create trigger for validation
DROP TRIGGER IF EXISTS trigger_validate_hive_type ON hives;

CREATE TRIGGER trigger_validate_hive_type
BEFORE INSERT OR UPDATE ON hives
FOR EACH ROW
EXECUTE FUNCTION validate_hive_company_global();

-- Step 9: Add helpful comment
COMMENT ON TABLE hives IS 'Hives table with strict separation: company_id + is_global=false for company hives, company_id=NULL + is_global=true for global hives';