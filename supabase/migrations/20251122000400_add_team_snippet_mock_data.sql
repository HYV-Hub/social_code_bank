-- Location: supabase/migrations/20251122000400_add_team_snippet_mock_data.sql
-- Purpose: Add mock team snippets for testing and demonstration
-- Schema Analysis: Existing tables - teams, snippets, user_profiles, team_members
-- Integration Type: ADDITIVE - Adding mock data to existing schema
-- Dependencies: teams, user_profiles, snippets (already exist)

-- ⚠️ CRITICAL: This migration adds MOCK DATA ONLY - No schema changes
-- This provides sample team snippets for users to see in team dashboard

DO $$
DECLARE
    existing_team_id UUID;
    existing_user_id UUID;
    team_member_id UUID;
    snippet1_id UUID := gen_random_uuid();
    snippet2_id UUID := gen_random_uuid();
    snippet3_id UUID := gen_random_uuid();
    snippet4_id UUID := gen_random_uuid();
    snippet5_id UUID := gen_random_uuid();
BEGIN
    -- Get the first existing team (assuming user is on team-dashboard?team=<id>)
    SELECT id INTO existing_team_id 
    FROM public.teams 
    LIMIT 1;

    -- If no team found, skip mock data creation
    IF existing_team_id IS NULL THEN
        RAISE NOTICE 'No teams found in database. Please create a team first.';
        RETURN;
    END IF;

    -- Get the team creator as the snippet author
    SELECT created_by INTO existing_user_id 
    FROM public.teams 
    WHERE id = existing_team_id;

    -- If creator not found, try to get any team member
    IF existing_user_id IS NULL THEN
        SELECT user_id INTO existing_user_id
        FROM public.team_members
        WHERE team_id = existing_team_id
        LIMIT 1;
    END IF;

    -- If still no user, get any user from user_profiles
    IF existing_user_id IS NULL THEN
        SELECT id INTO existing_user_id
        FROM public.user_profiles
        LIMIT 1;
    END IF;

    -- Final check - if no users exist at all, skip
    IF existing_user_id IS NULL THEN
        RAISE NOTICE 'No users found in database. Please create users first.';
        RETURN;
    END IF;

    -- Get a second team member if available (for variety)
    SELECT user_id INTO team_member_id
    FROM public.team_members
    WHERE team_id = existing_team_id 
    AND user_id != existing_user_id
    LIMIT 1;

    -- If no second member, use same user
    IF team_member_id IS NULL THEN
        team_member_id := existing_user_id;
    END IF;

    RAISE NOTICE 'Creating mock snippets for team: %, creator: %, member: %', 
        existing_team_id, existing_user_id, team_member_id;

    -- Insert team snippets with diverse content
    INSERT INTO public.snippets (
        id, title, description, code, language, snippet_type, 
        visibility, team_id, user_id, likes_count, views_count, 
        comments_count, version, ai_tags, ai_quality_score, created_at
    ) VALUES
    -- Snippet 1: React Authentication Hook
    (
        snippet1_id,
        'React Authentication Hook',
        'Custom React hook for handling user authentication with Supabase',
        'import { useState, useEffect } from ''react'';
import { supabase } from ''../lib/supabase'';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return { user, loading, signIn, signOut };
}',
        'javascript'::public.language,
        'function'::public.snippet_type,
        'team'::public.visibility,
        existing_team_id,
        existing_user_id,
        12, -- likes
        156, -- views
        3, -- comments
        1, -- version
        ARRAY['react', 'hooks', 'authentication', 'supabase']::TEXT[],
        85, -- quality score
        NOW() - INTERVAL '5 days'
    ),
    -- Snippet 2: PostgreSQL RLS Policy Pattern
    (
        snippet2_id,
        'Secure RLS Policy Pattern',
        'PostgreSQL Row Level Security policy for team-based access control',
        'CREATE POLICY "team_members_access_snippets"
ON public.snippets
FOR SELECT
TO authenticated
USING (
    team_id IN (
        SELECT team_id 
        FROM public.team_members 
        WHERE user_id = auth.uid()
    )
    OR user_id = auth.uid()
    OR visibility = ''public''::public.visibility
);

CREATE POLICY "team_members_insert_snippets"
ON public.snippets
FOR INSERT
TO authenticated
WITH CHECK (
    team_id IN (
        SELECT team_id 
        FROM public.team_members 
        WHERE user_id = auth.uid()
    )
    AND user_id = auth.uid()
);

-- Enable RLS
ALTER TABLE public.snippets ENABLE ROW LEVEL SECURITY;',
        'sql'::public.language,
        'query'::public.snippet_type,
        'team'::public.visibility,
        existing_team_id,
        team_member_id,
        8, -- likes
        98, -- views
        2, -- comments
        1, -- version
        ARRAY['postgresql', 'security', 'rls', 'database']::TEXT[],
        90, -- quality score
        NOW() - INTERVAL '3 days'
    ),
    -- Snippet 3: API Error Handler
    (
        snippet3_id,
        'Centralized API Error Handler',
        'TypeScript error handling utility for consistent API error responses',
        'interface ApiError {
  message: string;
  code: string;
  details?: unknown;
  statusCode: number;
}

