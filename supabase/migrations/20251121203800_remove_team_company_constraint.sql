-- Migration: Remove problematic team-company check constraint
-- Timestamp: 20251121203800
-- Purpose: Fix company creation error by removing restrictive constraint

-- ============================================================================
-- DROP CHECK CONSTRAINT
-- ============================================================================

-- Remove the check_team_company_match constraint that's causing company creation failures
-- This constraint is too restrictive as it prevents users from creating companies
-- when they have existing team associations
ALTER TABLE public.user_profiles 
DROP CONSTRAINT IF EXISTS check_team_company_match;

-- ============================================================================
-- ADD COMMENT
-- ============================================================================

COMMENT ON TABLE public.user_profiles IS 'User profiles table - constraint check_team_company_match removed to allow flexible company creation';