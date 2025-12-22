-- Location: supabase/migrations/20251222132715_global_hives_complete.sql
-- Schema Analysis: Existing teams table for company teams, user_profiles for auth
-- Integration Type: Addition - New global hives system separate from company teams
-- Dependencies: user_profiles, snippets, snippet_collections

-- 1. TYPES
CREATE TYPE public.hive_privacy AS ENUM ('public', 'private');
CREATE TYPE public.hive_member_role AS ENUM ('owner', 'admin', 'member');
CREATE TYPE public.join_request_status AS ENUM ('pending', 'approved', 'rejected', 'cancelled');

-- 2. CORE TABLES

-- Global Hives (separate from company teams)
CREATE TABLE public.hives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    privacy public.hive_privacy DEFAULT 'public'::public.hive_privacy,
    owner_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    member_count INTEGER DEFAULT 1,
    snippet_count INTEGER DEFAULT 0,
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Hive Members
CREATE TABLE public.hive_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hive_id UUID REFERENCES public.hives(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    role public.hive_member_role DEFAULT 'member'::public.hive_member_role,
    joined_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(hive_id, user_id)
);

-- Hive Join Requests
CREATE TABLE public.hive_join_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hive_id UUID REFERENCES public.hives(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    status public.join_request_status DEFAULT 'pending'::public.join_request_status,
    message TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMPTZ,
    UNIQUE(hive_id, user_id, status)
);

-- Hive Collections
CREATE TABLE public.hive_collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hive_id UUID REFERENCES public.hives(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    snippet_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Hive Collection Items (snippets in collections)
CREATE TABLE public.hive_collection_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collection_id UUID REFERENCES public.hive_collections(id) ON DELETE CASCADE,
    snippet_id UUID REFERENCES public.snippets(id) ON DELETE CASCADE,
    added_by UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(collection_id, snippet_id)
);

-- Hive Snippets (link snippets to hives)
CREATE TABLE public.hive_snippets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hive_id UUID REFERENCES public.hives(id) ON DELETE CASCADE,
    snippet_id UUID REFERENCES public.snippets(id) ON DELETE CASCADE,
    added_by UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(hive_id, snippet_id)
);

-- Hive Metrics (for trending calculations)
CREATE TABLE public.hive_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hive_id UUID REFERENCES public.hives(id) ON DELETE CASCADE,
    snippet_id UUID REFERENCES public.snippets(id) ON DELETE CASCADE,
    views INTEGER DEFAULT 0,
    saves INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    time_window TEXT DEFAULT 'week',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. INDEXES
CREATE INDEX idx_hives_owner_id ON public.hives(owner_id);
CREATE INDEX idx_hives_privacy ON public.hives(privacy);
CREATE INDEX idx_hives_slug ON public.hives(slug);
CREATE INDEX idx_hives_tags ON public.hives USING gin(tags);
CREATE INDEX idx_hive_members_hive_id ON public.hive_members(hive_id);
CREATE INDEX idx_hive_members_user_id ON public.hive_members(user_id);
CREATE INDEX idx_hive_join_requests_hive_id ON public.hive_join_requests(hive_id);
CREATE INDEX idx_hive_join_requests_user_id ON public.hive_join_requests(user_id);
CREATE INDEX idx_hive_join_requests_status ON public.hive_join_requests(status);
CREATE INDEX idx_hive_collections_hive_id ON public.hive_collections(hive_id);
CREATE INDEX idx_hive_collection_items_collection_id ON public.hive_collection_items(collection_id);
CREATE INDEX idx_hive_snippets_hive_id ON public.hive_snippets(hive_id);
CREATE INDEX idx_hive_snippets_snippet_id ON public.hive_snippets(snippet_id);

-- 4. FUNCTIONS (MUST BE BEFORE RLS POLICIES)

-- Function to check if user is hive member
CREATE OR REPLACE FUNCTION public.is_hive_member(hive_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.hive_members hm
    WHERE hm.hive_id = hive_uuid 
    AND hm.user_id = auth.uid()
)
$$;

-- Function to check if user is hive admin or owner
CREATE OR REPLACE FUNCTION public.is_hive_admin(hive_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.hive_members hm
    WHERE hm.hive_id = hive_uuid 
    AND hm.user_id = auth.uid()
    AND hm.role IN ('owner', 'admin')
)
$$;

-- Function to increment hive member count
CREATE OR REPLACE FUNCTION public.increment_hive_member_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.hives
    SET member_count = member_count + 1
    WHERE id = NEW.hive_id;
    RETURN NEW;
END;
$$;

-- Function to decrement hive member count
CREATE OR REPLACE FUNCTION public.decrement_hive_member_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.hives
    SET member_count = member_count - 1
    WHERE id = OLD.hive_id;
    RETURN OLD;
END;
$$;

-- Function to add hive creator as owner
CREATE OR REPLACE FUNCTION public.add_hive_creator_as_owner()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.hive_members (hive_id, user_id, role)
    VALUES (NEW.id, NEW.owner_id, 'owner');
    RETURN NEW;
END;
$$;

-- 5. ENABLE RLS
ALTER TABLE public.hives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hive_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hive_join_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hive_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hive_collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hive_snippets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hive_metrics ENABLE ROW LEVEL SECURITY;

-- 6. RLS POLICIES

-- Hives policies
CREATE POLICY "public_can_view_public_hives"
ON public.hives FOR SELECT
TO public
USING (privacy = 'public'::public.hive_privacy);

CREATE POLICY "authenticated_can_view_all_hives"
ON public.hives FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "users_can_create_hives"
ON public.hives FOR INSERT
TO authenticated
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "owners_can_update_hives"
ON public.hives FOR UPDATE
TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "owners_can_delete_hives"
ON public.hives FOR DELETE
TO authenticated
USING (owner_id = auth.uid());