class ErrorHandler {
  static handle(error: unknown): ApiError {
    // Supabase error
    if (error && typeof error === ''object'' && ''code'' in error) {
      const supabaseError = error as { code: string; message: string; details?: unknown };
      return {
        message: supabaseError.message || ''Database operation failed'',
        code: supabaseError.code,
        details: supabaseError.details,
        statusCode: this.getStatusCode(supabaseError.code)
      };
    }

    // Network error
    if (error instanceof TypeError && error.message.includes(''fetch'')) {
      return {
        message: ''Network connection failed. Please check your internet connection.'',
        code: ''NETWORK_ERROR'',
        statusCode: 503
      };
    }

    // Generic error
    return {
      message: error instanceof Error ? error.message : ''An unexpected error occurred'',
      code: ''UNKNOWN_ERROR'',
      statusCode: 500
    };
  }

  private static getStatusCode(code: string): number {
    const codeMap: Record<string, number> = {
      ''23505'': 409, // Unique violation
      ''23503'': 400, // Foreign key violation
      ''42501'': 403, // Insufficient privilege
      ''PGRST116'': 404 // Not found
    };
    return codeMap[code] || 500;
  }
}

export default ErrorHandler;',
        'typescript'::public.language,
        'class'::public.snippet_type,
        'team'::public.visibility,
        existing_team_id,
        existing_user_id,
        15, -- likes
        203, -- views
        5, -- comments
        2, -- version
        ARRAY['typescript', 'error-handling', 'api', 'utilities']::TEXT[],
        88, -- quality score
        NOW() - INTERVAL '7 days'
    ),
    -- Snippet 4: Responsive Navigation Component
    (
        snippet4_id,
        'Responsive Mobile Navigation',
        'React component for mobile-first responsive navigation with hamburger menu',
        'import React, { useState } from ''react'';
import { Menu, X } from ''lucide-react'';

export default function MobileNav({ items }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <span className="text-xl font-bold">Logo</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {items.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-gray-700 hover:text-blue-600 px-3 py-2"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-blue-600"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-3">
            {items.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="block px-3 py-2 text-gray-700 hover:bg-gray-100"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}',
        'javascript'::public.language,
        'function'::public.snippet_type,
        'team'::public.visibility,
        existing_team_id,
        team_member_id,
        20, -- likes
        287, -- views
        7, -- comments
        1, -- version
        ARRAY['react', 'navigation', 'responsive', 'ui', 'tailwind']::TEXT[],
        82, -- quality score
        NOW() - INTERVAL '1 day'
    ),
    -- Snippet 5: Data Validation Schema
    (
        snippet5_id,
        'Zod Schema Validation',
        'TypeScript data validation using Zod for form inputs and API payloads',
        'import { z } from ''zod'';

// User registration schema
export const userRegistrationSchema = z.object({
  email: z.string().email(''Invalid email address''),
  password: z.string()
    .min(8, ''Password must be at least 8 characters'')
    .regex(/[A-Z]/, ''Password must contain at least one uppercase letter'')
    .regex(/[a-z]/, ''Password must contain at least one lowercase letter'')
    .regex(/[0-9]/, ''Password must contain at least one number''),
  fullName: z.string()
    .min(2, ''Name must be at least 2 characters'')
    .max(100, ''Name must be less than 100 characters''),
  age: z.number()
    .int()
    .min(13, ''You must be at least 13 years old'')
    .max(120, ''Invalid age'')
});

// Snippet creation schema
export const snippetSchema = z.object({
  title: z.string()
    .min(3, ''Title must be at least 3 characters'')
    .max(200, ''Title must be less than 200 characters''),
  description: z.string()
    .max(500, ''Description must be less than 500 characters'')
    .optional(),
  code: z.string()
    .min(1, ''Code cannot be empty''),
  language: z.enum([
    ''javascript'', ''typescript'', ''python'', ''java'', 
    ''cpp'', ''csharp'', ''ruby'', ''go'', ''rust''
  ]),
  visibility: z.enum([''public'', ''private'', ''team'', ''company''])
});

// Type inference
export type UserRegistration = z.infer<typeof userRegistrationSchema>;
export type SnippetInput = z.infer<typeof snippetSchema>;',
        'typescript'::public.language,
        'code'::public.snippet_type,
        'team'::public.visibility,
        existing_team_id,
        existing_user_id,
        10, -- likes
        142, -- views
        4, -- comments
        1, -- version
        ARRAY['typescript', 'validation', 'zod', 'forms']::TEXT[],
        86, -- quality score
        NOW() - INTERVAL '2 days'
    );

    RAISE NOTICE 'Successfully created % mock team snippets for team %', 5, existing_team_id;

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Failed to create mock snippets: %', SQLERRM;
        -- Don''t throw - allow migration to complete even if mock data fails
END $$;