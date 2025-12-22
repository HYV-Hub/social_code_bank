-- Location: supabase/migrations/20251120152535_session_management_module.sql
-- Schema Analysis: Existing auth system with user_profiles, notifications
-- Integration Type: Extension - Adding session tracking and security monitoring
-- Dependencies: user_profiles table

-- ====================
-- 1. TYPES & ENUMS
-- ====================

CREATE TYPE public.session_status AS ENUM ('active', 'expired', 'revoked');
CREATE TYPE public.login_attempt_status AS ENUM ('success', 'failed', 'blocked');

-- ====================
-- 2. SESSION TRACKING TABLE
-- ====================

CREATE TABLE public.user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    session_token TEXT NOT NULL,
    device_name TEXT,
    device_type TEXT, -- 'desktop', 'mobile', 'tablet'
    browser_name TEXT,
    browser_version TEXT,
    os_name TEXT,
    os_version TEXT,
    ip_address INET,
    location_country TEXT,
    location_city TEXT,
    location_latitude NUMERIC(10, 7),
    location_longitude NUMERIC(10, 7),
    is_trusted_device BOOLEAN DEFAULT false,
    last_activity_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMPTZ NOT NULL,
    status public.session_status DEFAULT 'active'::public.session_status,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    revoked_at TIMESTAMPTZ,
    revoked_reason TEXT
);

-- ====================
-- 3. LOGIN ATTEMPTS TABLE
-- ====================

CREATE TABLE public.login_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    ip_address INET,
    device_name TEXT,
    browser_name TEXT,
    os_name TEXT,
    location_country TEXT,
    location_city TEXT,
    attempt_status public.login_attempt_status NOT NULL,
    failure_reason TEXT,
    is_suspicious BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ====================
-- 4. SESSION PREFERENCES TABLE
-- ====================

CREATE TABLE public.session_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    remember_device BOOLEAN DEFAULT false,
    auto_logout_minutes INTEGER DEFAULT 120, -- 2 hours default
    require_mfa_for_new_device BOOLEAN DEFAULT false,
    email_notification_new_login BOOLEAN DEFAULT true,
    email_notification_suspicious_activity BOOLEAN DEFAULT true,
    trusted_locations JSONB DEFAULT '[]'::jsonb, -- Array of {country, city, ip_range}
    blocked_ips JSONB DEFAULT '[]'::jsonb, -- Array of IP addresses
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ====================
-- 5. INDEXES
-- ====================

CREATE INDEX idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX idx_user_sessions_session_token ON public.user_sessions(session_token);
CREATE INDEX idx_user_sessions_status ON public.user_sessions(status);
CREATE INDEX idx_user_sessions_expires_at ON public.user_sessions(expires_at);
CREATE INDEX idx_user_sessions_last_activity ON public.user_sessions(last_activity_at);

CREATE INDEX idx_login_attempts_user_id ON public.login_attempts(user_id);
CREATE INDEX idx_login_attempts_email ON public.login_attempts(email);
CREATE INDEX idx_login_attempts_ip_address ON public.login_attempts(ip_address);
CREATE INDEX idx_login_attempts_created_at ON public.login_attempts(created_at);
CREATE INDEX idx_login_attempts_is_suspicious ON public.login_attempts(is_suspicious);

CREATE INDEX idx_session_preferences_user_id ON public.session_preferences(user_id);

-- ====================
-- 6. FUNCTIONS (BEFORE RLS POLICIES)
-- ====================

-- Function to cleanup expired sessions
CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.user_sessions
    SET status = 'expired'::public.session_status
    WHERE status = 'active'::public.session_status
    AND expires_at < CURRENT_TIMESTAMP;
END;
$$;

