-- Location: supabase/migrations/20251120133400_snippet_collections_and_review_workflow.sql
-- Schema Analysis: Existing schema with snippets, user_profiles, teams, snippet_comments, notifications
-- Integration Type: Addition - New tables for snippet collections and code review workflow
-- Dependencies: snippets, user_profiles, teams, snippet_comments, notifications

-- ========================================================================
-- FEATURE 1: Code Snippet Collections/Playlists
-- ========================================================================

-- 1. Custom Types for Collections
CREATE TYPE public.collection_type AS ENUM ('personal', 'team', 'learning_path', 'project');

-- 2. Main Collections Table
CREATE TABLE public.snippet_collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    collection_type public.collection_type DEFAULT 'personal'::public.collection_type,
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    is_public BOOLEAN DEFAULT false,
    snippets_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Junction Table for Collection-Snippet Relationships
CREATE TABLE public.collection_snippets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collection_id UUID NOT NULL REFERENCES public.snippet_collections(id) ON DELETE CASCADE,
    snippet_id UUID NOT NULL REFERENCES public.snippets(id) ON DELETE CASCADE,
    added_by UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    sort_order INTEGER DEFAULT 0,
    notes TEXT,
    added_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(collection_id, snippet_id)
);

-- ========================================================================
-- FEATURE 2: Team Code Review Workflow
-- ========================================================================

-- 1. Custom Types for Reviews
CREATE TYPE public.review_status AS ENUM (
    'submitted',
    'in_review', 
    'approved',
    'rejected',
    'published',
    'changes_requested'
);

CREATE TYPE public.reviewer_assignment_status AS ENUM ('pending', 'accepted', 'declined', 'completed');

-- 2. Snippet Reviews Table
CREATE TABLE public.snippet_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    snippet_id UUID NOT NULL REFERENCES public.snippets(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    submitter_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    status public.review_status DEFAULT 'submitted'::public.review_status,
    priority INTEGER DEFAULT 1,
    review_notes TEXT,
    submission_message TEXT,
    approved_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Review Assignments Table
CREATE TABLE public.review_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID NOT NULL REFERENCES public.snippet_reviews(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    assigned_by UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    status public.reviewer_assignment_status DEFAULT 'pending'::public.reviewer_assignment_status,
    decision TEXT CHECK (decision IN ('approve', 'reject', 'request_changes')),
    feedback TEXT,
    assigned_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ,
    UNIQUE(review_id, reviewer_id)
);

-- 4. Review Metrics Table (for analytics)
CREATE TABLE public.review_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID NOT NULL REFERENCES public.snippet_reviews(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    review_time_seconds INTEGER,
    comments_count INTEGER DEFAULT 0,
    calculated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ========================================================================
-- INDEXES (Performance Optimization)
-- ========================================================================

-- Collections Indexes
CREATE INDEX idx_snippet_collections_user_id ON public.snippet_collections(user_id);
CREATE INDEX idx_snippet_collections_team_id ON public.snippet_collections(team_id);
CREATE INDEX idx_snippet_collections_type ON public.snippet_collections(collection_type);
CREATE INDEX idx_collection_snippets_collection_id ON public.collection_snippets(collection_id);
CREATE INDEX idx_collection_snippets_snippet_id ON public.collection_snippets(snippet_id);
CREATE INDEX idx_collection_snippets_sort_order ON public.collection_snippets(collection_id, sort_order);

-- Review Workflow Indexes
CREATE INDEX idx_snippet_reviews_snippet_id ON public.snippet_reviews(snippet_id);
CREATE INDEX idx_snippet_reviews_team_id ON public.snippet_reviews(team_id);
CREATE INDEX idx_snippet_reviews_status ON public.snippet_reviews(status);
CREATE INDEX idx_snippet_reviews_submitter_id ON public.snippet_reviews(submitter_id);
CREATE INDEX idx_snippet_reviews_created_at ON public.snippet_reviews(created_at DESC);
CREATE INDEX idx_review_assignments_review_id ON public.review_assignments(review_id);
CREATE INDEX idx_review_assignments_reviewer_id ON public.review_assignments(reviewer_id);
CREATE INDEX idx_review_assignments_status ON public.review_assignments(status);
CREATE INDEX idx_review_metrics_review_id ON public.review_metrics(review_id);

-- ========================================================================
-- ROW LEVEL SECURITY (RLS)
-- ========================================================================

-- Enable RLS
ALTER TABLE public.snippet_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_snippets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.snippet_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_metrics ENABLE ROW LEVEL SECURITY;

-- Collections RLS Policies
CREATE POLICY "users_view_own_and_public_collections"
ON public.snippet_collections
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR is_public = true);

CREATE POLICY "users_manage_own_collections"
ON public.snippet_collections
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_manage_collection_snippets"
ON public.collection_snippets
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.snippet_collections sc
        WHERE sc.id = collection_snippets.collection_id
        AND sc.user_id = auth.uid()
    )
)
WITH CHECK (added_by = auth.uid());

