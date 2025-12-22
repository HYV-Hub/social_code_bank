-- Location: supabase/migrations/20251119214800_auth_module_complete.sql
-- Schema Analysis: Creating complete authentication module
-- Integration Type: Fresh Start - Auth foundation with user profiles
-- Dependencies: None - this is the base schema

-- ============================================================================
-- 1. CREATE ENUMS
-- ============================================================================

-- User role enum
CREATE TYPE public.user_role AS ENUM (
    'user',
    'team_member',
    'team_admin',
    'company_admin',
    'super_admin'
);

-- Contributor level enum
CREATE TYPE public.contributor_level AS ENUM (
    'beginner',
    'intermediate',
    'advanced',
    'expert',
    'master'
);

-- ============================================================================
-- 2. CREATE USER PROFILES TABLE
-- ============================================================================

CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    username TEXT UNIQUE,
    avatar_url TEXT,
    bio TEXT,
    role public.user_role DEFAULT 'user'::public.user_role,
    contributor_level public.contributor_level DEFAULT 'beginner'::public.contributor_level,
    company_id UUID,
    team_id UUID,
    followers_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    snippets_count INTEGER DEFAULT 0,
    bugs_reported_count INTEGER DEFAULT 0,
    bugs_fixed_count INTEGER DEFAULT 0,
    points INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMPTZ
);

-- ============================================================================
-- 3. CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX idx_user_profiles_username ON public.user_profiles(username);
CREATE INDEX idx_user_profiles_company_id ON public.user_profiles(company_id);
CREATE INDEX idx_user_profiles_team_id ON public.user_profiles(team_id);
CREATE INDEX idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX idx_user_profiles_created_at ON public.user_profiles(created_at DESC);

-- ============================================================================
-- 4. ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 5. CREATE RLS POLICIES
-- ============================================================================

-- Policy: Users can view all profiles (public visibility)
CREATE POLICY "users_view_all_profiles"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (true);

-- Policy: Users can update their own profile
CREATE POLICY "users_update_own_profile"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Policy: Users can delete their own profile
CREATE POLICY "users_delete_own_profile"
ON public.user_profiles
FOR DELETE
TO authenticated
USING (id = auth.uid());

-- ============================================================================
-- 6. CREATE TRIGGER FUNCTION FOR AUTO PROFILE CREATION
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
    );
    RETURN NEW;
END;
$$;

-- ============================================================================
-- 7. CREATE TRIGGER ON AUTH.USERS
-- ============================================================================

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 8. CREATE UPDATE TIMESTAMP FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- ============================================================================
-- 9. CREATE TRIGGER FOR UPDATED_AT
-- ============================================================================

CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- 10. INSERT MOCK USERS FOR TESTING
-- ============================================================================

DO $$
DECLARE
    user1_id UUID;
    user2_id UUID;
    user3_id UUID;
BEGIN
    -- Create test user 1
    INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        role,
        aud
    ) VALUES (
        gen_random_uuid(),
        '00000000-0000-0000-0000-000000000000',
        'john.doe@splice1.com',
        crypt('password123', gen_salt('bf')),
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP,
        '{"provider":"email","providers":["email"]}',
        '{"full_name":"John Doe"}',
        false,
        'authenticated',
        'authenticated'
    )
    RETURNING id INTO user1_id;
    
    -- Update user1 profile
    UPDATE public.user_profiles
    SET 
        username = 'johndoe',
        bio = 'Senior Full-Stack Developer | Open Source Contributor',
        contributor_level = 'expert'::public.contributor_level,
        role = 'team_admin'::public.user_role,
        snippets_count = 45,
        bugs_reported_count = 12,
        bugs_fixed_count = 28,
        followers_count = 234,
        following_count = 89,
        points = 2850,
        email_verified = true
    WHERE id = user1_id;

    -- Create test user 2
    INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        role,
        aud
    ) VALUES (
        gen_random_uuid(),
        '00000000-0000-0000-0000-000000000000',
        'sarah.smith@splice1.com',
        crypt('password123', gen_salt('bf')),
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP,
        '{"provider":"email","providers":["email"]}',
        '{"full_name":"Sarah Smith"}',
        false,
        'authenticated',
        'authenticated'
    )
    RETURNING id INTO user2_id;
    
    -- Update user2 profile
    UPDATE public.user_profiles
    SET 
        username = 'sarahsmith',
        bio = 'Frontend Developer | React Enthusiast',
        contributor_level = 'advanced'::public.contributor_level,
        role = 'team_member'::public.user_role,
        snippets_count = 23,
        bugs_reported_count = 8,
        bugs_fixed_count = 15,
        followers_count = 156,
        following_count = 67,
        points = 1450,
        email_verified = true
    WHERE id = user2_id;

    -- Create test user 3
    INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        role,
        aud
    ) VALUES (
        gen_random_uuid(),
        '00000000-0000-0000-0000-000000000000',
        'mike.johnson@splice1.com',
        crypt('password123', gen_salt('bf')),
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP,
        '{"provider":"email","providers":["email"]}',
        '{"full_name":"Mike Johnson"}',
        false,
        'authenticated',
        'authenticated'
    )
    RETURNING id INTO user3_id;
    
    -- Update user3 profile
    UPDATE public.user_profiles
    SET 
        username = 'mikejohnson',
        bio = 'Backend Engineer | Python & Node.js',
        contributor_level = 'intermediate'::public.contributor_level,
        role = 'user'::public.user_role,
        snippets_count = 12,
        bugs_reported_count = 5,
        bugs_fixed_count = 7,
        followers_count = 89,
        following_count = 45,
        points = 780,
        email_verified = true
    WHERE id = user3_id;

    RAISE NOTICE 'Created 3 test users with credentials - Email: john.doe@splice1.com / sarah.smith@splice1.com / mike.johnson@splice1.com, Password: password123';
END $$;