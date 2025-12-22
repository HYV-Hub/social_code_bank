-- =====================================================
-- HIVE COLLECTIONS MODULE
-- Enable hive members to create and manage collections
-- =====================================================

-- Create hive_collections table
CREATE TABLE IF NOT EXISTS public.hive_collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hive_id UUID NOT NULL REFERENCES public.hives(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    snippet_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_hive_collection_name UNIQUE(hive_id, name)
);

-- Create hive_collection_snippets junction table
CREATE TABLE IF NOT EXISTS public.hive_collection_snippets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collection_id UUID NOT NULL REFERENCES public.hive_collections(id) ON DELETE CASCADE,
    snippet_id UUID NOT NULL REFERENCES public.snippets(id) ON DELETE CASCADE,
    added_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_collection_snippet UNIQUE(collection_id, snippet_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_hive_collections_hive_id ON public.hive_collections(hive_id);
CREATE INDEX IF NOT EXISTS idx_hive_collections_created_by ON public.hive_collections(created_by);
CREATE INDEX IF NOT EXISTS idx_hive_collection_snippets_collection_id ON public.hive_collection_snippets(collection_id);
CREATE INDEX IF NOT EXISTS idx_hive_collection_snippets_snippet_id ON public.hive_collection_snippets(snippet_id);

-- Enable RLS
ALTER TABLE public.hive_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hive_collection_snippets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for hive_collections

-- Policy: Hive members can view collections in their hives
CREATE POLICY "hive_collections_select_policy" ON public.hive_collections
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.hive_members
            WHERE hive_members.hive_id = hive_collections.hive_id
            AND hive_members.user_id = auth.uid()
        )
    );

-- Policy: Hive members can create collections
CREATE POLICY "hive_collections_insert_policy" ON public.hive_collections
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.hive_members
            WHERE hive_members.hive_id = hive_collections.hive_id
            AND hive_members.user_id = auth.uid()
        )
        AND created_by = auth.uid()
    );

-- Policy: Collection creators can update their collections
CREATE POLICY "hive_collections_update_policy" ON public.hive_collections
    FOR UPDATE
    USING (created_by = auth.uid())
    WITH CHECK (created_by = auth.uid());

-- Policy: Collection creators and hive admins can delete collections
CREATE POLICY "hive_collections_delete_policy" ON public.hive_collections
    FOR DELETE
    USING (
        created_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.hive_members
            WHERE hive_members.hive_id = hive_collections.hive_id
            AND hive_members.user_id = auth.uid()
            AND hive_members.role IN ('admin', 'owner')
        )
    );

-- RLS Policies for hive_collection_snippets

-- Policy: Anyone who can see the collection can see its snippets
CREATE POLICY "hive_collection_snippets_select_policy" ON public.hive_collection_snippets
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.hive_collections hc
            JOIN public.hive_members hm ON hm.hive_id = hc.hive_id
            WHERE hc.id = hive_collection_snippets.collection_id
            AND hm.user_id = auth.uid()
        )
    );

-- Policy: Hive members can add snippets to collections
CREATE POLICY "hive_collection_snippets_insert_policy" ON public.hive_collection_snippets
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.hive_collections hc
            JOIN public.hive_members hm ON hm.hive_id = hc.hive_id
            WHERE hc.id = hive_collection_snippets.collection_id
            AND hm.user_id = auth.uid()
        )
        AND added_by = auth.uid()
    );

-- Policy: Users can remove snippets they added or collection owners can remove any
CREATE POLICY "hive_collection_snippets_delete_policy" ON public.hive_collection_snippets
    FOR DELETE
    USING (
        added_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.hive_collections
            WHERE hive_collections.id = hive_collection_snippets.collection_id
            AND hive_collections.created_by = auth.uid()
        )
    );

-- Function to update snippet_count in hive_collections
CREATE OR REPLACE FUNCTION update_hive_collection_snippet_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.hive_collections
        SET snippet_count = snippet_count + 1,
            updated_at = NOW()
        WHERE id = NEW.collection_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.hive_collections
        SET snippet_count = GREATEST(snippet_count - 1, 0),
            updated_at = NOW()
        WHERE id = OLD.collection_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update snippet count
DROP TRIGGER IF EXISTS trigger_update_hive_collection_snippet_count ON public.hive_collection_snippets;
CREATE TRIGGER trigger_update_hive_collection_snippet_count
    AFTER INSERT OR DELETE ON public.hive_collection_snippets
    FOR EACH ROW
    EXECUTE FUNCTION update_hive_collection_snippet_count();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_hive_collection_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update timestamp on collection updates
DROP TRIGGER IF EXISTS trigger_update_hive_collection_timestamp ON public.hive_collections;
CREATE TRIGGER trigger_update_hive_collection_timestamp
    BEFORE UPDATE ON public.hive_collections
    FOR EACH ROW
    EXECUTE FUNCTION update_hive_collection_timestamp();

-- Mock data for testing (optional - remove in production)
DO $$
DECLARE
    v_hive_id UUID;
    v_user_id UUID;
    v_collection_id UUID;
    v_snippet_id UUID;
BEGIN
    -- Get a test hive
    SELECT id INTO v_hive_id FROM public.hives LIMIT 1;
    
    -- Get a test user who is a member of the hive
    SELECT user_id INTO v_user_id 
    FROM public.hive_members 
    WHERE hive_id = v_hive_id
    LIMIT 1;
    
    IF v_hive_id IS NOT NULL AND v_user_id IS NOT NULL THEN
        -- Create sample collections one by one
        INSERT INTO public.hive_collections (hive_id, created_by, name, description)
        VALUES (v_hive_id, v_user_id, 'React Best Practices', 'Collection of React component patterns and hooks')
        RETURNING id INTO v_collection_id;
        
        -- Add a snippet to the first collection
        SELECT id INTO v_snippet_id FROM public.snippets LIMIT 1;
        
        IF v_snippet_id IS NOT NULL THEN
            INSERT INTO public.hive_collection_snippets (collection_id, snippet_id, added_by)
            VALUES (v_collection_id, v_snippet_id, v_user_id);
        END IF;
        
        -- Create second collection
        INSERT INTO public.hive_collections (hive_id, created_by, name, description)
        VALUES (v_hive_id, v_user_id, 'Database Queries', 'Useful SQL queries and optimization techniques');
        
        -- Create third collection
        INSERT INTO public.hive_collections (hive_id, created_by, name, description)
        VALUES (v_hive_id, v_user_id, 'API Integrations', 'Code snippets for various API integrations');
    END IF;
END $$;