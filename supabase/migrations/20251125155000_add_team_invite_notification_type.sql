-- Location: supabase/migrations/20251125155000_add_team_invite_notification_type.sql
-- Schema Analysis: Extending existing notification_type enum
-- Integration Type: Modification (adding new enum value)
-- Dependencies: notifications table, notification_type enum

-- Add 'team_invite' to the notification_type enum
ALTER TYPE public.notification_type ADD VALUE IF NOT EXISTS 'team_invite';

-- Note: This migration adds 'team_invite' as a new notification type
-- to fix the error when creating team invite notifications