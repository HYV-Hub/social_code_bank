-- Location: supabase/migrations/20251125130000_extend_language_enum.sql
-- Schema Analysis: Extending existing language enum with common web and markup languages
-- Integration Type: Enhancement of existing enum type
-- Dependencies: public.language enum

-- Add missing web languages to the language enum
-- Current values: ['javascript', 'typescript', 'python', 'java', 'cpp', 'csharp', 'ruby', 'go', 'rust', 'php', 'sql', 'other']
-- Adding: html, css, jsx, tsx, markdown, json, yaml, xml, bash, shell, swift, kotlin, dart, vue, svelte

ALTER TYPE public.language ADD VALUE IF NOT EXISTS 'html';
ALTER TYPE public.language ADD VALUE IF NOT EXISTS 'css';
ALTER TYPE public.language ADD VALUE IF NOT EXISTS 'jsx';
ALTER TYPE public.language ADD VALUE IF NOT EXISTS 'tsx';
ALTER TYPE public.language ADD VALUE IF NOT EXISTS 'markdown';
ALTER TYPE public.language ADD VALUE IF NOT EXISTS 'json';
ALTER TYPE public.language ADD VALUE IF NOT EXISTS 'yaml';
ALTER TYPE public.language ADD VALUE IF NOT EXISTS 'xml';
ALTER TYPE public.language ADD VALUE IF NOT EXISTS 'bash';
ALTER TYPE public.language ADD VALUE IF NOT EXISTS 'shell';
ALTER TYPE public.language ADD VALUE IF NOT EXISTS 'swift';
ALTER TYPE public.language ADD VALUE IF NOT EXISTS 'kotlin';
ALTER TYPE public.language ADD VALUE IF NOT EXISTS 'dart';
ALTER TYPE public.language ADD VALUE IF NOT EXISTS 'vue';
ALTER TYPE public.language ADD VALUE IF NOT EXISTS 'svelte';