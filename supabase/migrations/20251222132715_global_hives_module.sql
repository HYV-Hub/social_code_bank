-- Location: supabase/migrations/20251222132715_global_hives_module.sql
-- Schema Analysis: Existing teams table for company teams, creating separate hives system
-- Integration Type: NEW_MODULE - Global Hives (separate from company teams)
-- Dependencies: user_profiles (existing)

-- 1. Create ENUM types for hives
CREATE TYPE public.hive_privacy AS ENUM ('public', 'private');
CREATE TYPE public.hive_member_role AS ENUM ('owner', 'admin', 'member');
CREATE TYPE public.hive_join_request_status AS ENUM ('pending', 'approved', 'rejected', 'cancelled');

-- 2. Create hives table (global, no company_id)
CREATE TABLE public.hives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    privacy public.hive_privacy DEFAULT 'public'::public.hive_privacy NOT NULL,
    owner_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    member_count INTEGER DEFAULT 1,
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create hive_members table
CREATE TABLE public.hive_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hive_id UUID REFERENCES public.hives(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    role public.hive_member_role DEFAULT 'member'::public.hive_member_role NOT NULL,
    joined_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(hive_id, user_id)
);

-- 4. Create hive_join_requests table
CREATE TABLE public.hive_join_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hive_id UUID REFERENCES public.hives(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    status public.hive_join_request_status DEFAULT 'pending'::public.hive_join_request_status NOT NULL,
    message TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMPTZ,
    UNIQUE(hive_id, user_id, status)
);

-- 5. Create hive_collections table
CREATE TABLE public.hive_collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hive_id UUID REFERENCES public.hives(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. Create hive_collection_items table (links snippets to collections)
CREATE TABLE public.hive_collection_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collection_id UUID REFERENCES public.hive_collections(id) ON DELETE CASCADE NOT NULL,
    snippet_id UUID REFERENCES public.snippets(id) ON DELETE CASCADE NOT NULL,
    added_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(collection_id, snippet_id)
);

-- 7. Create indexes for performance
CREATE INDEX idx_hives_owner_id ON public.hives(owner_id);
CREATE INDEX idx_hives_privacy ON public.hives(privacy);
CREATE INDEX idx_hives_slug ON public.hives(slug);
CREATE INDEX idx_hive_members_hive_id ON public.hive_members(hive_id);
CREATE INDEX idx_hive_members_user_id ON public.hive_members(user_id);
CREATE INDEX idx_hive_join_requests_hive_id ON public.hive_join_requests(hive_id);
CREATE INDEX idx_hive_join_requests_user_id ON public.hive_join_requests(user_id);
CREATE INDEX idx_hive_join_requests_status ON public.hive_join_requests(status);
CREATE INDEX idx_hive_collections_hive_id ON public.hive_collections(hive_id);
CREATE INDEX idx_hive_collection_items_collection_id ON public.hive_collection_items(collection_id);
CREATE INDEX idx_hive_collection_items_snippet_id ON public.hive_collection_items(snippet_id);

-- 8. Enable RLS on all tables
ALTER TABLE public.hives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hive_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hive_join_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hive_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hive_collection_items ENABLE ROW LEVEL SECURITY;

-- 9. Create helper function for member checking
CREATE OR REPLACE FUNCTION public.is_hive_member(hive_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.hive_members hm
    WHERE hm.hive_id = hive_uuid AND hm.user_id = auth.uid()
)
$$;

-- 10. Create RLS policies for hives
CREATE POLICY "public_can_read_public_hives"
ON public.hives
FOR SELECT
TO public
USING (privacy = 'public'::public.hive_privacy);

CREATE POLICY "members_can_read_private_hives"
ON public.hives
FOR SELECT
TO authenticated
USING (
    privacy = 'public'::public.hive_privacy OR
    owner_id = auth.uid() OR
    public.is_hive_member(id)
);

CREATE POLICY "users_can_create_hives"
ON public.hives
FOR INSERT
TO authenticated
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "owners_can_update_hives"
ON public.hives
FOR UPDATE
TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "owners_can_delete_hives"
ON public.hives
FOR DELETE
TO authenticated
USING (owner_id = auth.uid());

-- 11. Create RLS policies for hive_members
CREATE POLICY "members_can_view_hive_members"
ON public.hive_members
FOR SELECT
TO authenticated
USING (
    user_id = auth.uid() OR
    public.is_hive_member(hive_id) OR
    EXISTS (
        SELECT 1 FROM public.hives h
        WHERE h.id = hive_id AND h.privacy = 'public'::public.hive_privacy
    )
);

CREATE POLICY "users_can_join_public_hives"
ON public.hive_members
FOR INSERT
TO authenticated
WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
        SELECT 1 FROM public.hives h
        WHERE h.id = hive_id AND h.privacy = 'public'::public.hive_privacy
    )
);

CREATE POLICY "owners_admins_manage_members"
ON public.hive_members
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.hive_members hm
        WHERE hm.hive_id = hive_members.hive_id
        AND hm.user_id = auth.uid()
        AND hm.role IN ('owner'::public.hive_member_role, 'admin'::public.hive_member_role)
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.hive_members hm
        WHERE hm.hive_id = hive_members.hive_id
        AND hm.user_id = auth.uid()
        AND hm.role IN ('owner'::public.hive_member_role, 'admin'::public.hive_member_role)
    )
);

-- 12. Create RLS policies for hive_join_requests
CREATE POLICY "users_can_create_join_requests"
ON public.hive_join_requests
FOR INSERT
TO authenticated
WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
        SELECT 1 FROM public.hives h
        WHERE h.id = hive_id AND h.privacy = 'private'::public.hive_privacy
    )
);

