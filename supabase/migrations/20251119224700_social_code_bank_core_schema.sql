-- Location: supabase/migrations/20251119224700_social_code_bank_core_schema.sql
-- Schema Analysis: Existing user_profiles table with contributor_level, user_role enums
-- Integration Type: Addition - Building complete social code platform schema
-- Dependencies: Existing user_profiles table

-- ============================================================================
-- 1. CUSTOM TYPES (ENUMs)
-- ============================================================================

CREATE TYPE public.visibility AS ENUM ('public', 'private', 'team', 'company');
CREATE TYPE public.snippet_type AS ENUM ('code', 'function', 'class', 'algorithm', 'config', 'query');
CREATE TYPE public.language AS ENUM ('javascript', 'typescript', 'python', 'java', 'cpp', 'csharp', 'ruby', 'go', 'rust', 'php', 'sql', 'other');
CREATE TYPE public.bug_status AS ENUM ('open', 'in_progress', 'resolved', 'closed', 'reopened');
CREATE TYPE public.bug_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE public.notification_type AS ENUM ('comment', 'like', 'follow', 'mention', 'bug_assignment', 'team_update');
CREATE TYPE public.notification_priority AS ENUM ('low', 'medium', 'high');

-- ============================================================================
-- 2. CORE TABLES (Companies & Teams)
-- ============================================================================

CREATE TABLE public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    logo_url TEXT,
    website TEXT,
    created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 3. CONTENT TABLES (Snippets, Code Files, Bugs)
-- ============================================================================

CREATE TABLE public.snippets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    code TEXT NOT NULL,
    language public.language NOT NULL,
    snippet_type public.snippet_type DEFAULT 'code'::public.snippet_type,
    visibility public.visibility DEFAULT 'public'::public.visibility,
    company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
    team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
    version INTEGER DEFAULT 1,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.code_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    snippet_id UUID REFERENCES public.snippets(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    uploaded_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.bugs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    code TEXT,
    language public.language,
    bug_status public.bug_status DEFAULT 'open'::public.bug_status,
    priority public.bug_priority DEFAULT 'medium'::public.bug_priority,
    assigned_to UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
    team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 4. ENGAGEMENT TABLES (Comments, Likes, Follows)
-- ============================================================================

CREATE TABLE public.snippet_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    snippet_id UUID NOT NULL REFERENCES public.snippets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_id UUID REFERENCES public.snippet_comments(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.bug_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bug_id UUID NOT NULL REFERENCES public.bugs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_id UUID REFERENCES public.bug_comments(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.snippet_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    snippet_id UUID NOT NULL REFERENCES public.snippets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(snippet_id, user_id)
);

CREATE TABLE public.bug_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bug_id UUID NOT NULL REFERENCES public.bugs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(bug_id, user_id)
);

CREATE TABLE public.follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(follower_id, following_id),
    CHECK (follower_id != following_id)
);

-- ============================================================================
-- 5. NOTIFICATION SYSTEM
-- ============================================================================

CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    notification_type public.notification_type NOT NULL,
    priority public.notification_priority DEFAULT 'medium'::public.notification_priority,
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

CREATE TABLE public.notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
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
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 6. INDEXES FOR PERFORMANCE
-- ============================================================================

-- Companies indexes
CREATE INDEX idx_companies_slug ON public.companies(slug);
CREATE INDEX idx_companies_created_by ON public.companies(created_by);

-- Teams indexes
CREATE INDEX idx_teams_company_id ON public.teams(company_id);
CREATE INDEX idx_teams_created_by ON public.teams(created_by);

-- Snippets indexes
CREATE INDEX idx_snippets_user_id ON public.snippets(user_id);
CREATE INDEX idx_snippets_company_id ON public.snippets(company_id);
CREATE INDEX idx_snippets_team_id ON public.snippets(team_id);
CREATE INDEX idx_snippets_visibility ON public.snippets(visibility);
CREATE INDEX idx_snippets_language ON public.snippets(language);
CREATE INDEX idx_snippets_created_at ON public.snippets(created_at DESC);

