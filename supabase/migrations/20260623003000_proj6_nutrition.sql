-- ============================================================
-- PROJ-6: Kalorienrechner & Food-Tracking — Database Migration
-- Run in Supabase SQL Editor (Dev first, then Prod)
-- ============================================================

-- ── 1. Extend profiles table ───────────────────────────────
-- Adds body metrics + calorie goal columns needed for TDEE calculation.
-- All nullable so existing users aren't broken.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS height_cm       INTEGER
                                           CONSTRAINT ck_profiles_height CHECK (height_cm IS NULL OR (height_cm >= 100 AND height_cm <= 250)),
  ADD COLUMN IF NOT EXISTS weight_kg       NUMERIC(5,1)
                                           CONSTRAINT ck_profiles_weight CHECK (weight_kg IS NULL OR (weight_kg >= 30 AND weight_kg <= 300)),
  ADD COLUMN IF NOT EXISTS birth_year      INTEGER
                                           CONSTRAINT ck_profiles_birth_year CHECK (birth_year IS NULL OR (birth_year >= 1900 AND birth_year <= 2100)),
  ADD COLUMN IF NOT EXISTS biological_sex  TEXT
                                           CONSTRAINT ck_profiles_sex CHECK (biological_sex IS NULL OR biological_sex IN ('male', 'female')),
  ADD COLUMN IF NOT EXISTS activity_level  TEXT
                                           CONSTRAINT ck_profiles_activity CHECK (activity_level IS NULL OR activity_level IN (
                                             'sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active'
                                           )),
  ADD COLUMN IF NOT EXISTS calorie_goal    INTEGER
                                           CONSTRAINT ck_profiles_calorie_goal CHECK (calorie_goal IS NULL OR (calorie_goal >= 800 AND calorie_goal <= 9999));

-- ── 2. food_diary_entries table ────────────────────────────

CREATE TABLE IF NOT EXISTS public.food_diary_entries (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date          DATE        NOT NULL,
  meal_type     TEXT        NOT NULL
                            CONSTRAINT ck_fde_meal_type
                              CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snacks')),
  food_name     TEXT        NOT NULL CHECK (char_length(food_name) >= 1 AND char_length(food_name) <= 200),
  food_off_id   TEXT,
  serving_g     NUMERIC(7,1) NOT NULL CHECK (serving_g > 0 AND serving_g <= 9999),
  kcal          NUMERIC(8,1) NOT NULL CHECK (kcal >= 0),
  protein_g     NUMERIC(7,1) NOT NULL DEFAULT 0 CHECK (protein_g >= 0),
  carbs_g       NUMERIC(7,1) NOT NULL DEFAULT 0 CHECK (carbs_g >= 0),
  fat_g         NUMERIC(7,1) NOT NULL DEFAULT 0 CHECK (fat_g >= 0),
  logged_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 3. Row Level Security ──────────────────────────────────

ALTER TABLE public.food_diary_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own diary entries"
  ON public.food_diary_entries FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own diary entries"
  ON public.food_diary_entries FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own diary entries"
  ON public.food_diary_entries FOR DELETE
  USING (user_id = auth.uid());

-- ── 4. Indexes ────────────────────────────────────────────

-- Primary query: load today's diary for a user
CREATE INDEX IF NOT EXISTS idx_fde_user_date
  ON public.food_diary_entries(user_id, date DESC);

-- Meal-type filtering within a day
CREATE INDEX IF NOT EXISTS idx_fde_user_date_meal
  ON public.food_diary_entries(user_id, date, meal_type);

-- Dashboard aggregate: sum kcal for today
CREATE INDEX IF NOT EXISTS idx_fde_user_date_kcal
  ON public.food_diary_entries(user_id, date) INCLUDE (kcal);

-- Lookup by OFF barcode (for potential future deduplication)
CREATE INDEX IF NOT EXISTS idx_fde_food_off_id
  ON public.food_diary_entries(food_off_id)
  WHERE food_off_id IS NOT NULL;
