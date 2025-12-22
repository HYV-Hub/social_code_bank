-- =====================================================
-- AI Snippet Sharing Preview Caching System
-- Migration: 20251222181001_ai_snippet_sharing_cache.sql
-- Purpose: Add server-side caching for AI-generated snippet previews
-- =====================================================

-- Add new JSONB column to store cached AI sharing data
ALTER TABLE snippets 
ADD COLUMN IF NOT EXISTS ai_sharing_preview JSONB DEFAULT NULL;

-- Add comment explaining the column structure
COMMENT ON COLUMN snippets.ai_sharing_preview IS 'Cached AI-generated sharing preview data including enhanced title, description, tags, and platform-specific social descriptions. Structure: {enhancedTitle, engagingDescription, suggestedTags[], socialDescriptions: {twitter, linkedin, slack}, generatedAt}';

-- Create index for fast lookup of cached previews
CREATE INDEX IF NOT EXISTS idx_snippets_has_sharing_preview 
ON snippets ((ai_sharing_preview IS NOT NULL))
WHERE ai_sharing_preview IS NOT NULL;

-- Create index on generatedAt timestamp for cache invalidation
CREATE INDEX IF NOT EXISTS idx_snippets_sharing_preview_timestamp 
ON snippets ((ai_sharing_preview->>'generatedAt'))
WHERE ai_sharing_preview IS NOT NULL;

-- Function to check if cached preview is still valid (not older than 30 days)
CREATE OR REPLACE FUNCTION is_sharing_preview_cache_valid(preview_data JSONB)
RETURNS BOOLEAN AS $$
BEGIN
  IF preview_data IS NULL THEN
    RETURN FALSE;
  END IF;
  
  RETURN (
    preview_data->>'generatedAt' IS NOT NULL 
    AND (NOW() - (preview_data->>'generatedAt')::TIMESTAMPTZ) < INTERVAL '30 days'
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- RLS policies for ai_sharing_preview column (inherit from snippets policies)
-- No additional policies needed - existing snippets RLS policies cover this column

-- Grant necessary permissions
GRANT SELECT ON snippets TO authenticated;
GRANT UPDATE (ai_sharing_preview) ON snippets TO authenticated;

-- Notification: Success
DO $$ 
BEGIN 
  RAISE NOTICE '✅ AI Snippet Sharing Cache migration completed successfully';
  RAISE NOTICE '📊 Added ai_sharing_preview JSONB column to snippets table';
  RAISE NOTICE '🔍 Created indexes for performance optimization';
  RAISE NOTICE '⚡ Cache validation function created (30-day TTL)';
END $$;