-- Hive members policies
CREATE POLICY "members_can_view_memberships"
ON public.hive_members FOR SELECT
TO authenticated
USING (
    user_id = auth.uid() 
    OR public.is_hive_member(hive_id)
);

CREATE POLICY "admins_can_manage_members"
ON public.hive_members FOR ALL
TO authenticated
USING (public.is_hive_admin(hive_id))
WITH CHECK (public.is_hive_admin(hive_id));

-- Hive join requests policies
CREATE POLICY "users_can_view_own_requests"
ON public.hive_join_requests FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.is_hive_admin(hive_id));

CREATE POLICY "users_can_create_requests"
ON public.hive_join_requests FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_can_cancel_own_requests"
ON public.hive_join_requests FOR UPDATE
TO authenticated
USING (user_id = auth.uid() AND status = 'pending'::public.join_request_status)
WITH CHECK (user_id = auth.uid() AND status = 'cancelled'::public.join_request_status);

CREATE POLICY "admins_can_approve_requests"
ON public.hive_join_requests FOR UPDATE
TO authenticated
USING (public.is_hive_admin(hive_id))
WITH CHECK (public.is_hive_admin(hive_id));

-- Hive collections policies
CREATE POLICY "members_can_view_collections"
ON public.hive_collections FOR SELECT
TO authenticated
USING (public.is_hive_member(hive_id));

CREATE POLICY "members_can_create_collections"
ON public.hive_collections FOR INSERT
TO authenticated
WITH CHECK (public.is_hive_member(hive_id) AND created_by = auth.uid());

CREATE POLICY "creators_can_update_collections"
ON public.hive_collections FOR UPDATE
TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- Hive collection items policies
CREATE POLICY "members_can_view_collection_items"
ON public.hive_collection_items FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.hive_collections hc
        WHERE hc.id = collection_id
        AND public.is_hive_member(hc.hive_id)
    )
);

CREATE POLICY "members_can_add_collection_items"
ON public.hive_collection_items FOR INSERT
TO authenticated
WITH CHECK (
    added_by = auth.uid()
    AND EXISTS (
        SELECT 1 FROM public.hive_collections hc
        WHERE hc.id = collection_id
        AND public.is_hive_member(hc.hive_id)
    )
);

-- Hive snippets policies
CREATE POLICY "public_can_view_public_hive_snippets"
ON public.hive_snippets FOR SELECT
TO public
USING (
    EXISTS (
        SELECT 1 FROM public.hives h
        WHERE h.id = hive_id
        AND h.privacy = 'public'::public.hive_privacy
    )
);

CREATE POLICY "members_can_view_hive_snippets"
ON public.hive_snippets FOR SELECT
TO authenticated
USING (public.is_hive_member(hive_id));

CREATE POLICY "members_can_add_snippets"
ON public.hive_snippets FOR INSERT
TO authenticated
WITH CHECK (
    added_by = auth.uid()
    AND public.is_hive_member(hive_id)
);

-- 7. TRIGGERS
CREATE TRIGGER increment_member_count
AFTER INSERT ON public.hive_members
FOR EACH ROW
EXECUTE FUNCTION public.increment_hive_member_count();

CREATE TRIGGER decrement_member_count
AFTER DELETE ON public.hive_members
FOR EACH ROW
EXECUTE FUNCTION public.decrement_hive_member_count();

CREATE TRIGGER add_creator_as_hive_owner
AFTER INSERT ON public.hives
FOR EACH ROW
EXECUTE FUNCTION public.add_hive_creator_as_owner();

CREATE TRIGGER update_hives_updated_at
BEFORE UPDATE ON public.hives
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 8. MOCK DATA
DO $$
DECLARE
    existing_user_id UUID;
    hive1_id UUID := gen_random_uuid();
    hive2_id UUID := gen_random_uuid();
    hive3_id UUID := gen_random_uuid();
    collection1_id UUID := gen_random_uuid();
    snippet1_id UUID;
BEGIN
    -- Get existing user
    SELECT id INTO existing_user_id FROM public.user_profiles LIMIT 1;
    
    IF existing_user_id IS NOT NULL THEN
        -- Create sample hives
        INSERT INTO public.hives (id, name, slug, description, privacy, owner_id, tags)
        VALUES
            (hive1_id, 'Frontend Masters', 'frontend-masters', 'A community for frontend developers sharing React, Vue, and modern web development snippets', 'public', existing_user_id, ARRAY['react', 'vue', 'javascript', 'css']),
            (hive2_id, 'Python Experts', 'python-experts', 'Advanced Python programming techniques and best practices', 'public', existing_user_id, ARRAY['python', 'django', 'flask']),
            (hive3_id, 'Private Dev Team', 'private-dev-team', 'Internal development team snippets and resources', 'private', existing_user_id, ARRAY['internal', 'team']);
        
        -- Create sample collections
        INSERT INTO public.hive_collections (id, hive_id, name, description, created_by)
        VALUES
            (collection1_id, hive1_id, 'React Hooks Patterns', 'Common React hooks patterns and best practices', existing_user_id);
        
        -- Link existing snippet to hive
        SELECT id INTO snippet1_id FROM public.snippets LIMIT 1;
        IF snippet1_id IS NOT NULL THEN
            INSERT INTO public.hive_snippets (hive_id, snippet_id, added_by)
            VALUES (hive1_id, snippet1_id, existing_user_id);
            
            -- Add to collection
            INSERT INTO public.hive_collection_items (collection_id, snippet_id, added_by)
            VALUES (collection1_id, snippet1_id, existing_user_id);
        END IF;
    END IF;
END $$;