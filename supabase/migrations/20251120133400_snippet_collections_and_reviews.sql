-- Location: supabase/migrations/20251120133400_snippet_collections_and_reviews.sql
-- Schema Analysis: Building upon existing snippets, user_profiles, teams, notifications tables
-- Integration Type: Addition - Adding collection and review workflow capabilities
-- Dependencies: snippets, user_profiles, teams, notifications

-- ==========================================
-- 1. TYPES (Enums)
-- ==========================================

-- Review status for snippet review workflow
CREATE TYPE public.review_status AS ENUM (
    'pending',
    'approved',
    'rejected',
    'changes_requested'
);

-- ==========================================
-- 2. SNIPPET COLLECTIONS TABLE
-- ==========================================

CREATE TABLE public.snippet_collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    tags TEXT[] DEFAULT '{}',
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    snippets_count INTEGER DEFAULT 0
);

-- ==========================================
-- 3. COLLECTION SNIPPETS JUNCTION TABLE
-- ==========================================

CREATE TABLE public.collection_snippets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collection_id UUID NOT NULL REFERENCES public.snippet_collections(id) ON DELETE CASCADE,
    snippet_id UUID NOT NULL REFERENCES public.snippets(id) ON DELETE CASCADE,
    position INTEGER DEFAULT 0,
    added_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    added_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    UNIQUE(collection_id, snippet_id)
);

-- ==========================================
-- 4. SNIPPET REVIEWS TABLE
-- ==========================================

CREATE TABLE public.snippet_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    snippet_id UUID NOT NULL REFERENCES public.snippets(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    status public.review_status DEFAULT 'pending'::public.review_status,
    review_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ
);

-- ==========================================
-- 5. INDEXES
-- ==========================================

-- snippet_collections indexes
CREATE INDEX idx_snippet_collections_user_id ON public.snippet_collections(user_id);
CREATE INDEX idx_snippet_collections_created_at ON public.snippet_collections(created_at);
CREATE INDEX idx_snippet_collections_is_public ON public.snippet_collections(is_public);

-- collection_snippets indexes
CREATE INDEX idx_collection_snippets_collection_id ON public.collection_snippets(collection_id);
CREATE INDEX idx_collection_snippets_snippet_id ON public.collection_snippets(snippet_id);
CREATE INDEX idx_collection_snippets_position ON public.collection_snippets(collection_id, position);

-- snippet_reviews indexes
CREATE INDEX idx_snippet_reviews_snippet_id ON public.snippet_reviews(snippet_id);
CREATE INDEX idx_snippet_reviews_reviewer_id ON public.snippet_reviews(reviewer_id);
CREATE INDEX idx_snippet_reviews_team_id ON public.snippet_reviews(team_id);
CREATE INDEX idx_snippet_reviews_status ON public.snippet_reviews(status);

-- ==========================================
-- 6. FUNCTIONS (Before RLS Policies)
-- ==========================================

-- Function to update snippets_count in collection
CREATE OR REPLACE FUNCTION public.update_collection_snippets_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.snippet_collections
        SET snippets_count = snippets_count + 1
        WHERE id = NEW.collection_id;
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.snippet_collections
        SET snippets_count = snippets_count - 1
        WHERE id = OLD.collection_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$func$;

-- ==========================================
-- 7. ENABLE ROW LEVEL SECURITY
-- ==========================================

ALTER TABLE public.snippet_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_snippets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.snippet_reviews ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 8. RLS POLICIES
-- ==========================================

-- snippet_collections policies (Pattern 2: Simple User Ownership)
CREATE POLICY "users_manage_own_snippet_collections"
ON public.snippet_collections
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Public read access for public collections (Pattern 4)
CREATE POLICY "public_can_read_public_collections"
ON public.snippet_collections
FOR SELECT
TO public
USING (is_public = true);

-- collection_snippets policies (Pattern 2: Simple User Ownership via collection)
CREATE POLICY "users_manage_own_collection_snippets"
ON public.collection_snippets
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.snippet_collections sc
        WHERE sc.id = collection_id AND sc.user_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.snippet_collections sc
        WHERE sc.id = collection_id AND sc.user_id = auth.uid()
    )
);

-- snippet_reviews policies (Pattern 2: Simple User Ownership)
CREATE POLICY "users_manage_own_snippet_reviews"
ON public.snippet_reviews
FOR ALL
TO authenticated
USING (reviewer_id = auth.uid())
WITH CHECK (reviewer_id = auth.uid());

-- Snippet authors can view reviews of their snippets
CREATE POLICY "snippet_authors_view_reviews"
ON public.snippet_reviews
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.snippets s
        WHERE s.id = snippet_id AND s.user_id = auth.uid()
    )
);

-- ==========================================
-- 9. TRIGGERS
-- ==========================================

-- Update snippets_count trigger
CREATE TRIGGER trigger_update_collection_snippets_count
AFTER INSERT OR DELETE ON public.collection_snippets
FOR EACH ROW
EXECUTE FUNCTION public.update_collection_snippets_count();

-- Update updated_at triggers
CREATE TRIGGER update_snippet_collections_updated_at
BEFORE UPDATE ON public.snippet_collections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_snippet_reviews_updated_at
BEFORE UPDATE ON public.snippet_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- ==========================================
-- 10. MOCK DATA
-- ==========================================

DO $$
DECLARE
    user1_id UUID;
    user2_id UUID;
    collection1_id UUID := gen_random_uuid();
    collection2_id UUID := gen_random_uuid();
    snippet1_id UUID;
    snippet2_id UUID;
BEGIN
    -- Get existing user IDs
    SELECT id INTO user1_id FROM public.user_profiles LIMIT 1 OFFSET 0;
    SELECT id INTO user2_id FROM public.user_profiles LIMIT 1 OFFSET 1;
    
    -- Get existing snippet IDs
    SELECT id INTO snippet1_id FROM public.snippets LIMIT 1 OFFSET 0;
    SELECT id INTO snippet2_id FROM public.snippets LIMIT 1 OFFSET 1;
    
    -- Only proceed if we have users and snippets
    IF user1_id IS NOT NULL AND snippet1_id IS NOT NULL THEN
        -- Create snippet collections
        INSERT INTO public.snippet_collections (id, user_id, title, description, tags, is_public)
        VALUES
            (collection1_id, user1_id, 'React Best Practices', 'Collection of useful React patterns and hooks', ARRAY['react', 'hooks', 'frontend'], true),
            (collection2_id, COALESCE(user2_id, user1_id), 'Backend Utilities', 'Python backend utility functions', ARRAY['python', 'backend', 'utilities'], false);
        
        -- Add snippets to collections
        INSERT INTO public.collection_snippets (collection_id, snippet_id, position, added_by)
        VALUES
            (collection1_id, snippet1_id, 0, user1_id),
            (collection2_id, snippet2_id, 0, COALESCE(user2_id, user1_id));
        
        -- Create snippet reviews (if we have user2)
        IF user2_id IS NOT NULL AND snippet1_id IS NOT NULL THEN
            INSERT INTO public.snippet_reviews (snippet_id, reviewer_id, status, review_notes)
            VALUES
                (snippet1_id, user2_id, 'pending'::public.review_status, 'Reviewing this snippet for team standards'),
                (snippet2_id, user1_id, 'approved'::public.review_status, 'Looks good, approved for company-wide use');
        END IF;
    ELSE
        RAISE NOTICE 'Skipping mock data: No existing users or snippets found. Create users and snippets first.';
    END IF;
END $$;