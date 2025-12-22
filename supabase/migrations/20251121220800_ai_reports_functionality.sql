-- =====================================================
-- AI REPORTS FUNCTIONALITY FOR BUGS AND SNIPPETS
-- Migration: 20251121220800_ai_reports_functionality.sql
-- =====================================================

-- Add AI report fields if they don't exist (idempotent)
DO $$ 
BEGIN
  -- Add ai_report to bugs table if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bugs' AND column_name = 'ai_report'
  ) THEN
    ALTER TABLE bugs ADD COLUMN ai_report JSONB DEFAULT NULL;
    CREATE INDEX idx_bugs_has_ai_report ON bugs((ai_report IS NOT NULL));
  END IF;

  -- Add ai_report to snippets table if not exists  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'snippets' AND column_name = 'ai_report'
  ) THEN
    ALTER TABLE snippets ADD COLUMN ai_report JSONB DEFAULT NULL;
    CREATE INDEX idx_snippets_has_ai_report ON snippets((ai_report IS NOT NULL));
  END IF;
END $$;

-- =====================================================
-- HELPER FUNCTION: Generate AI Report Summary
-- =====================================================

CREATE OR REPLACE FUNCTION generate_ai_report_summary(
  p_entity_type TEXT, -- 'bug' or 'snippet'
  p_entity_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_report JSONB;
  v_code TEXT;
  v_language TEXT;
  v_title TEXT;
  v_description TEXT;
BEGIN
  -- Fetch entity details
  IF p_entity_type = 'bug' THEN
    SELECT 
      code, language, title, description 
    INTO 
      v_code, v_language, v_title, v_description
    FROM bugs WHERE id = p_entity_id;
  ELSIF p_entity_type = 'snippet' THEN
    SELECT 
      code, language, title, description
    INTO 
      v_code, v_language, v_title, v_description
    FROM snippets WHERE id = p_entity_id;
  ELSE
    RAISE EXCEPTION 'Invalid entity type: %', p_entity_type;
  END IF;

  -- Generate placeholder report structure
  -- Actual AI analysis will be done client-side
  v_report := jsonb_build_object(
    'entity_id', p_entity_id,
    'entity_type', p_entity_type,
    'generated_at', now(),
    'language', v_language,
    'title', v_title,
    'analysis', jsonb_build_object(
      'code_quality', jsonb_build_object(
        'score', null,
        'issues', '[]'::jsonb,
        'suggestions', '[]'::jsonb
      ),
      'complexity', jsonb_build_object(
        'level', null,
        'metrics', '{}'::jsonb
      ),
      'best_practices', jsonb_build_object(
        'followed', '[]'::jsonb,
        'violations', '[]'::jsonb
      ),
      'security', jsonb_build_object(
        'vulnerabilities', '[]'::jsonb,
        'recommendations', '[]'::jsonb
      )
    ),
    'summary', null,
    'recommendations', '[]'::jsonb,
    'status', 'pending'
  );

  RETURN v_report;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON COLUMN bugs.ai_report IS 'AI-generated analysis report for the bug including code quality, complexity, best practices, and security insights';
COMMENT ON COLUMN snippets.ai_report IS 'AI-generated analysis report for the code snippet including quality metrics, complexity analysis, and improvement suggestions';
COMMENT ON FUNCTION generate_ai_report_summary IS 'Generates a placeholder AI report structure that will be populated with actual AI analysis from the client-side OpenAI integration';