CREATE POLICY "users_can_view_own_join_requests"
ON public.hive_join_requests
FOR SELECT
TO authenticated
USING (
    user_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.hive_members hm
        WHERE hm.hive_id = hive_join_requests.hive_id
        AND hm.user_id = auth.uid()
        AND hm.role IN ('owner'::public.hive_member_role, 'admin'::public.hive_member_role)
    )
);

CREATE POLICY "owners_admins_manage_join_requests"
ON public.hive_join_requests
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.hive_members hm
        WHERE hm.hive_id = hive_join_requests.hive_id
        AND hm.user_id = auth.uid()
        AND hm.role IN ('owner'::public.hive_member_role, 'admin'::public.hive_member_role)
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.hive_members hm
        WHERE hm.hive_id = hive_join_requests.hive_id
        AND hm.user_id = auth.uid()
        AND hm.role IN ('owner'::public.hive_member_role, 'admin'::public.hive_member_role)
    )
);

-- 13. Create RLS policies for hive_collections
CREATE POLICY "members_can_view_collections"
ON public.hive_collections
FOR SELECT
TO authenticated
USING (public.is_hive_member(hive_id));

CREATE POLICY "members_can_create_collections"
ON public.hive_collections
FOR INSERT
TO authenticated
WITH CHECK (public.is_hive_member(hive_id));

CREATE POLICY "members_can_update_collections"
ON public.hive_collections
FOR UPDATE
TO authenticated
USING (public.is_hive_member(hive_id))
WITH CHECK (public.is_hive_member(hive_id));

-- 14. Create RLS policies for hive_collection_items
CREATE POLICY "members_can_view_collection_items"
ON public.hive_collection_items
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.hive_collections hc
        WHERE hc.id = collection_id AND public.is_hive_member(hc.hive_id)
    )
);

CREATE POLICY "members_can_manage_collection_items"
ON public.hive_collection_items
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.hive_collections hc
        WHERE hc.id = collection_id AND public.is_hive_member(hc.hive_id)
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.hive_collections hc
        WHERE hc.id = collection_id AND public.is_hive_member(hc.hive_id)
    )
);

-- 15. Create trigger to auto-add owner as member
CREATE OR REPLACE FUNCTION public.add_hive_owner_as_member()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO public.hive_members (hive_id, user_id, role)
    VALUES (NEW.id, NEW.owner_id, 'owner'::public.hive_member_role);
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_hive_created
    AFTER INSERT ON public.hives
    FOR EACH ROW
    EXECUTE FUNCTION public.add_hive_owner_as_member();

-- 16. Create trigger to update hive member_count
CREATE OR REPLACE FUNCTION public.update_hive_member_count()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.hives
        SET member_count = member_count + 1
        WHERE id = NEW.hive_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.hives
        SET member_count = GREATEST(0, member_count - 1)
        WHERE id = OLD.hive_id;
    END IF;
    RETURN NULL;
END;
$$;

CREATE TRIGGER on_hive_member_change
    AFTER INSERT OR DELETE ON public.hive_members
    FOR EACH ROW
    EXECUTE FUNCTION public.update_hive_member_count();

-- 17. Create trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_hive_updated_at()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_hive_updated
    BEFORE UPDATE ON public.hives
    FOR EACH ROW
    EXECUTE FUNCTION public.update_hive_updated_at();

CREATE TRIGGER on_hive_join_request_updated
    BEFORE UPDATE ON public.hive_join_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.update_hive_updated_at();

-- 18. Mock data for testing
DO $$
DECLARE
    user1_id UUID;
    user2_id UUID;
    hive1_id UUID := gen_random_uuid();
    hive2_id UUID := gen_random_uuid();
    hive3_id UUID := gen_random_uuid();
BEGIN
    -- Get existing users
    SELECT id INTO user1_id FROM public.user_profiles ORDER BY created_at LIMIT 1;
    SELECT id INTO user2_id FROM public.user_profiles ORDER BY created_at OFFSET 1 LIMIT 1;

    IF user1_id IS NOT NULL THEN
        -- Create sample hives
        INSERT INTO public.hives (id, name, slug, description, privacy, owner_id, tags) VALUES
            (hive1_id, 'React Developers', 'react-developers', 'Community for React developers to share code and best practices', 'public'::public.hive_privacy, user1_id, ARRAY['react', 'javascript', 'frontend']),
            (hive2_id, 'Python Masters', 'python-masters', 'Advanced Python programming techniques and patterns', 'public'::public.hive_privacy, user1_id, ARRAY['python', 'backend', 'data-science']),
            (hive3_id, 'Private Innovation Lab', 'private-innovation-lab', 'Exclusive space for innovation team', 'private'::public.hive_privacy, user1_id, ARRAY['innovation', 'research']);

        -- Add second user as member to public hives if exists
        IF user2_id IS NOT NULL THEN
            INSERT INTO public.hive_members (hive_id, user_id, role) VALUES
                (hive1_id, user2_id, 'member'::public.hive_member_role),
                (hive2_id, user2_id, 'admin'::public.hive_member_role);

            -- Create a join request for private hive
            INSERT INTO public.hive_join_requests (hive_id, user_id, status, message) VALUES
                (hive3_id, user2_id, 'pending'::public.hive_join_request_status, 'I would like to join the innovation team');
        END IF;

        -- Create sample collections
        INSERT INTO public.hive_collections (hive_id, name, description) VALUES
            (hive1_id, 'React Hooks', 'Collection of useful React hooks'),
            (hive1_id, 'State Management', 'Redux, Context API, and other state management solutions'),
            (hive2_id, 'Data Processing', 'Python scripts for data processing');

    END IF;
END $$;