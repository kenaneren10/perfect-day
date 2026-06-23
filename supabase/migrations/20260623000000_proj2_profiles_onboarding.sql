-- ============================================================
-- PROJ-2: User Onboarding & Profil — Database Migration
-- Run in Supabase SQL Editor (Dev first, then Prod)
-- ============================================================

-- ── 1. Enum Types ─────────────────────────────────────────

CREATE TYPE user_goal AS ENUM (
  'weight_loss',
  'muscle_gain',
  'fitness',
  'flexibility'
);

CREATE TYPE fitness_level AS ENUM (
  'beginner',
  'intermediate',
  'advanced'
);

-- Note: user_equipment reuses the same values as exercise_equipment
-- from PROJ-3 but is a separate type scoped to profiles.
CREATE TYPE user_equipment AS ENUM (
  'none',
  'basic',
  'full'
);

-- ── 2. Extend profiles table ───────────────────────────────

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS goal              user_goal,
  ADD COLUMN IF NOT EXISTS fitness_level     fitness_level,
  ADD COLUMN IF NOT EXISTS equipment         user_equipment,
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE;

-- ── 3. Index for onboarding guard (middleware reads this via JWT,
--       but admin queries and analytics may filter on it) ──

CREATE INDEX IF NOT EXISTS idx_profiles_onboarding
  ON public.profiles(onboarding_completed)
  WHERE onboarding_completed = FALSE;

-- ── 4. RLS note ────────────────────────────────────────────
-- No new RLS policies needed: the existing PROJ-1 policies
-- (users can SELECT/UPDATE their own profile row) already cover
-- all new columns added here.
