-- Location: supabase/migrations/20251121210800_team_members_and_explore_fix.sql
-- Schema Analysis: Existing teams, user_profiles tables with team relationships
-- Integration Type: Addition - proper team membership tracking
-- Dependencies: teams, user_profiles

-- 1. Create team_members junction table for proper many-to-many relationships
CREATE TABLE public.team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member',
    joined_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(team_id, user_id)
);

-- 2. Essential Indexes
CREATE INDEX idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX idx_team_members_user_id ON public.team_members(user_id);

-- 3. Enable RLS
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies - Pattern 2: Simple user ownership
CREATE POLICY "users_view_team_memberships"
ON public.team_members
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR team_id IN (SELECT id FROM public.teams WHERE created_by = auth.uid()));

CREATE POLICY "team_creators_manage_members"
ON public.team_members
FOR ALL
TO authenticated
USING (team_id IN (SELECT id FROM public.teams WHERE created_by = auth.uid()))
WITH CHECK (team_id IN (SELECT id FROM public.teams WHERE created_by = auth.uid()));

-- 5. Migrate existing team_id data from user_profiles to team_members
DO $$
DECLARE
    profile_record RECORD;
BEGIN
    FOR profile_record IN 
        SELECT id, team_id 
        FROM public.user_profiles 
        WHERE team_id IS NOT NULL
    LOOP
        INSERT INTO public.team_members (team_id, user_id, role, joined_at)
        VALUES (profile_record.team_id, profile_record.id, 'member', CURRENT_TIMESTAMP)
        ON CONFLICT (team_id, user_id) DO NOTHING;
    END LOOP;
END $$;

-- 6. Add mock data for existing teams
DO $$
DECLARE
    frontend_team_id UUID;
    backend_team_id UUID;
    user1_id UUID;
    user2_id UUID;
BEGIN
    -- Get existing team IDs
    SELECT id INTO frontend_team_id FROM public.teams WHERE name = 'Frontend Team' LIMIT 1;
    SELECT id INTO backend_team_id FROM public.teams WHERE name = 'Backend Team' LIMIT 1;
    
    -- Get existing user IDs
    SELECT id INTO user1_id FROM public.user_profiles LIMIT 1 OFFSET 0;
    SELECT id INTO user2_id FROM public.user_profiles LIMIT 1 OFFSET 1;
    
    -- Add team memberships if teams and users exist
    IF frontend_team_id IS NOT NULL AND user1_id IS NOT NULL THEN
        INSERT INTO public.team_members (team_id, user_id, role)
        VALUES (frontend_team_id, user1_id, 'member')
        ON CONFLICT (team_id, user_id) DO NOTHING;
    END IF;
    
    IF backend_team_id IS NOT NULL AND user2_id IS NOT NULL THEN
        INSERT INTO public.team_members (team_id, user_id, role)
        VALUES (backend_team_id, user2_id, 'member')
        ON CONFLICT (team_id, user_id) DO NOTHING;
    END IF;
END $$;