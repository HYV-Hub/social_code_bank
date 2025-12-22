-- Location: supabase/migrations/20251119214900_notifications_system_fixed.sql
-- Schema Analysis: Creating notifications module after auth module
-- Integration Type: Addition - New notification system
-- Dependencies: Requires user_profiles table from auth module (20251119214800)

-- ============================================================================
-- 1. CREATE NOTIFICATION ENUMS
-- ============================================================================

CREATE TYPE public.notification_type AS ENUM (
    'comment',
    'like',
    'follow',
    'mention',
    'bug_assignment',
    'team_update',
    'snippet_share',
    'bug_fix_submitted'
);

CREATE TYPE public.notification_priority AS ENUM (
    'low',
    'normal',
    'high',
    'urgent'
);

-- ============================================================================
-- 2. CREATE NOTIFICATIONS TABLE
-- ============================================================================

CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    type public.notification_type NOT NULL,
    priority public.notification_priority DEFAULT 'normal'::public.notification_priority,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    action_url TEXT,
    actor_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    actor_name TEXT,
    actor_avatar_url TEXT,
    source_id UUID,
    source_type TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMPTZ
);

-- ============================================================================
-- 3. CREATE NOTIFICATION PREFERENCES TABLE
-- ============================================================================

CREATE TABLE public.notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    email_comments BOOLEAN DEFAULT true,
    email_likes BOOLEAN DEFAULT true,
    email_follows BOOLEAN DEFAULT true,
    email_mentions BOOLEAN DEFAULT true,
    email_bug_assignments BOOLEAN DEFAULT true,
    email_team_updates BOOLEAN DEFAULT true,
    push_comments BOOLEAN DEFAULT true,
    push_likes BOOLEAN DEFAULT false,
    push_follows BOOLEAN DEFAULT true,
    push_mentions BOOLEAN DEFAULT true,
    push_bug_assignments BOOLEAN DEFAULT true,
    push_team_updates BOOLEAN DEFAULT true,
    in_app_comments BOOLEAN DEFAULT true,
    in_app_likes BOOLEAN DEFAULT true,
    in_app_follows BOOLEAN DEFAULT true,
    in_app_mentions BOOLEAN DEFAULT true,
    in_app_bug_assignments BOOLEAN DEFAULT true,
    in_app_team_updates BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- ============================================================================
-- 4. CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_type ON public.notifications(type);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_notification_preferences_user_id ON public.notification_preferences(user_id);

-- ============================================================================
-- 5. ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 6. CREATE RLS POLICIES FOR NOTIFICATIONS
-- ============================================================================

CREATE POLICY "users_view_own_notifications"
ON public.notifications
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "users_update_own_notifications"
ON public.notifications
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_delete_own_notifications"
ON public.notifications
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- ============================================================================
-- 7. CREATE RLS POLICIES FOR NOTIFICATION PREFERENCES
-- ============================================================================

CREATE POLICY "users_manage_own_preferences"
ON public.notification_preferences
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- 8. CREATE TRIGGER FUNCTION FOR AUTO PREFERENCES CREATION
-- ============================================================================

CREATE OR REPLACE FUNCTION public.create_notification_preferences_for_user()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO public.notification_preferences (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$;

-- ============================================================================
-- 9. CREATE TRIGGER ON USER_PROFILES
-- ============================================================================

CREATE TRIGGER on_user_profile_created_notification_prefs
    AFTER INSERT ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.create_notification_preferences_for_user();

-- ============================================================================
-- 10. CREATE HELPER FUNCTIONS
-- ============================================================================

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION public.mark_notification_read(notification_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.notifications
    SET is_read = true, read_at = CURRENT_TIMESTAMP
    WHERE id = notification_id AND user_id = auth.uid();
END;
$$;

-- Function to mark all notifications as read
CREATE OR REPLACE FUNCTION public.mark_all_notifications_read()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.notifications
    SET is_read = true, read_at = CURRENT_TIMESTAMP
    WHERE user_id = auth.uid() AND is_read = false;
END;
$$;

-- Function to get unread notification count
CREATE OR REPLACE FUNCTION public.get_unread_notification_count()
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT COUNT(*)::INTEGER
    FROM public.notifications
    WHERE user_id = auth.uid() AND is_read = false;
$$;

-- ============================================================================
-- 11. CREATE NOTIFICATION PREFERENCES FOR EXISTING USERS
-- ============================================================================

DO $$
BEGIN
    INSERT INTO public.notification_preferences (user_id)
    SELECT id FROM public.user_profiles
    ON CONFLICT (user_id) DO NOTHING;
    
    RAISE NOTICE 'Created notification preferences for all existing users';
END $$;

-- ============================================================================
-- 12. INSERT MOCK NOTIFICATIONS FOR TESTING
-- ============================================================================

DO $$
DECLARE
    user1_id UUID;
    user2_id UUID;
BEGIN
    -- Get first two users
    SELECT id INTO user1_id FROM public.user_profiles ORDER BY created_at LIMIT 1;
    SELECT id INTO user2_id FROM public.user_profiles WHERE id != user1_id ORDER BY created_at LIMIT 1;
    
    IF user1_id IS NOT NULL AND user2_id IS NOT NULL THEN
        -- Create sample notifications for user1
        INSERT INTO public.notifications (
            user_id, type, priority, title, message, action_url, 
            actor_id, actor_name, is_read
        ) VALUES
            (
                user1_id, 
                'comment'::public.notification_type, 
                'normal'::public.notification_priority,
                'New Comment',
                'John Doe commented on your snippet "Authentication Helper Functions"',
                '/snippet-details/123',
                user2_id,
                'John Doe',
                false
            ),
            (
                user1_id,
                'like'::public.notification_type,
                'low'::public.notification_priority,
                'Snippet Liked',
                'Sarah Smith liked your snippet',
                '/snippet-details/124',
                user2_id,
                'Sarah Smith',
                false
            ),
            (
                user1_id,
                'follow'::public.notification_type,
                'normal'::public.notification_priority,
                'New Follower',
                'Mike Johnson started following you',
                '/user-profile/mike-johnson',
                user2_id,
                'Mike Johnson',
                false
            ),
            (
                user1_id,
                'mention'::public.notification_type,
                'high'::public.notification_priority,
                'You were mentioned',
                'Emily Davis mentioned you in a comment',
                '/snippet-details/125',
                user2_id,
                'Emily Davis',
                false
            ),
            (
                user1_id,
                'bug_assignment'::public.notification_type,
                'urgent'::public.notification_priority,
                'Bug Assigned',
                'A critical bug has been assigned to you: "Login authentication fails"',
                '/bug-board/bug-456',
                user2_id,
                'Team Lead',
                false
            ),
            (
                user1_id,
                'team_update'::public.notification_type,
                'normal'::public.notification_priority,
                'Team Update',
                'Your team "Backend Development" has a new announcement',
                '/team-chat/backend',
                user2_id,
                'Project Manager',
                true
            );
            
        RAISE NOTICE 'Created 6 sample notifications for user1';
    ELSE
        RAISE NOTICE 'Not enough users found to create notifications';
    END IF;
END $$;