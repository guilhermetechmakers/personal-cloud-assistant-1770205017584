-- =====================================================
-- Migration: web_agent_runs, web_agent_run_steps, web_agent_profiles, web_agent_step_approvals
-- Created: 2025-02-04T20:00:00Z
-- Tables: web_agent_runs, web_agent_run_steps, web_agent_profiles, web_agent_step_approvals
-- Purpose: Web Agent Runs & Recorder: runs, steps, profiles, step-level approvals
-- =====================================================

-- Enable UUID extension (idempotent)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Helper function for updated_at (idempotent)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TABLE: web_agent_profiles
-- Purpose: User profiles for web agent (ephemeral vs persistent); credentials stored via KMS ref
-- =====================================================
CREATE TABLE IF NOT EXISTS web_agent_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  name TEXT NOT NULL,
  profile_type TEXT NOT NULL DEFAULT 'ephemeral' CHECK (profile_type IN ('ephemeral', 'persistent')),
  credentials_ref TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  CONSTRAINT web_agent_profiles_name_not_empty CHECK (length(trim(name)) > 0)
);

CREATE INDEX IF NOT EXISTS web_agent_profiles_user_id_idx ON web_agent_profiles(user_id);
CREATE INDEX IF NOT EXISTS web_agent_profiles_profile_type_idx ON web_agent_profiles(profile_type);

DROP TRIGGER IF EXISTS update_web_agent_profiles_updated_at ON web_agent_profiles;
CREATE TRIGGER update_web_agent_profiles_updated_at
  BEFORE UPDATE ON web_agent_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE web_agent_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "web_agent_profiles_select_own"
  ON web_agent_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "web_agent_profiles_insert_own"
  ON web_agent_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "web_agent_profiles_update_own"
  ON web_agent_profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "web_agent_profiles_delete_own"
  ON web_agent_profiles FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE web_agent_profiles IS 'Web agent profiles (ephemeral/persistent); credentials_ref points to KMS-encrypted data';

-- =====================================================
-- TABLE: web_agent_runs
-- Purpose: Web agent run sessions: profile_type, status, start/end times
-- =====================================================
CREATE TABLE IF NOT EXISTS web_agent_runs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  profile_id UUID REFERENCES web_agent_profiles(id) ON DELETE SET NULL,

  profile_type TEXT NOT NULL DEFAULT 'ephemeral' CHECK (profile_type IN ('ephemeral', 'persistent')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'paused', 'completed', 'failed', 'cancelled')),
  start_time TIMESTAMPTZ DEFAULT NOW(),
  end_time TIMESTAMPTZ,
  script_preview JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS web_agent_runs_user_id_idx ON web_agent_runs(user_id);
CREATE INDEX IF NOT EXISTS web_agent_runs_status_idx ON web_agent_runs(status);
CREATE INDEX IF NOT EXISTS web_agent_runs_start_time_idx ON web_agent_runs(start_time DESC);
CREATE INDEX IF NOT EXISTS web_agent_runs_profile_id_idx ON web_agent_runs(profile_id);

DROP TRIGGER IF EXISTS update_web_agent_runs_updated_at ON web_agent_runs;
CREATE TRIGGER update_web_agent_runs_updated_at
  BEFORE UPDATE ON web_agent_runs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE web_agent_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "web_agent_runs_select_own"
  ON web_agent_runs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "web_agent_runs_insert_own"
  ON web_agent_runs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "web_agent_runs_update_own"
  ON web_agent_runs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "web_agent_runs_delete_own"
  ON web_agent_runs FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE web_agent_runs IS 'Web agent run sessions; script_preview is high-level action list';