-- Function to detect suspicious login activity
CREATE OR REPLACE FUNCTION public.detect_suspicious_login(
    p_user_id UUID,
    p_ip_address INET,
    p_location_country TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    failed_attempts_count INTEGER;
    is_new_location BOOLEAN;
BEGIN
    -- Check for multiple failed login attempts
    SELECT COUNT(*) INTO failed_attempts_count
    FROM public.login_attempts la
    WHERE la.user_id = p_user_id
    AND la.attempt_status = 'failed'::public.login_attempt_status
    AND la.created_at > CURRENT_TIMESTAMP - INTERVAL '15 minutes';
    
    -- Check if login from new location
    SELECT NOT EXISTS (
        SELECT 1 FROM public.login_attempts la
        WHERE la.user_id = p_user_id
        AND la.location_country = p_location_country
        AND la.attempt_status = 'success'::public.login_attempt_status
        LIMIT 1
    ) INTO is_new_location;
    
    -- Return true if suspicious
    RETURN (failed_attempts_count >= 3 OR is_new_location);
END;
$$;

-- ====================
-- 7. RLS POLICIES
-- ====================

ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_preferences ENABLE ROW LEVEL SECURITY;

-- User sessions policies (Pattern 2: Simple User Ownership)
CREATE POLICY "users_manage_own_sessions"
ON public.user_sessions
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Login attempts policies (Pattern 2: Simple User Ownership)
CREATE POLICY "users_view_own_login_attempts"
ON public.login_attempts
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Allow insert for logging attempts (system can log for anyone)
CREATE POLICY "system_can_log_attempts"
ON public.login_attempts
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Session preferences policies (Pattern 1: Core User Table)
CREATE POLICY "users_manage_own_preferences"
ON public.session_preferences
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ====================
-- 8. TRIGGERS
-- ====================

-- Auto-update updated_at for session_preferences
CREATE TRIGGER update_session_preferences_updated_at
    BEFORE UPDATE ON public.session_preferences
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ====================
-- 9. MOCK DATA
-- ====================

DO $$
DECLARE
    existing_user_id UUID;
    session_id UUID;
BEGIN
    -- Get existing user from user_profiles
    SELECT id INTO existing_user_id FROM public.user_profiles LIMIT 1;
    
    IF existing_user_id IS NOT NULL THEN
        -- Create session preferences for existing user
        INSERT INTO public.session_preferences (
            user_id,
            remember_device,
            auto_logout_minutes,
            require_mfa_for_new_device,
            email_notification_new_login,
            email_notification_suspicious_activity
        ) VALUES (
            existing_user_id,
            true,
            120,
            false,
            true,
            true
        ) ON CONFLICT (user_id) DO NOTHING;
        
        -- Create active sessions for existing user
        INSERT INTO public.user_sessions (
            user_id,
            session_token,
            device_name,
            device_type,
            browser_name,
            browser_version,
            os_name,
            os_version,
            ip_address,
            location_country,
            location_city,
            is_trusted_device,
            expires_at,
            status
        ) VALUES
            (
                existing_user_id,
                'session_' || gen_random_uuid()::text,
                'MacBook Pro',
                'desktop',
                'Chrome',
                '120.0.0',
                'macOS',
                '14.2',
                '192.168.1.100',
                'United States',
                'San Francisco',
                true,
                CURRENT_TIMESTAMP + INTERVAL '7 days',
                'active'::public.session_status
            ),
            (
                existing_user_id,
                'session_' || gen_random_uuid()::text,
                'iPhone 14 Pro',
                'mobile',
                'Safari',
                '17.2',
                'iOS',
                '17.2',
                '192.168.1.101',
                'United States',
                'San Francisco',
                true,
                CURRENT_TIMESTAMP + INTERVAL '30 days',
                'active'::public.session_status
            );
        
        -- Create login attempts history
        INSERT INTO public.login_attempts (
            user_id,
            email,
            ip_address,
            device_name,
            browser_name,
            os_name,
            location_country,
            location_city,
            attempt_status,
            is_suspicious,
            created_at
        ) VALUES
            (
                existing_user_id,
                (SELECT email FROM public.user_profiles WHERE id = existing_user_id),
                '192.168.1.100',
                'MacBook Pro',
                'Chrome',
                'macOS',
                'United States',
                'San Francisco',
                'success'::public.login_attempt_status,
                false,
                CURRENT_TIMESTAMP - INTERVAL '2 days'
            ),
            (
                existing_user_id,
                (SELECT email FROM public.user_profiles WHERE id = existing_user_id),
                '192.168.1.101',
                'iPhone 14 Pro',
                'Safari',
                'iOS',
                'United States',
                'San Francisco',
                'success'::public.login_attempt_status,
                false,
                CURRENT_TIMESTAMP - INTERVAL '1 day'
            );
    END IF;
END $$;