-- Review Workflow RLS Policies
CREATE POLICY "team_members_view_team_reviews"
ON public.snippet_reviews
FOR SELECT
TO authenticated
USING (
    team_id IN (
        SELECT team_id FROM public.user_profiles WHERE id = auth.uid()
    )
);

CREATE POLICY "submitters_manage_own_reviews"
ON public.snippet_reviews
FOR ALL
TO authenticated
USING (submitter_id = auth.uid())
WITH CHECK (submitter_id = auth.uid());

CREATE POLICY "reviewers_view_assignments"
ON public.review_assignments
FOR SELECT
TO authenticated
USING (reviewer_id = auth.uid() OR assigned_by = auth.uid());

CREATE POLICY "reviewers_update_own_assignments"
ON public.review_assignments
FOR UPDATE
TO authenticated
USING (reviewer_id = auth.uid())
WITH CHECK (reviewer_id = auth.uid());

CREATE POLICY "team_admins_manage_assignments"
ON public.review_assignments
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles up
        WHERE up.id = auth.uid()
        AND up.role IN ('team_admin', 'company_admin')
    )
);

CREATE POLICY "reviewers_view_metrics"
ON public.review_metrics
FOR SELECT
TO authenticated
USING (reviewer_id = auth.uid());

-- ========================================================================
-- TRIGGERS
-- ========================================================================

-- Trigger to update snippet count in collections
CREATE OR REPLACE FUNCTION public.update_collection_snippet_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.snippet_collections
        SET snippets_count = snippets_count + 1
        WHERE id = NEW.collection_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.snippet_collections
        SET snippets_count = GREATEST(0, snippets_count - 1)
        WHERE id = OLD.collection_id;
    END IF;
    RETURN NULL;
END;
$$;

CREATE TRIGGER trigger_update_collection_snippet_count
AFTER INSERT OR DELETE ON public.collection_snippets
FOR EACH ROW
EXECUTE FUNCTION public.update_collection_snippet_count();

-- Trigger for updated_at columns
CREATE TRIGGER update_snippet_collections_updated_at
BEFORE UPDATE ON public.snippet_collections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_snippet_reviews_updated_at
BEFORE UPDATE ON public.snippet_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- ========================================================================
-- HELPER FUNCTIONS
-- ========================================================================

