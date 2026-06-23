-- PROJ-5: Fortschritts-Tracking & Streaks
-- Creates workout_sessions and session_sets tables

-- ── workout_sessions ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS workout_sessions (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_day_id   UUID        NOT NULL REFERENCES plan_days(id) ON DELETE CASCADE,
  status        TEXT        NOT NULL DEFAULT 'in_progress'
                            CHECK (status IN ('in_progress', 'completed')),
  started_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at  TIMESTAMPTZ
);

ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;

-- Owner-only access
CREATE POLICY "Users manage own sessions"
  ON workout_sessions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Performance indexes
CREATE INDEX idx_workout_sessions_user_id ON workout_sessions(user_id);
CREATE INDEX idx_workout_sessions_plan_day ON workout_sessions(plan_day_id);
CREATE INDEX idx_workout_sessions_user_status ON workout_sessions(user_id, status);
-- Date-range queries (today's session, history)
CREATE INDEX idx_workout_sessions_started_at ON workout_sessions(user_id, started_at DESC);
CREATE INDEX idx_workout_sessions_completed_at ON workout_sessions(user_id, completed_at DESC)
  WHERE status = 'completed';

-- ── session_sets ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS session_sets (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id        UUID        NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,
  plan_exercise_id  UUID        NOT NULL REFERENCES plan_exercises(id) ON DELETE CASCADE,
  set_number        INTEGER     NOT NULL CHECK (set_number >= 1),
  weight_kg         DECIMAL(6,2),
  reps              INTEGER     CHECK (reps >= 0),
  duration_minutes  DECIMAL(6,2),
  logged_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Enables upsert: user can update a set value without creating a duplicate
  UNIQUE (session_id, plan_exercise_id, set_number)
);

ALTER TABLE session_sets ENABLE ROW LEVEL SECURITY;

-- Access via JOIN to workout_sessions (owner check through parent)
CREATE POLICY "Users manage own session sets"
  ON session_sets FOR ALL
  USING (
    session_id IN (
      SELECT id FROM workout_sessions WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    session_id IN (
      SELECT id FROM workout_sessions WHERE user_id = auth.uid()
    )
  );

-- Performance indexes
CREATE INDEX idx_session_sets_session ON session_sets(session_id);
CREATE INDEX idx_session_sets_exercise ON session_sets(plan_exercise_id);