-- =====================================================
-- TABLE: web_agent_run_steps
-- Purpose: Step-level data per run: description, screenshot_url, requires_approval, logs
-- =====================================================
CREATE TABLE IF NOT EXISTS web_agent_run_steps (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  run_id UUID NOT NULL REFERENCES web_agent_runs(id) ON DELETE CASCADE,

  step_index INTEGER NOT NULL DEFAULT 0,
  description TEXT NOT NULL DEFAULT '',
  screenshot_url TEXT,
  requires_approval BOOLEAN NOT NULL DEFAULT false,
  logs TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled', 'awaiting_approval')),
  payload JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS web_agent_run_steps_run_id_idx ON web_agent_run_steps(run_id);
CREATE INDEX IF NOT EXISTS web_agent_run_steps_run_id_step_index_idx ON web_agent_run_steps(run_id, step_index);

ALTER TABLE web_agent_run_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "web_agent_run_steps_select_own"
  ON web_agent_run_steps FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM web_agent_runs r
      WHERE r.id = web_agent_run_steps.run_id AND r.user_id = auth.uid()
    )
  );

CREATE POLICY "web_agent_run_steps_insert_own"
  ON web_agent_run_steps FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM web_agent_runs r
      WHERE r.id = web_agent_run_steps.run_id AND r.user_id = auth.uid()
    )
  );

CREATE POLICY "web_agent_run_steps_update_own"
  ON web_agent_run_steps FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM web_agent_runs r
      WHERE r.id = web_agent_run_steps.run_id AND r.user_id = auth.uid()
    )
  );

COMMENT ON TABLE web_agent_run_steps IS 'Step-level timeline for web agent runs; screenshots and approval checkpoints';

-- =====================================================
-- TABLE: web_agent_step_approvals
-- Purpose: Approval decisions per step (decision, actor, editable payload)
-- =====================================================
CREATE TABLE IF NOT EXISTS web_agent_step_approvals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  step_id UUID NOT NULL REFERENCES web_agent_run_steps(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  payload JSONB DEFAULT '{}'::jsonb,
  decision_note TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  UNIQUE(step_id)
);

CREATE INDEX IF NOT EXISTS web_agent_step_approvals_step_id_idx ON web_agent_step_approvals(step_id);
CREATE INDEX IF NOT EXISTS web_agent_step_approvals_user_id_idx ON web_agent_step_approvals(user_id);

DROP TRIGGER IF EXISTS update_web_agent_step_approvals_updated_at ON web_agent_step_approvals;
CREATE TRIGGER update_web_agent_step_approvals_updated_at
  BEFORE UPDATE ON web_agent_step_approvals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE web_agent_step_approvals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "web_agent_step_approvals_select_own"
  ON web_agent_step_approvals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM web_agent_run_steps s
      JOIN web_agent_runs r ON r.id = s.run_id
      WHERE s.id = web_agent_step_approvals.step_id AND r.user_id = auth.uid()
    )
  );

CREATE POLICY "web_agent_step_approvals_insert_own"
  ON web_agent_step_approvals FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM web_agent_run_steps s
      JOIN web_agent_runs r ON r.id = s.run_id
      WHERE s.id = web_agent_step_approvals.step_id AND r.user_id = auth.uid()
    )
  );

CREATE POLICY "web_agent_step_approvals_update_own"
  ON web_agent_step_approvals FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM web_agent_run_steps s
      JOIN web_agent_runs r ON r.id = s.run_id
      WHERE s.id = web_agent_step_approvals.step_id AND r.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM web_agent_run_steps s
      JOIN web_agent_runs r ON r.id = s.run_id
      WHERE s.id = web_agent_step_approvals.step_id AND r.user_id = auth.uid()
    )
  );

COMMENT ON TABLE web_agent_step_approvals IS 'Approval checkpoint decisions per web agent step';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- DROP TABLE IF EXISTS web_agent_step_approvals CASCADE;
-- DROP TABLE IF EXISTS web_agent_run_steps CASCADE;
-- DROP TABLE IF EXISTS web_agent_runs CASCADE;
-- DROP TABLE IF EXISTS web_agent_profiles CASCADE;
