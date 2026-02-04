-- =====================================================
-- Migration: approval_audit_logs, approval_rules
-- Created: 2025-02-04T22:00:00Z
-- Tables: approval_audit_logs, approval_rules
-- Purpose: Approvals & Trust Controls - audit trail and auto-approval rules
-- =====================================================

-- Enable UUID extension (idempotent)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: approval_audit_logs
-- Purpose: Audit trail for approval decisions (decision, actor, comments)
-- =====================================================
CREATE TABLE IF NOT EXISTS approval_audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  approval_id UUID NOT NULL REFERENCES run_approvals(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  decision TEXT NOT NULL CHECK (decision IN ('approved', 'rejected', 'undo')),
  comments TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS approval_audit_logs_approval_id_idx ON approval_audit_logs(approval_id);
CREATE INDEX IF NOT EXISTS approval_audit_logs_user_id_idx ON approval_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS approval_audit_logs_created_at_idx ON approval_audit_logs(created_at DESC);

ALTER TABLE approval_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "approval_audit_logs_select_own"
  ON approval_audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM run_approvals ra
      JOIN automation_runs ar ON ar.id = ra.run_id
      JOIN automations a ON a.id = ar.automation_id
      WHERE ra.id = approval_audit_logs.approval_id AND a.user_id = auth.uid()
    )
  );

CREATE POLICY "approval_audit_logs_insert_own"
  ON approval_audit_logs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM run_approvals ra
      JOIN automation_runs ar ON ar.id = ra.run_id
      JOIN automations a ON a.id = ar.automation_id
      WHERE ra.id = approval_audit_logs.approval_id AND a.user_id = auth.uid()
    )
  );

COMMENT ON TABLE approval_audit_logs IS 'Audit log for approval decisions; supports compliance and undo history';
COMMENT ON COLUMN approval_audit_logs.decision IS 'approved, rejected, or undo (revert)';

-- =====================================================
-- TABLE: approval_rules
-- Purpose: Auto-approval rules (criteria, action type) for "always allow" behavior
-- =====================================================
CREATE TABLE IF NOT EXISTS approval_rules (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  criteria JSONB NOT NULL DEFAULT '{}'::jsonb,
  action_type TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT approval_rules_name_not_empty CHECK (length(trim(name)) > 0)
);

CREATE INDEX IF NOT EXISTS approval_rules_user_id_idx ON approval_rules(user_id);
CREATE INDEX IF NOT EXISTS approval_rules_action_type_idx ON approval_rules(action_type);
CREATE INDEX IF NOT EXISTS approval_rules_created_at_idx ON approval_rules(created_at DESC);

ALTER TABLE approval_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "approval_rules_select_own"
  ON approval_rules FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "approval_rules_insert_own"
  ON approval_rules FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "approval_rules_update_own"
  ON approval_rules FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "approval_rules_delete_own"
  ON approval_rules FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE approval_rules IS 'Auto-approval rules: criteria and action type for future approvals';
COMMENT ON COLUMN approval_rules.criteria IS 'JSON criteria (e.g. skill_id, requested_action) to match';
COMMENT ON COLUMN approval_rules.action_type IS 'Requested action type this rule applies to';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- DROP TABLE IF EXISTS approval_rules CASCADE;
-- DROP TABLE IF EXISTS approval_audit_logs CASCADE;
