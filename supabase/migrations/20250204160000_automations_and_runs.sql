-- =====================================================
-- Migration: automations and automation_runs tables
-- Created: 2025-02-04T16:00:00Z
-- Tables: automations, automation_runs
-- Purpose: Store automation rules and scheduled run history for Automations & Scheduler page
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
-- TABLE: automations
-- Purpose: Automation rules: skill, trigger, schedule, timezone, enabled; owned by user
-- =====================================================
CREATE TABLE IF NOT EXISTS automations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  name TEXT NOT NULL,
  skill_id TEXT NOT NULL,
  skill_name TEXT,
  trigger_type TEXT NOT NULL DEFAULT 'schedule' CHECK (trigger_type IN ('manual', 'schedule', 'event')),
  schedule_config JSONB DEFAULT '{}'::jsonb,
  timezone TEXT NOT NULL DEFAULT 'UTC',

  enabled BOOLEAN NOT NULL DEFAULT true,
  next_run_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  CONSTRAINT automations_name_not_empty CHECK (length(trim(name)) > 0)
);

CREATE INDEX IF NOT EXISTS automations_user_id_idx ON automations(user_id);
CREATE INDEX IF NOT EXISTS automations_next_run_at_idx ON automations(next_run_at) WHERE enabled = true;
CREATE INDEX IF NOT EXISTS automations_created_at_idx ON automations(created_at DESC);

DROP TRIGGER IF EXISTS update_automations_updated_at ON automations;
CREATE TRIGGER update_automations_updated_at
  BEFORE UPDATE ON automations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE automations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "automations_select_own"
  ON automations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "automations_insert_own"
  ON automations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "automations_update_own"
  ON automations FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "automations_delete_own"
  ON automations FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE automations IS 'User automation rules: skill, trigger, schedule, timezone';
COMMENT ON COLUMN automations.schedule_config IS 'Cron expression or event config (JSON)';
COMMENT ON COLUMN automations.next_run_at IS 'Next scheduled run time (computed by scheduler)';

-- =====================================================
-- TABLE: automation_runs
-- Purpose: Run history per automation: run_time, status, result; for audit and last-run link
-- =====================================================
CREATE TABLE IF NOT EXISTS automation_runs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  automation_id UUID REFERENCES automations(id) ON DELETE CASCADE NOT NULL,

  run_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  result JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS automation_runs_automation_id_idx ON automation_runs(automation_id);
CREATE INDEX IF NOT EXISTS automation_runs_run_time_idx ON automation_runs(run_time DESC);

ALTER TABLE automation_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "automation_runs_select_own"
  ON automation_runs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM automations a
      WHERE a.id = automation_runs.automation_id AND a.user_id = auth.uid()
    )
  );

CREATE POLICY "automation_runs_insert_own"
  ON automation_runs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM automations a
      WHERE a.id = automation_runs.automation_id AND a.user_id = auth.uid()
    )
  );

-- No UPDATE/DELETE from app for runs (audit trail); server/service role can insert

COMMENT ON TABLE automation_runs IS 'Run history per automation; audit trail and last-run snapshot';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS automation_runs CASCADE;
-- DROP TABLE IF EXISTS automations CASCADE;
