-- Location: supabase/migrations/20251120182540_team_chat_and_friend_requests.sql
-- Schema Analysis: Existing tables - teams, user_profiles, follows
-- Integration Type: Addition - New team chat and friend request functionality
-- Dependencies: teams, user_profiles

-- 1. Create ENUM types
CREATE TYPE public.message_type AS ENUM ('text', 'code', 'file', 'image');
CREATE TYPE public.friend_request_status AS ENUM ('pending', 'accepted', 'rejected');

-- 2. Create team_channels table
CREATE TABLE public.team_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_private BOOLEAN DEFAULT false,
    created_by UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create team_channel_members table
CREATE TABLE public.team_channel_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID REFERENCES public.team_channels(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(channel_id, user_id)
);

-- 4. Create team_messages table
CREATE TABLE public.team_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID REFERENCES public.team_channels(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type public.message_type DEFAULT 'text'::public.message_type,
    parent_message_id UUID REFERENCES public.team_messages(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. Create message_reactions table
CREATE TABLE public.message_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID REFERENCES public.team_messages(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    emoji TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(message_id, user_id, emoji)
);

-- 6. Create friend_requests table
CREATE TABLE public.friend_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    status public.friend_request_status DEFAULT 'pending'::public.friend_request_status,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(sender_id, receiver_id)
);

-- 7. Create indexes
CREATE INDEX idx_team_channels_team_id ON public.team_channels(team_id);
CREATE INDEX idx_team_channels_created_by ON public.team_channels(created_by);
CREATE INDEX idx_team_channel_members_channel_id ON public.team_channel_members(channel_id);
CREATE INDEX idx_team_channel_members_user_id ON public.team_channel_members(user_id);
CREATE INDEX idx_team_messages_channel_id ON public.team_messages(channel_id);
CREATE INDEX idx_team_messages_user_id ON public.team_messages(user_id);
CREATE INDEX idx_team_messages_created_at ON public.team_messages(created_at);
CREATE INDEX idx_message_reactions_message_id ON public.message_reactions(message_id);
CREATE INDEX idx_friend_requests_sender_id ON public.friend_requests(sender_id);
CREATE INDEX idx_friend_requests_receiver_id ON public.friend_requests(receiver_id);
CREATE INDEX idx_friend_requests_status ON public.friend_requests(status);

-- 8. Enable RLS
ALTER TABLE public.team_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_channel_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friend_requests ENABLE ROW LEVEL SECURITY;

-- 9. Create RLS policies

-- Team channels - team members can see channels
CREATE POLICY "team_members_view_channels"
ON public.team_channels
FOR SELECT
TO authenticated
USING (
    team_id IN (
        SELECT team_id FROM public.user_profiles WHERE id = auth.uid()
    )
);

-- Team members can create channels
CREATE POLICY "team_members_create_channels"
ON public.team_channels
FOR INSERT
TO authenticated
WITH CHECK (created_by = auth.uid());

-- Channel creators can update their channels
CREATE POLICY "creators_update_channels"
ON public.team_channels
FOR UPDATE
TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- Channel members - users can view their memberships
CREATE POLICY "users_view_channel_memberships"
ON public.team_channel_members
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR channel_id IN (
    SELECT channel_id FROM public.team_channel_members WHERE user_id = auth.uid()
));

-- Users can join channels
CREATE POLICY "users_join_channels"
ON public.team_channel_members
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Messages - channel members can view messages
CREATE POLICY "channel_members_view_messages"
ON public.team_messages
FOR SELECT
TO authenticated
USING (
    channel_id IN (
        SELECT channel_id FROM public.team_channel_members WHERE user_id = auth.uid()
    )
);

-- Users can send messages
CREATE POLICY "users_send_messages"
ON public.team_messages
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Users can update their own messages
CREATE POLICY "users_update_own_messages"
ON public.team_messages
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Message reactions - users manage their own reactions
CREATE POLICY "users_manage_reactions"
ON public.message_reactions
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Friend requests - users can view requests they sent or received
CREATE POLICY "users_view_friend_requests"
ON public.friend_requests
FOR SELECT
TO authenticated
USING (sender_id = auth.uid() OR receiver_id = auth.uid());

-- Users can send friend requests
CREATE POLICY "users_send_friend_requests"
ON public.friend_requests
FOR INSERT
TO authenticated
WITH CHECK (sender_id = auth.uid());

-- Users can update requests they received
CREATE POLICY "users_update_received_requests"
ON public.friend_requests
FOR UPDATE
TO authenticated
USING (receiver_id = auth.uid())
WITH CHECK (receiver_id = auth.uid());

-- 10. Create triggers for updated_at
CREATE TRIGGER update_team_channels_updated_at
BEFORE UPDATE ON public.team_channels
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_team_messages_updated_at
BEFORE UPDATE ON public.team_messages
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_friend_requests_updated_at
BEFORE UPDATE ON public.friend_requests
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 11. Mock data
DO $$
DECLARE
    team1_id UUID;
    team2_id UUID;
    user1_id UUID;
    user2_id UUID;
    channel1_id UUID := gen_random_uuid();
    channel2_id UUID := gen_random_uuid();
BEGIN
    -- Get existing team and user IDs
    SELECT id INTO team1_id FROM public.teams LIMIT 1 OFFSET 0;
    SELECT id INTO team2_id FROM public.teams LIMIT 1 OFFSET 1;
    SELECT id INTO user1_id FROM public.user_profiles LIMIT 1 OFFSET 0;
    SELECT id INTO user2_id FROM public.user_profiles LIMIT 1 OFFSET 1;

    -- Create channels
    INSERT INTO public.team_channels (id, team_id, name, description, created_by) VALUES
        (channel1_id, team1_id, 'general', 'General team discussion', user1_id),
        (channel2_id, team1_id, 'code-review', 'Code review discussions', user1_id);

    -- Add channel members
    INSERT INTO public.team_channel_members (channel_id, user_id) VALUES
        (channel1_id, user1_id),
        (channel1_id, user2_id),
        (channel2_id, user1_id),
        (channel2_id, user2_id);

    -- Add sample messages
    INSERT INTO public.team_messages (channel_id, user_id, content, message_type) VALUES
        (channel1_id, user1_id, 'Welcome to the team!', 'text'::public.message_type),
        (channel1_id, user2_id, 'Thanks! Excited to be here', 'text'::public.message_type),
        (channel2_id, user1_id, 'Please review PR #123', 'text'::public.message_type);

    -- Add friend requests
    INSERT INTO public.friend_requests (sender_id, receiver_id, status) VALUES
        (user1_id, user2_id, 'accepted'::public.friend_request_status);

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Mock data error: %', SQLERRM;
END $$;