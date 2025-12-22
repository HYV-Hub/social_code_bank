-- Fix missing foreign key relationship between hive_collection_snippets and user_profiles
-- This resolves the PostgREST error: "Could not find a relationship between 'hive_collection_snippets' and 'user_profiles'"

-- Drop the constraint if it exists (to handle partial creation or stale constraints)
ALTER TABLE hive_collection_snippets
DROP CONSTRAINT IF EXISTS hive_collection_snippets_added_by_fkey;

-- Add foreign key constraint for added_by column
ALTER TABLE hive_collection_snippets
ADD CONSTRAINT hive_collection_snippets_added_by_fkey 
FOREIGN KEY (added_by) 
REFERENCES user_profiles(id) 
ON DELETE CASCADE;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_hive_collection_snippets_added_by 
ON hive_collection_snippets(added_by);

-- Update RLS policy to ensure it works correctly with the new foreign key
-- The existing policy already references added_by, so it should work properly now
-- But let's verify the policy is correctly structured

-- No changes needed to insert policy - it already checks EXISTS correctly
-- No changes needed to select policy - it already uses collection relationships
-- No changes needed to delete policy - it already checks added_by = auth.uid()

COMMENT ON CONSTRAINT hive_collection_snippets_added_by_fkey ON hive_collection_snippets 
IS 'Foreign key linking collection snippet additions to the user who added them';