-- Function to get collection statistics
CREATE OR REPLACE FUNCTION public.get_collection_stats(collection_uuid UUID)
RETURNS TABLE(
    total_snippets INTEGER,
    languages_count INTEGER,
    total_views INTEGER,
    total_likes INTEGER
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT
        COUNT(DISTINCT cs.snippet_id)::INTEGER as total_snippets,
        COUNT(DISTINCT s.language)::INTEGER as languages_count,
        COALESCE(SUM(s.views_count), 0)::INTEGER as total_views,
        COALESCE(SUM(s.likes_count), 0)::INTEGER as total_likes
    FROM public.collection_snippets cs
    JOIN public.snippets s ON cs.snippet_id = s.id
    WHERE cs.collection_id = collection_uuid;
$$;

-- Function to calculate review metrics
CREATE OR REPLACE FUNCTION public.calculate_review_metrics(review_uuid UUID)
RETURNS TABLE(
    avg_review_time_hours NUMERIC,
    total_comments INTEGER,
    approval_rate NUMERIC
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT
        ROUND(AVG(rm.review_time_seconds) / 3600.0, 2) as avg_review_time_hours,
        SUM(rm.comments_count)::INTEGER as total_comments,
        ROUND(
            (COUNT(CASE WHEN ra.decision = 'approve' THEN 1 END)::NUMERIC /
            NULLIF(COUNT(ra.id), 0)) * 100, 2
        ) as approval_rate
    FROM public.review_metrics rm
    LEFT JOIN public.review_assignments ra ON rm.review_id = ra.review_id
    WHERE rm.review_id = review_uuid
    GROUP BY rm.review_id;
$$;

-- ========================================================================
-- MOCK DATA
-- ========================================================================

DO $$
DECLARE
    user1_id UUID;
    user2_id UUID;
    team_id UUID;
    collection1_id UUID;
    collection2_id UUID;
    snippet1_id UUID;
    snippet2_id UUID;
    review1_id UUID;
BEGIN
    -- Get existing users and teams
    SELECT id INTO user1_id FROM public.user_profiles WHERE email = 'john.doe@splice1.com' LIMIT 1;
    SELECT id INTO user2_id FROM public.user_profiles WHERE email = 'sarah.smith@splice1.com' LIMIT 1;
    SELECT id INTO team_id FROM public.teams LIMIT 1;
    SELECT id INTO snippet1_id FROM public.snippets WHERE title = 'React Hook for API Calls' LIMIT 1;
    SELECT id INTO snippet2_id FROM public.snippets WHERE title = 'Python Data Validation' LIMIT 1;

    -- Only proceed if we have the required data
    IF user1_id IS NOT NULL AND user2_id IS NOT NULL THEN
        -- Create Collections
        INSERT INTO public.snippet_collections (id, name, description, collection_type, user_id, is_public)
        VALUES
            (gen_random_uuid(), 'React Best Practices', 'Curated collection of React hooks and patterns', 'learning_path', user1_id, true),
            (gen_random_uuid(), 'Backend Utilities', 'Python and Node.js utility functions', 'personal', user2_id, false)
        RETURNING id INTO collection1_id;

        SELECT id INTO collection2_id FROM public.snippet_collections WHERE name = 'Backend Utilities';

        -- Add snippets to collections
        IF snippet1_id IS NOT NULL AND collection1_id IS NOT NULL THEN
            INSERT INTO public.collection_snippets (collection_id, snippet_id, added_by, sort_order, notes)
            VALUES
                (collection1_id, snippet1_id, user1_id, 1, 'Essential hook for data fetching');
        END IF;

        IF snippet2_id IS NOT NULL AND collection2_id IS NOT NULL THEN
            INSERT INTO public.collection_snippets (collection_id, snippet_id, added_by, sort_order, notes)
            VALUES
                (collection2_id, snippet2_id, user2_id, 1, 'Type validation decorator');
        END IF;

        -- Create Review Workflow Data
        IF team_id IS NOT NULL AND snippet1_id IS NOT NULL THEN
            INSERT INTO public.snippet_reviews (id, snippet_id, team_id, submitter_id, status, priority, submission_message)
            VALUES
                (gen_random_uuid(), snippet1_id, team_id, user2_id, 'in_review', 2, 'Submitting React hook for team review before company-wide publication')
            RETURNING id INTO review1_id;

            -- Create review assignment
            IF review1_id IS NOT NULL THEN
                INSERT INTO public.review_assignments (review_id, reviewer_id, assigned_by, status)
                VALUES
                    (review1_id, user1_id, user2_id, 'accepted');

                -- Create review metrics
                INSERT INTO public.review_metrics (review_id, reviewer_id, review_time_seconds, comments_count)
                VALUES
                    (review1_id, user1_id, 1800, 3);
            END IF;
        END IF;
    END IF;
END $$;