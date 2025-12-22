-- Location: supabase/migrations/20251124204917_add_friend_request_notifications.sql
-- Schema Analysis: Existing friend_requests and notifications tables found
-- Integration Type: Extension - Adding friend_request notification support
-- Dependencies: friend_requests, notifications, user_profiles tables

-- 1. Add 'friend_request' to notification_type enum
ALTER TYPE public.notification_type ADD VALUE IF NOT EXISTS 'friend_request';

-- 2. Create trigger function to automatically create notification on friend request
CREATE OR REPLACE FUNCTION public.notify_friend_request()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
    sender_profile RECORD;
BEGIN
    -- Only create notification for new pending requests
    IF NEW.status = 'pending' THEN
        -- Get sender profile information
        SELECT full_name, username, avatar_url
        INTO sender_profile
        FROM public.user_profiles
        WHERE id = NEW.sender_id;

        -- Create notification for the receiver
        INSERT INTO public.notifications (
            user_id,
            actor_id,
            notification_type,
            title,
            message,
            priority,
            source_id,
            source_type,
            actor_name,
            actor_avatar_url
        ) VALUES (
            NEW.receiver_id,
            NEW.sender_id,
            'friend_request'::public.notification_type,
            'New Friend Request',
            CONCAT(COALESCE(sender_profile.full_name, sender_profile.username, 'Someone'), ' sent you a friend request'),
            'medium'::public.notification_priority,
            NEW.id,
            'friend_request',
            COALESCE(sender_profile.full_name, sender_profile.username, 'Unknown'),
            sender_profile.avatar_url
        );
    END IF;

    RETURN NEW;
END;
$$;

-- 3. Create trigger on friend_requests table
DROP TRIGGER IF EXISTS trigger_notify_friend_request ON public.friend_requests;
CREATE TRIGGER trigger_notify_friend_request
    AFTER INSERT ON public.friend_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_friend_request();

-- 4. Create index for faster notification queries
CREATE INDEX IF NOT EXISTS idx_notifications_unread 
ON public.notifications(user_id, is_read, created_at DESC) 
WHERE is_read = false;