-- Code files indexes
CREATE INDEX idx_code_files_snippet_id ON public.code_files(snippet_id);
CREATE INDEX idx_code_files_uploaded_by ON public.code_files(uploaded_by);

-- Bugs indexes
CREATE INDEX idx_bugs_user_id ON public.bugs(user_id);
CREATE INDEX idx_bugs_assigned_to ON public.bugs(assigned_to);
CREATE INDEX idx_bugs_company_id ON public.bugs(company_id);
CREATE INDEX idx_bugs_team_id ON public.bugs(team_id);
CREATE INDEX idx_bugs_status ON public.bugs(bug_status);
CREATE INDEX idx_bugs_priority ON public.bugs(priority);
CREATE INDEX idx_bugs_created_at ON public.bugs(created_at DESC);

-- Comments indexes
CREATE INDEX idx_snippet_comments_snippet_id ON public.snippet_comments(snippet_id);
CREATE INDEX idx_snippet_comments_user_id ON public.snippet_comments(user_id);
CREATE INDEX idx_snippet_comments_parent_id ON public.snippet_comments(parent_id);
CREATE INDEX idx_bug_comments_bug_id ON public.bug_comments(bug_id);
CREATE INDEX idx_bug_comments_user_id ON public.bug_comments(user_id);
CREATE INDEX idx_bug_comments_parent_id ON public.bug_comments(parent_id);

-- Likes indexes
CREATE INDEX idx_snippet_likes_snippet_id ON public.snippet_likes(snippet_id);
CREATE INDEX idx_snippet_likes_user_id ON public.snippet_likes(user_id);
CREATE INDEX idx_bug_likes_bug_id ON public.bug_likes(bug_id);
CREATE INDEX idx_bug_likes_user_id ON public.bug_likes(user_id);

-- Follows indexes
CREATE INDEX idx_follows_follower_id ON public.follows(follower_id);
CREATE INDEX idx_follows_following_id ON public.follows(following_id);

-- Notifications indexes
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX idx_notifications_type ON public.notifications(notification_type);

-- Notification preferences indexes
CREATE INDEX idx_notification_preferences_user_id ON public.notification_preferences(user_id);

-- ============================================================================
-- 7. HELPER FUNCTIONS (MUST BE BEFORE RLS POLICIES)
-- ============================================================================

-- Function to check if user has admin or company_admin role
CREATE OR REPLACE FUNCTION public.is_admin_from_auth()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM auth.users au
    WHERE au.id = auth.uid() 
    AND (au.raw_user_meta_data->>'role' IN ('super_admin', 'company_admin')
         OR au.raw_app_meta_data->>'role' IN ('super_admin', 'company_admin'))
)
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
WHERE user_id = auth.uid() AND is_read = false
$$;

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

-- ============================================================================
-- 8. ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.snippets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.code_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bugs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.snippet_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bug_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.snippet_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bug_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 9. RLS POLICIES (Following 7-Pattern System)
-- ============================================================================

-- Pattern 4: Public Read, Private Write for Companies
CREATE POLICY "public_can_read_companies"
ON public.companies
FOR SELECT
TO public
USING (true);

CREATE POLICY "users_manage_own_companies"
ON public.companies
FOR ALL
TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- Pattern 4: Public Read, Private Write for Teams
CREATE POLICY "public_can_read_teams"
ON public.teams
FOR SELECT
TO public
USING (true);

CREATE POLICY "users_manage_own_teams"
ON public.teams
FOR ALL
TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- Pattern 4: Public Read for public snippets, Private Write
CREATE POLICY "public_can_read_public_snippets"
ON public.snippets
FOR SELECT
TO public
USING (visibility = 'public'::public.visibility);

CREATE POLICY "users_manage_own_snippets"
ON public.snippets
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Pattern 2: Simple User Ownership for Code Files
CREATE POLICY "users_manage_own_code_files"
ON public.code_files
FOR ALL
TO authenticated
USING (uploaded_by = auth.uid())
WITH CHECK (uploaded_by = auth.uid());

