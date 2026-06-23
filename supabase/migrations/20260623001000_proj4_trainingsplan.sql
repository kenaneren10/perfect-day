-- ============================================================
-- PROJ-4: Adaptiver Trainingsplan — Database Migration
-- Run in Supabase SQL Editor (Dev first, then Prod)
-- ============================================================

-- ── 1. Extend profiles table ───────────────────────────────

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS training_days_per_week INTEGER
    CHECK (training_days_per_week IN (3, 4, 5));

-- ── 2. workout_plans table ────────────────────────────────

CREATE TABLE IF NOT EXISTS workout_plans (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  training_days_per_week INTEGER    NOT NULL CHECK (training_days_per_week IN (3, 4, 5)),
  sets_bonus            INTEGER     NOT NULL DEFAULT 0,
  progression_pending   BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id)
);

COMMENT ON TABLE workout_plans IS
  'Ein aktiver Trainingsplan pro Nutzer. UNIQUE(user_id) garantiert Eindeutigkeit.';
COMMENT ON COLUMN workout_plans.sets_bonus IS
  'Wird um 1 erhöht bei jeder bestätigten Progression (nach ~8 abgeschlossenen Einheiten).';
COMMENT ON COLUMN workout_plans.progression_pending IS
  'TRUE wenn Progressionsschwelle erreicht, aber Nutzer noch nicht bestätigt hat.';

-- ── 3. plan_days table ────────────────────────────────────

CREATE TABLE IF NOT EXISTS plan_days (
  id            UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id       UUID    NOT NULL REFERENCES workout_plans(id) ON DELETE CASCADE,
  day_of_week   INTEGER NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
  is_rest_day   BOOLEAN NOT NULL DEFAULT FALSE,
  focus         TEXT    CHECK (focus IN ('full_body', 'upper_body', 'lower_body', 'cardio', 'core')),
  display_label TEXT,
  UNIQUE (plan_id, day_of_week)
);

COMMENT ON TABLE plan_days IS
  '7 Tage pro Trainingsplan. day_of_week: 1=Montag … 7=Sonntag.';
COMMENT ON COLUMN plan_days.focus IS
  'NULL wenn is_rest_day=TRUE.';

-- ── 4. plan_exercises table ───────────────────────────────

CREATE TABLE IF NOT EXISTS plan_exercises (
  id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  day_id      UUID    NOT NULL REFERENCES plan_days(id) ON DELETE CASCADE,
  exercise_id UUID    NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  position    INTEGER NOT NULL,
  base_sets   INTEGER NOT NULL,
  reps_min    INTEGER NOT NULL,
  reps_max    INTEGER NOT NULL,
  UNIQUE (day_id, position)
);

COMMENT ON TABLE plan_exercises IS
  'Übungen pro Trainingstag. Effektive Sätze = base_sets + workout_plans.sets_bonus.';

-- ── 5. Row Level Security ─────────────────────────────────

ALTER TABLE workout_plans  ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_days      ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_exercises ENABLE ROW LEVEL SECURITY;

-- workout_plans: owner only
CREATE POLICY "workout_plans_select_own" ON workout_plans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "workout_plans_insert_own" ON workout_plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "workout_plans_update_own" ON workout_plans
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "workout_plans_delete_own" ON workout_plans
  FOR DELETE USING (auth.uid() = user_id);

-- plan_days: access via parent workout_plan
CREATE POLICY "plan_days_select_own" ON plan_days
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workout_plans wp
      WHERE wp.id = plan_days.plan_id AND wp.user_id = auth.uid()
    )
  );

CREATE POLICY "plan_days_insert_own" ON plan_days
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM workout_plans wp
      WHERE wp.id = plan_days.plan_id AND wp.user_id = auth.uid()
    )
  );

CREATE POLICY "plan_days_delete_own" ON plan_days
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM workout_plans wp
      WHERE wp.id = plan_days.plan_id AND wp.user_id = auth.uid()
    )
  );

-- plan_exercises: access via plan_days → workout_plans
CREATE POLICY "plan_exercises_select_own" ON plan_exercises
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM plan_days pd
      JOIN workout_plans wp ON wp.id = pd.plan_id
      WHERE pd.id = plan_exercises.day_id AND wp.user_id = auth.uid()
    )
  );

CREATE POLICY "plan_exercises_insert_own" ON plan_exercises
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM plan_days pd
      JOIN workout_plans wp ON wp.id = pd.plan_id
      WHERE pd.id = plan_exercises.day_id AND wp.user_id = auth.uid()
    )
  );

CREATE POLICY "plan_exercises_delete_own" ON plan_exercises
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM plan_days pd
      JOIN workout_plans wp ON wp.id = pd.plan_id
      WHERE pd.id = plan_exercises.day_id AND wp.user_id = auth.uid()
    )
  );

-- ── 6. Indexes ────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_workout_plans_user
  ON workout_plans(user_id);

CREATE INDEX IF NOT EXISTS idx_plan_days_plan
  ON plan_days(plan_id, day_of_week);

CREATE INDEX IF NOT EXISTS idx_plan_exercises_day
  ON plan_exercises(day_id, position);
