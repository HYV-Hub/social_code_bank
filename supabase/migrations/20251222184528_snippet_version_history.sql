-- Location: supabase/migrations/20251222184528_snippet_version_history.sql
-- Schema Analysis: Existing snippets table with version field
-- Integration Type: Extension - Adding version history with diffs
-- Dependencies: snippets, user_profiles

-- 1. Create snippet_versions table for version history
CREATE TABLE IF NOT EXISTS public.snippet_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    snippet_id UUID NOT NULL REFERENCES public.snippets(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    code_diff TEXT NOT NULL, -- Store diff/changes only, not full code
    change_description TEXT,
    changed_by UUID NOT NULL REFERENCES public.user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure unique version numbers per snippet
    UNIQUE(snippet_id, version_number)
);

-- 2. Create indexes for efficient queries
CREATE INDEX idx_snippet_versions_snippet_id ON public.snippet_versions(snippet_id);
CREATE INDEX idx_snippet_versions_created_at ON public.snippet_versions(snippet_id, created_at DESC);
CREATE INDEX idx_snippet_versions_changed_by ON public.snippet_versions(changed_by);

-- 3. Enable RLS
ALTER TABLE public.snippet_versions ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies (Pattern 2: Simple User Ownership + Public Read for snippet visibility)

-- Users can view version history for snippets they have access to
CREATE POLICY "users_view_accessible_snippet_versions"
ON public.snippet_versions
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.snippets s
        WHERE s.id = snippet_versions.snippet_id
        AND (
            s.visibility = 'public'::visibility
            OR s.user_id = auth.uid()
            OR (s.visibility = 'team'::visibility AND s.team_id IN (
                SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
            ))
            OR (s.visibility = 'company'::visibility AND s.company_id IN (
                SELECT company_id FROM public.user_profiles WHERE id = auth.uid()
            ))
        )
    )
);

-- Users can create version entries for their own snippets
CREATE POLICY "users_create_own_snippet_versions"
ON public.snippet_versions
FOR INSERT
TO authenticated
WITH CHECK (
    changed_by = auth.uid()
    AND EXISTS (
        SELECT 1 FROM public.snippets s
        WHERE s.id = snippet_versions.snippet_id
        AND s.user_id = auth.uid()
    )
);

-- 5. Function to generate unified diff format
CREATE OR REPLACE FUNCTION public.generate_code_diff(
    old_code TEXT,
    new_code TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    diff_lines TEXT[] := ARRAY[]::TEXT[];
    old_lines TEXT[];
    new_lines TEXT[];
    i INTEGER := 1;
    j INTEGER := 1;
BEGIN
    -- Split into lines
    old_lines := string_to_array(old_code, E'\n');
    new_lines := string_to_array(new_code, E'\n');
    
    -- Simple line-by-line comparison (simplified diff algorithm)
    WHILE i <= array_length(old_lines, 1) OR j <= array_length(new_lines, 1) LOOP
        IF i > array_length(old_lines, 1) THEN
            -- Only new lines remaining
            diff_lines := array_append(diff_lines, '+ ' || new_lines[j]);
            j := j + 1;
        ELSIF j > array_length(new_lines, 1) THEN
            -- Only old lines remaining
            diff_lines := array_append(diff_lines, '- ' || old_lines[i]);
            i := i + 1;
        ELSIF old_lines[i] = new_lines[j] THEN
            -- Lines are the same
            diff_lines := array_append(diff_lines, '  ' || old_lines[i]);
            i := i + 1;
            j := j + 1;
        ELSE
            -- Lines are different
            diff_lines := array_append(diff_lines, '- ' || old_lines[i]);
            diff_lines := array_append(diff_lines, '+ ' || new_lines[j]);
            i := i + 1;
            j := j + 1;
        END IF;
    END LOOP;
    
    RETURN array_to_string(diff_lines, E'\n');
END;
$$;

-- 6. Trigger function to auto-create version on snippet update
CREATE OR REPLACE FUNCTION public.create_snippet_version_on_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    old_code_value TEXT;
    new_code_value TEXT;
    code_diff_value TEXT;
BEGIN
    -- Only create version if code actually changed
    IF OLD.code IS DISTINCT FROM NEW.code THEN
        old_code_value := OLD.code;
        new_code_value := NEW.code;
        
        -- Generate diff
        code_diff_value := public.generate_code_diff(old_code_value, new_code_value);
        
        -- Insert version record
        INSERT INTO public.snippet_versions (
            snippet_id,
            version_number,
            code_diff,
            change_description,
            changed_by
        )
        VALUES (
            NEW.id,
            NEW.version, -- Use the version from snippets table
            code_diff_value,
            'Code updated',
            NEW.user_id
        );
    END IF;
    
    RETURN NEW;
END;
$$;

-- 7. Attach trigger to snippets table
CREATE TRIGGER trigger_create_snippet_version
AFTER UPDATE ON public.snippets
FOR EACH ROW
WHEN (OLD.code IS DISTINCT FROM NEW.code)
EXECUTE FUNCTION public.create_snippet_version_on_update();

-- 8. Function to get version history with stats
CREATE OR REPLACE FUNCTION public.get_snippet_version_history(
    snippet_uuid UUID,
    limit_count INTEGER DEFAULT 50
)
RETURNS TABLE (
    version_id UUID,
    version_number INTEGER,
    code_diff TEXT,
    change_description TEXT,
    changed_by_id UUID,
    changed_by_username TEXT,
    changed_by_full_name TEXT,
    changed_by_avatar_url TEXT,
    created_at TIMESTAMPTZ,
    lines_added INTEGER,
    lines_removed INTEGER
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sv.id,
        sv.version_number,
        sv.code_diff,
        sv.change_description,
        sv.changed_by,
        up.username,
        up.full_name,
        up.avatar_url,
        sv.created_at,
        (SELECT COUNT(*) FROM regexp_matches(sv.code_diff, '^\+', 'gm'))::INTEGER as lines_added,
        (SELECT COUNT(*) FROM regexp_matches(sv.code_diff, '^-', 'gm'))::INTEGER as lines_removed
    FROM public.snippet_versions sv
    JOIN public.user_profiles up ON sv.changed_by = up.id
    WHERE sv.snippet_id = snippet_uuid
    ORDER BY sv.version_number DESC
    LIMIT limit_count;
END;
$$;

-- 9. Comments
COMMENT ON TABLE public.snippet_versions IS 'Version history for code snippets - stores diffs only, not full code';
COMMENT ON COLUMN public.snippet_versions.code_diff IS 'Unified diff format showing only changes between versions';
COMMENT ON FUNCTION public.generate_code_diff IS 'Generates a simple unified diff between old and new code';
COMMENT ON FUNCTION public.get_snippet_version_history IS 'Retrieves version history with change statistics for a snippet';