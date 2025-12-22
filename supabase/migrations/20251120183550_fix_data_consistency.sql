-- Migration: Fix data consistency and add helper functions
-- Timestamp: 20251120183550
-- Description: Fixes data consistency issues and adds utility functions for count management

-- 1. Add helper function for safe count increment
CREATE OR REPLACE FUNCTION increment_count(
  p_table_name text,
  p_column_name text,
  p_row_id uuid,
  p_increment integer DEFAULT 1
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE format(
    'UPDATE %I SET %I = GREATEST(%I + $1, 0) WHERE id = $2',
    p_table_name,
    p_column_name,
    p_column_name
  ) USING p_increment, p_row_id;
END;
$$;

-- 2. Add trigger to update bug comments count
CREATE OR REPLACE FUNCTION update_bug_comments_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE bugs 
    SET comments_count = GREATEST(comments_count + 1, 0)
    WHERE id = NEW.bug_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE bugs 
    SET comments_count = GREATEST(comments_count - 1, 0)
    WHERE id = OLD.bug_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger for bug_comments
DROP TRIGGER IF EXISTS trigger_update_bug_comments_count ON bug_comments;
CREATE TRIGGER trigger_update_bug_comments_count
AFTER INSERT OR DELETE ON bug_comments
FOR EACH ROW
EXECUTE FUNCTION update_bug_comments_count();

-- 3. Add trigger to update bug likes count
CREATE OR REPLACE FUNCTION update_bug_likes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE bugs 
    SET likes_count = GREATEST(likes_count + 1, 0)
    WHERE id = NEW.bug_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE bugs 
    SET likes_count = GREATEST(likes_count - 1, 0)
    WHERE id = OLD.bug_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger for bug_likes
DROP TRIGGER IF EXISTS trigger_update_bug_likes_count ON bug_likes;
CREATE TRIGGER trigger_update_bug_likes_count
AFTER INSERT OR DELETE ON bug_likes
FOR EACH ROW
EXECUTE FUNCTION update_bug_likes_count();

-- 4. Fix inconsistent team_id in user_profiles
-- Ensure users belong to teams within their company
UPDATE user_profiles up
SET team_id = t.id
FROM teams t
WHERE up.company_id = t.company_id
  AND up.team_id IS NULL
  AND t.id = (
    SELECT id FROM teams 
    WHERE company_id = up.company_id 
    ORDER BY created_at 
    LIMIT 1
  );

-- 5. Add check constraint to ensure team belongs to same company
ALTER TABLE user_profiles
DROP CONSTRAINT IF EXISTS check_team_company_match;

ALTER TABLE user_profiles
ADD CONSTRAINT check_team_company_match
CHECK (
  (team_id IS NULL AND company_id IS NULL) OR
  (team_id IS NOT NULL AND company_id IS NOT NULL)
);

-- 6. Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_notifications_company_lookup
ON notifications(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_profiles_company_team
ON user_profiles(company_id, team_id) WHERE company_id IS NOT NULL;

-- 7. Add function to get company activity
CREATE OR REPLACE FUNCTION get_company_activity(p_company_id uuid, p_limit integer DEFAULT 10)
RETURNS TABLE (
  id uuid,
  notification_type notification_type,
  title text,
  message text,
  created_at timestamptz,
  actor_name text,
  actor_avatar text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    n.id,
    n.notification_type,
    n.title,
    n.message,
    n.created_at,
    up.full_name,
    up.avatar_url
  FROM notifications n
  JOIN user_profiles up ON n.actor_id = up.id
  WHERE n.user_id IN (
    SELECT id FROM user_profiles WHERE company_id = p_company_id
  )
  ORDER BY n.created_at DESC
  LIMIT p_limit;
END;
$$;

-- 8. Sync existing counts to ensure accuracy
UPDATE bugs b
SET 
  comments_count = (SELECT COUNT(*) FROM bug_comments WHERE bug_id = b.id),
  likes_count = (SELECT COUNT(*) FROM bug_likes WHERE bug_id = b.id);

UPDATE snippets s
SET 
  comments_count = (SELECT COUNT(*) FROM snippet_comments WHERE snippet_id = s.id),
  likes_count = (SELECT COUNT(*) FROM snippet_likes WHERE snippet_id = s.id);

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION increment_count TO authenticated;
GRANT EXECUTE ON FUNCTION get_company_activity TO authenticated;

COMMENT ON FUNCTION increment_count IS 'Safely increment or decrement count columns with bounds checking';
COMMENT ON FUNCTION get_company_activity IS 'Get recent activity for a company with proper joins';
COMMENT ON FUNCTION update_bug_comments_count IS 'Automatically update bugs.comments_count on comment insert/delete';
COMMENT ON FUNCTION update_bug_likes_count IS 'Automatically update bugs.likes_count on like insert/delete';