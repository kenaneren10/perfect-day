-- ============================================================
-- PROJ-7: Mobility Routine — Database Migration
-- Run in Supabase SQL Editor (Dev first, then Prod)
-- ============================================================

-- ── 1. mobility_completions table ─────────────────────────
-- One row per user per day when they finished the mobility routine.
-- UNIQUE constraint on (user_id, completed_on) makes all inserts
-- idempotent via ON CONFLICT DO NOTHING — no app-level dedup needed.

CREATE TABLE IF NOT EXISTS public.mobility_completions (
  id             UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID  NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  completed_on   DATE  NOT NULL,

  CONSTRAINT uq_mobility_user_day UNIQUE (user_id, completed_on)
);

-- ── 2. Row Level Security ──────────────────────────────────

ALTER TABLE public.mobility_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own mobility completions"
  ON public.mobility_completions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own mobility completions"
  ON public.mobility_completions FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- No UPDATE or DELETE policy: completions are append-only in MVP.

-- ── 3. Index ───────────────────────────────────────────────
-- Primary query: "did this user complete today?"
-- Covered by the UNIQUE constraint index (user_id, completed_on).
-- Additional covering index for dashboard query (head: true count).

CREATE INDEX IF NOT EXISTS idx_mobility_completions_user_date
  ON public.mobility_completions(user_id, completed_on DESC);
