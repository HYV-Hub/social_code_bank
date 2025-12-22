-- Migration: Add user limits for companies
-- Timestamp: 20251120202601
-- Purpose: Support free 10-user limit per company with contact sales messaging

-- Add columns for user limit tracking
ALTER TABLE companies
ADD COLUMN IF NOT EXISTS user_limit INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS users_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS upgrade_requested BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS upgrade_requested_at TIMESTAMP WITH TIME ZONE;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_companies_users_count ON companies(users_count);
CREATE INDEX IF NOT EXISTS idx_companies_upgrade_requested ON companies(upgrade_requested);

-- Update existing companies to set users_count based on current members
DO $$
DECLARE
  company_record RECORD;
  member_count INTEGER;
BEGIN
  FOR company_record IN SELECT id FROM companies
  LOOP
    -- Count current users for this company
    SELECT COUNT(*) INTO member_count
    FROM user_profiles
    WHERE company_id = company_record.id;
    
    -- Update companies table
    UPDATE companies
    SET users_count = member_count
    WHERE id = company_record.id;
  END LOOP;
END $$;

-- Create function to update company users_count
CREATE OR REPLACE FUNCTION update_company_users_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment count when user joins company
    IF NEW.company_id IS NOT NULL THEN
      UPDATE companies
      SET users_count = users_count + 1
      WHERE id = NEW.company_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Handle company change
    IF OLD.company_id IS DISTINCT FROM NEW.company_id THEN
      -- Decrement old company
      IF OLD.company_id IS NOT NULL THEN
        UPDATE companies
        SET users_count = GREATEST(0, users_count - 1)
        WHERE id = OLD.company_id;
      END IF;
      -- Increment new company
      IF NEW.company_id IS NOT NULL THEN
        UPDATE companies
        SET users_count = users_count + 1
        WHERE id = NEW.company_id;
      END IF;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement count when user leaves company
    IF OLD.company_id IS NOT NULL THEN
      UPDATE companies
      SET users_count = GREATEST(0, users_count - 1)
      WHERE id = OLD.company_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update users_count
DROP TRIGGER IF EXISTS trigger_update_company_users_count ON user_profiles;
CREATE TRIGGER trigger_update_company_users_count
AFTER INSERT OR UPDATE OF company_id OR DELETE ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION update_company_users_count();

-- Create function to check if company can add more users
CREATE OR REPLACE FUNCTION can_add_company_user(p_company_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_limit INTEGER;
  v_users_count INTEGER;
BEGIN
  SELECT user_limit, users_count
  INTO v_user_limit, v_users_count
  FROM companies
  WHERE id = p_company_id;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  RETURN v_users_count < v_user_limit;
END;
$$ LANGUAGE plpgsql;

-- Add comments
COMMENT ON COLUMN companies.user_limit IS 'Maximum number of users allowed (default 10 for free tier)';
COMMENT ON COLUMN companies.users_count IS 'Current number of users in the company';
COMMENT ON COLUMN companies.upgrade_requested IS 'Whether company requested to add more users';
COMMENT ON COLUMN companies.upgrade_requested_at IS 'When the upgrade was requested';
COMMENT ON FUNCTION can_add_company_user IS 'Checks if company can add another user within their limit';
COMMENT ON FUNCTION update_company_users_count IS 'Automatically updates company users_count when users join/leave';