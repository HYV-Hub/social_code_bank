-- Add ai_tags column to snippets table
ALTER TABLE snippets 
ADD COLUMN ai_tags text[] DEFAULT '{}';

-- Add index for faster tag searches
CREATE INDEX idx_snippets_ai_tags ON snippets USING GIN (ai_tags);

-- Add ai_quality_score column for AI analysis
ALTER TABLE snippets
ADD COLUMN ai_quality_score integer DEFAULT NULL CHECK (ai_quality_score >= 0 AND ai_quality_score <= 100);

-- Add ai_analysis_data column for storing full AI analysis
ALTER TABLE snippets
ADD COLUMN ai_analysis_data jsonb DEFAULT NULL;

-- Comment on new columns
COMMENT ON COLUMN snippets.ai_tags IS 'AI-generated tags for the snippet';
COMMENT ON COLUMN snippets.ai_quality_score IS 'AI-generated quality score (0-100)';
COMMENT ON COLUMN snippets.ai_analysis_data IS 'Full AI analysis data including quality metrics, improvements, and duplicates';