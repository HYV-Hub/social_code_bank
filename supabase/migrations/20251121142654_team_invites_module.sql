-- Location: supabase/migrations/20251121142654_team_invites_module.sql
-- Schema Analysis: Existing teams table, user_profiles table, friend_requests table for invitation patterns
-- Integration Type: addition
-- Dependencies: teams, user_profiles

-- 1. Create ENUM for invite status
CREATE TYPE public.team_invite_status AS ENUM ('pending', 'accepted', 'rejected', 'cancelled');

-- 2. Create team_invites table
CREATE TABLE public.team_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    inviter_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    invitee_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    status public.team_invite_status DEFAULT 'pending'::public.team_invite_status NOT NULL,
    message TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMPTZ,
    UNIQUE(team_id, invitee_id, status)
);

-- 3. Create indexes
CREATE INDEX idx_team_invites_team_id ON public.team_invites(team_id);
CREATE INDEX idx_team_invites_inviter_id ON public.team_invites(inviter_id);
CREATE INDEX idx_team_invites_invitee_id ON public.team_invites(invitee_id);
CREATE INDEX idx_team_invites_status ON public.team_invites(status);

-- 4. Enable RLS
ALTER TABLE public.team_invites ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies
-- Users can view invites they sent or received
CREATE POLICY "users_view_own_team_invites"
ON public.team_invites
FOR SELECT
TO authenticated
USING (
    inviter_id = auth.uid() OR invitee_id = auth.uid()
);

-- Users can create invites for teams they created
CREATE POLICY "team_creators_send_invites"
ON public.team_invites
FOR INSERT
TO authenticated
WITH CHECK (
    inviter_id = auth.uid() AND
    EXISTS (
        SELECT 1 FROM public.teams t
        WHERE t.id = team_id AND t.created_by = auth.uid()
    )
);

-- Users can update invites they received
CREATE POLICY "invitees_respond_to_invites"
ON public.team_invites
FOR UPDATE
TO authenticated
USING (invitee_id = auth.uid())
WITH CHECK (invitee_id = auth.uid());

-- Users can cancel invites they sent
CREATE POLICY "inviters_cancel_invites"
ON public.team_invites
FOR UPDATE
TO authenticated
USING (inviter_id = auth.uid())
WITH CHECK (inviter_id = auth.uid());

-- 6. Create trigger for updated_at
CREATE TRIGGER update_team_invites_updated_at
    BEFORE UPDATE ON public.team_invites
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 7. Create function to accept team invite and update user profile
CREATE OR REPLACE FUNCTION public.accept_team_invite(invite_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    invite_team_id UUID;
    invite_invitee_id UUID;
BEGIN
    -- Get invite details
    SELECT team_id, invitee_id INTO invite_team_id, invite_invitee_id
    FROM public.team_invites
    WHERE id = invite_uuid AND invitee_id = auth.uid() AND status = 'pending';
    
    IF invite_team_id IS NULL THEN
        RETURN false;
    END IF;
    
    -- Update invite status
    UPDATE public.team_invites
    SET status = 'accepted'::public.team_invite_status,
        responded_at = CURRENT_TIMESTAMP
    WHERE id = invite_uuid;
    
    -- Update user profile with team_id
    UPDATE public.user_profiles
    SET team_id = invite_team_id
    WHERE id = invite_invitee_id;
    
    RETURN true;
END;
$$;

-- 8. Add mock data (reference existing users)
DO $$
DECLARE
    existing_team_id UUID;
    existing_inviter_id UUID;
    existing_invitee_id UUID;
BEGIN
    -- Get existing team
    SELECT id, created_by INTO existing_team_id, existing_inviter_id
    FROM public.teams
    LIMIT 1;
    
    -- Get another existing user to invite
    SELECT id INTO existing_invitee_id
    FROM public.user_profiles
    WHERE id != existing_inviter_id
    LIMIT 1;
    
    -- Only create mock invites if we have the required data
    IF existing_team_id IS NOT NULL AND existing_inviter_id IS NOT NULL AND existing_invitee_id IS NOT NULL THEN
        INSERT INTO public.team_invites (team_id, inviter_id, invitee_id, message, status)
        VALUES
            (existing_team_id, existing_inviter_id, existing_invitee_id, 'Join our amazing team!', 'pending'::public.team_invite_status);
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Mock data creation skipped: %', SQLERRM;
END $$;