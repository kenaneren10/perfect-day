-- ============================================================
-- PROJ-3: Übungsbibliothek — Database Migration
-- Run in Supabase SQL Editor (Dev first, then Prod)
-- ============================================================

-- ── 1. Enum Types ─────────────────────────────────────────

CREATE TYPE exercise_category AS ENUM ('strength', 'cardio');
CREATE TYPE exercise_equipment AS ENUM ('none', 'basic', 'full');
CREATE TYPE exercise_difficulty AS ENUM ('beginner', 'intermediate', 'advanced');

-- ── 2. exercises table ────────────────────────────────────

CREATE TABLE IF NOT EXISTS exercises (
  id           UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT           NOT NULL CHECK (char_length(name) <= 200),
  category     exercise_category NOT NULL,
  muscle_groups TEXT[]        NOT NULL CHECK (array_length(muscle_groups, 1) >= 1),
  equipment    exercise_equipment NOT NULL,
  difficulty   exercise_difficulty NOT NULL,
  description  TEXT,
  image_url    TEXT,
  video_url    TEXT,
  is_system    BOOLEAN        NOT NULL DEFAULT FALSE,
  user_id      UUID           REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_at   TIMESTAMPTZ,
  created_at   TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE exercises IS
  'Zentrale Übungsbibliothek: System-Übungen (is_system=true) + private Custom-Übungen der Nutzer';
COMMENT ON COLUMN exercises.muscle_groups IS
  'Erlaubte Werte: chest, back, shoulders, arms, core, legs, glutes, full_body';
COMMENT ON COLUMN exercises.deleted_at IS
  'Soft Delete: NULL = aktiv, gesetzt = gelöscht. Custom-Übungen werden nie physisch gelöscht.';

-- ── 3. Row Level Security: exercises ─────────────────────

ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

-- Authenticated users see system exercises + their own custom exercises (both only if not soft-deleted)
CREATE POLICY "exercises_select_authenticated" ON exercises
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND deleted_at IS NULL
    AND (is_system = TRUE OR user_id = auth.uid())
  );

-- Authenticated users may insert their own custom exercises only
CREATE POLICY "exercises_insert_own" ON exercises
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND is_system = FALSE
    AND user_id = auth.uid()
  );

-- Users may update (incl. soft-delete) only their own custom exercises
CREATE POLICY "exercises_update_own" ON exercises
  FOR UPDATE
  USING (
    auth.uid() = user_id
    AND is_system = FALSE
  )
  WITH CHECK (
    auth.uid() = user_id
    AND is_system = FALSE
  );

-- Hard deletes are blocked: only soft delete via UPDATE is permitted through the app.
-- Service-role (seed scripts, admin) bypasses RLS and can hard-delete if needed.

-- ── 4. favorites table ────────────────────────────────────

CREATE TABLE IF NOT EXISTS favorites (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id UUID        NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, exercise_id)
);

COMMENT ON TABLE favorites IS
  'Pro-Nutzer-Favoriten für Übungen. Unique (user_id, exercise_id) verhindert Doppeleinträge.';

-- ── 5. Row Level Security: favorites ─────────────────────

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "favorites_select_own" ON favorites
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "favorites_insert_own" ON favorites
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "favorites_delete_own" ON favorites
  FOR DELETE
  USING (auth.uid() = user_id);

-- ── 6. updated_at auto-trigger ────────────────────────────

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER exercises_set_updated_at
  BEFORE UPDATE ON exercises
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- ── 7. Indexes ────────────────────────────────────────────

-- Partial indexes (WHERE deleted_at IS NULL) keep index size small
CREATE INDEX idx_exercises_is_system  ON exercises(is_system)  WHERE deleted_at IS NULL;
CREATE INDEX idx_exercises_user_id    ON exercises(user_id)    WHERE deleted_at IS NULL;
CREATE INDEX idx_exercises_category   ON exercises(category)   WHERE deleted_at IS NULL;
CREATE INDEX idx_exercises_equipment  ON exercises(equipment)  WHERE deleted_at IS NULL;
CREATE INDEX idx_exercises_difficulty ON exercises(difficulty) WHERE deleted_at IS NULL;
CREATE INDEX idx_exercises_name       ON exercises(name)       WHERE deleted_at IS NULL;

CREATE INDEX idx_favorites_user_id    ON favorites(user_id);
CREATE INDEX idx_favorites_exercise_id ON favorites(exercise_id);
