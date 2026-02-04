-- =====================================================
-- Migration: run_steps, run_approvals, run_artifacts
-- Created: 2025-02-04T19:00:00Z
-- Tables: run_steps, run_approvals, run_artifacts
-- Purpose: Run Details / History: steps, approvals, artifacts per automation run
-- =====================================================

-- Enable UUID extension (idempotent)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: run_steps
-- Purpose: Step-level data per run (inputs, outputs, logs, artifact links)
-- =====================================================
CREATE TABLE IF NOT EXISTS run_steps (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  run_id UUID NOT NULL REFERENCES automation_runs(id) ON DELETE CASCADE,

  step_index INTEGER NOT NULL DEFAULT 0,
  step_type TEXT NOT NULL DEFAULT 'fetch',
  input_data JSONB DEFAULT '{}'::jsonb,
  output_data JSONB DEFAULT '{}'::jsonb,
  logs TEXT,
  artifact_links JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS run_steps_run_id_idx ON run_steps(run_id);
CREATE INDEX IF NOT EXISTS run_steps_run_id_step_index_idx ON run_steps(run_id, step_index);

ALTER TABLE run_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "run_steps_select_own"
  ON run_steps FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM automation_runs ar
      JOIN automations a ON a.id = ar.automation_id
      WHERE ar.id = run_steps.run_id AND a.user_id = auth.uid()
    )
  );

CREATE POLICY "run_steps_insert_own"
  ON run_steps FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM automation_runs ar
      JOIN automations a ON a.id = ar.automation_id
      WHERE ar.id = run_steps.run_id AND a.user_id = auth.uid()
    )
  );

COMMENT ON TABLE run_steps IS 'Step-level data per automation run for Run Details timeline';
COMMENT ON COLUMN run_steps.artifact_links IS 'Array of artifact IDs or URLs for this step';

-- =====================================================
-- TABLE: run_approvals
-- Purpose: Approval decisions per run (decision, actor, rollback options)
-- =====================================================
CREATE TABLE IF NOT EXISTS run_approvals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  run_id UUID NOT NULL REFERENCES automation_runs(id) ON DELETE CASCADE,

  requested_action TEXT NOT NULL,
  payload JSONB DEFAULT '{}'::jsonb,
  decision TEXT NOT NULL DEFAULT 'pending' CHECK (decision IN ('pending', 'approved', 'rejected')),
  actor TEXT,
  rollback_options JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS run_approvals_run_id_idx ON run_approvals(run_id);

DROP TRIGGER IF EXISTS update_run_approvals_updated_at ON run_approvals;
CREATE TRIGGER update_run_approvals_updated_at
  BEFORE UPDATE ON run_approvals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE run_approvals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "run_approvals_select_own"
  ON run_approvals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM automation_runs ar
      JOIN automations a ON a.id = ar.automation_id
      WHERE ar.id = run_approvals.run_id AND a.user_id = auth.uid()
    )
  );

CREATE POLICY "run_approvals_insert_own"
  ON run_approvals FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM automation_runs ar
      JOIN automations a ON a.id = ar.automation_id
      WHERE ar.id = run_approvals.run_id AND a.user_id = auth.uid()
    )
  );

CREATE POLICY "run_approvals_update_own"
  ON run_approvals FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM automation_runs ar
      JOIN automations a ON a.id = ar.automation_id
      WHERE ar.id = run_approvals.run_id AND a.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM automation_runs ar
      JOIN automations a ON a.id = ar.automation_id
      WHERE ar.id = run_approvals.run_id AND a.user_id = auth.uid()
    )
  );

COMMENT ON TABLE run_approvals IS 'Approval decisions per run for Run Details and rollback';

-- =====================================================
-- TABLE: run_artifacts
-- Purpose: Artifacts per run (screenshots, exports, download links)
-- =====================================================
CREATE TABLE IF NOT EXISTS run_artifacts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  run_id UUID NOT NULL REFERENCES automation_runs(id) ON DELETE CASCADE,

  file_type TEXT NOT NULL DEFAULT 'file',
  download_link TEXT,
  label TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS run_artifacts_run_id_idx ON run_artifacts(run_id);

ALTER TABLE run_artifacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "run_artifacts_select_own"
  ON run_artifacts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM automation_runs ar
      JOIN automations a ON a.id = ar.automation_id
      WHERE ar.id = run_artifacts.run_id AND a.user_id = auth.uid()
    )
  );

CREATE POLICY "run_artifacts_insert_own"
  ON run_artifacts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM automation_runs ar
      JOIN automations a ON a.id = ar.automation_id
      WHERE ar.id = run_artifacts.run_id AND a.user_id = auth.uid()
    )
  );

COMMENT ON TABLE run_artifacts IS 'Artifacts per run (screenshots, exports) for Run Details panel';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- DROP TABLE IF EXISTS run_artifacts CASCADE;
-- DROP TABLE IF EXISTS run_approvals CASCADE;
-- DROP TABLE IF EXISTS run_steps CASCADE;