-- Pattern 4: Public Read for open bugs, Private Write
CREATE POLICY "public_can_read_open_bugs"
ON public.bugs
FOR SELECT
TO public
USING (bug_status = 'open'::public.bug_status);

CREATE POLICY "users_manage_own_bugs"
ON public.bugs
FOR ALL
TO authenticated
USING (user_id = auth.uid() OR assigned_to = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Pattern 2: Simple User Ownership for Comments
CREATE POLICY "users_manage_own_snippet_comments"
ON public.snippet_comments
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_manage_own_bug_comments"
ON public.bug_comments
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Pattern 2: Simple User Ownership for Likes
CREATE POLICY "users_manage_own_snippet_likes"
ON public.snippet_likes
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_manage_own_bug_likes"
ON public.bug_likes
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Pattern 2: Simple User Ownership for Follows
CREATE POLICY "users_manage_own_follows"
ON public.follows
FOR ALL
TO authenticated
USING (follower_id = auth.uid())
WITH CHECK (follower_id = auth.uid());

-- Pattern 2: Simple User Ownership for Notifications
CREATE POLICY "users_manage_own_notifications"
ON public.notifications
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Pattern 2: Simple User Ownership for Notification Preferences
CREATE POLICY "users_manage_own_notification_preferences"
ON public.notification_preferences
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- 10. TRIGGERS FOR UPDATED_AT
-- ============================================================================

CREATE TRIGGER update_companies_updated_at
    BEFORE UPDATE ON public.companies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at
    BEFORE UPDATE ON public.teams
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_snippets_updated_at
    BEFORE UPDATE ON public.snippets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bugs_updated_at
    BEFORE UPDATE ON public.bugs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_snippet_comments_updated_at
    BEFORE UPDATE ON public.snippet_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bug_comments_updated_at
    BEFORE UPDATE ON public.bug_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at
    BEFORE UPDATE ON public.notification_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 11. MOCK DATA (References existing user_profiles)
-- ============================================================================

DO $$
DECLARE
    user1_id UUID;
    user2_id UUID;
    company1_id UUID := gen_random_uuid();
    company2_id UUID := gen_random_uuid();
    team1_id UUID := gen_random_uuid();
    team2_id UUID := gen_random_uuid();
    snippet1_id UUID := gen_random_uuid();
    snippet2_id UUID := gen_random_uuid();
    bug1_id UUID := gen_random_uuid();
    bug2_id UUID := gen_random_uuid();
BEGIN
    -- Get existing user IDs from user_profiles
    SELECT id INTO user1_id FROM public.user_profiles LIMIT 1 OFFSET 0;
    SELECT id INTO user2_id FROM public.user_profiles LIMIT 1 OFFSET 1;

    -- If users exist, create mock data
    IF user1_id IS NOT NULL AND user2_id IS NOT NULL THEN
        
        -- Insert Companies
        INSERT INTO public.companies (id, name, slug, description, created_by)
        VALUES
            (company1_id, 'TechCorp Solutions', 'techcorp', 'Leading software development company', user1_id),
            (company2_id, 'CodeMasters Inc', 'codemasters', 'Expert coding consultancy', user2_id);

        -- Insert Teams
        INSERT INTO public.teams (id, company_id, name, description, created_by)
        VALUES
            (team1_id, company1_id, 'Backend Team', 'Server-side development specialists', user1_id),
            (team2_id, company1_id, 'Frontend Team', 'UI/UX implementation experts', user1_id);

        -- Insert Snippets
        INSERT INTO public.snippets (id, user_id, title, description, code, language, snippet_type, visibility, company_id, team_id)
        VALUES
            (snippet1_id, user1_id, 'React Hook for API Calls', 'Custom hook for handling API requests with loading and error states', 
             'export const useApi = (url) => {\n  const [data, setData] = useState(null);\n  const [loading, setLoading] = useState(true);\n  const [error, setError] = useState(null);\n  \n  useEffect(() => {\n    fetch(url)\n      .then(res => res.json())\n      .then(setData)\n      .catch(setError)\n      .finally(() => setLoading(false));\n  }, [url]);\n  \n  return { data, loading, error };\n};', 
             'javascript'::public.language, 'function'::public.snippet_type, 'public'::public.visibility, company1_id, team2_id),
            (snippet2_id, user2_id, 'Python Data Validation', 'Decorator for validating function inputs', 
             'def validate_types(**expected_types):\n    def decorator(func):\n        def wrapper(*args, **kwargs):\n            for name, expected_type in expected_types.items():\n                if name in kwargs:\n                    if not isinstance(kwargs[name], expected_type):\n                        raise TypeError(f"{name} must be {expected_type}")\n            return func(*args, **kwargs)\n        return wrapper\n    return decorator', 
             'python'::public.language, 'function'::public.snippet_type, 'public'::public.visibility, company2_id, NULL);

        -- Insert Bugs
        INSERT INTO public.bugs (id, user_id, title, description, code, language, bug_status, priority, assigned_to, company_id)
        VALUES
            (bug1_id, user1_id, 'Memory leak in React component', 'Component causes memory leak when unmounting', 
             'useEffect(() => {\n  setInterval(() => {\n    console.log("Running");\n  }, 1000);\n}, []);  // Missing cleanup!', 
             'javascript'::public.language, 'open'::public.bug_status, 'high'::public.bug_priority, user2_id, company1_id),
            (bug2_id, user2_id, 'SQL injection vulnerability', 'User input not properly sanitized in query', 
             'query = "SELECT * FROM users WHERE username = ''" + user_input + "''";  // Dangerous!', 
             'sql'::public.language, 'open'::public.bug_status, 'critical'::public.bug_priority, user1_id, company2_id);

        -- Insert Comments
        INSERT INTO public.snippet_comments (snippet_id, user_id, content)
        VALUES
            (snippet1_id, user2_id, 'Great hook! Have you considered adding abort controller for cleanup?'),
            (snippet2_id, user1_id, 'Nice implementation. Could also use pydantic for more robust validation.');

        INSERT INTO public.bug_comments (bug_id, user_id, content)
        VALUES
            (bug1_id, user2_id, 'The fix is to return a cleanup function from useEffect that calls clearInterval'),
            (bug2_id, user1_id, 'Should use parameterized queries or an ORM to prevent SQL injection');

        -- Insert Likes
        INSERT INTO public.snippet_likes (snippet_id, user_id)
        VALUES
            (snippet1_id, user2_id),
            (snippet2_id, user1_id);

        INSERT INTO public.bug_likes (bug_id, user_id)
        VALUES
            (bug1_id, user2_id),
            (bug2_id, user1_id);

        -- Insert Follows
        INSERT INTO public.follows (follower_id, following_id)
        VALUES
            (user1_id, user2_id),
            (user2_id, user1_id);

        -- Insert Notifications
        INSERT INTO public.notifications (user_id, notification_type, priority, title, message, actor_id, actor_name, source_id, source_type)
        VALUES
            (user1_id, 'comment'::public.notification_type, 'medium'::public.notification_priority, 
             'New comment on your snippet', 'Someone commented on your React Hook snippet', 
             user2_id, 'Sarah Smith', snippet1_id, 'snippet'),
            (user2_id, 'bug_assignment'::public.notification_type, 'high'::public.notification_priority, 
             'Bug assigned to you', 'Memory leak bug assigned for review', 
             user1_id, 'John Doe', bug1_id, 'bug');

        -- Insert Notification Preferences (default preferences for both users)
        INSERT INTO public.notification_preferences (user_id)
        VALUES
            (user1_id),
            (user2_id);

        -- Update counts in snippets
        UPDATE public.snippets SET likes_count = 1, comments_count = 1 WHERE id = snippet1_id;
        UPDATE public.snippets SET likes_count = 1, comments_count = 1 WHERE id = snippet2_id;

        -- Update counts in bugs
        UPDATE public.bugs SET likes_count = 1, comments_count = 1 WHERE id = bug1_id;
        UPDATE public.bugs SET likes_count = 1, comments_count = 1 WHERE id = bug2_id;

    ELSE
        RAISE NOTICE 'Not enough existing users found in user_profiles. Mock data creation skipped.';
    END IF;
END $$;