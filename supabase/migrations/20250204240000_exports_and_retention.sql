-- =====================================================
-- Migration: exports and retention_policies tables
-- Created: 2025-02-04T24:00:00Z
-- Tables: exports, retention_policies
-- Purpose: Data export requests and retention policy configuration for Data Management
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
-- TABLE: exports
-- Purpose: Export requests: data_type, format, date range, status, download link
-- =====================================================
CREATE TABLE IF NOT EXISTS exports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  data_type TEXT NOT NULL CHECK (data_type IN ('runs', 'reports', 'audit_logs')),
  format TEXT NOT NULL CHECK (format IN ('csv', 'pdf', 'json')),
  date_from TIMESTAMPTZ NOT NULL,
  date_to TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  download_link TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  CONSTRAINT exports_date_range_valid CHECK (date_from <= date_to)
);

CREATE INDEX IF NOT EXISTS exports_user_id_idx ON exports(user_id);
CREATE INDEX IF NOT EXISTS exports_created_at_idx ON exports(created_at DESC);
CREATE INDEX IF NOT EXISTS exports_status_idx ON exports(status);

DROP TRIGGER IF EXISTS update_exports_updated_at ON exports;
CREATE TRIGGER update_exports_updated_at
  BEFORE UPDATE ON exports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE exports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "exports_select_own"
  ON exports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "exports_insert_own"
  ON exports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "exports_update_own"
  ON exports FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "exports_delete_own"
  ON exports FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE exports IS 'User export requests: runs, reports, or audit logs in CSV/PDF/JSON';
COMMENT ON COLUMN exports.download_link IS 'Secure download URL; populated when status = completed';

-- =====================================================
-- TABLE: retention_policies
-- Purpose: Data retention rules: data_type, period, action on expiry; created_by (user/workspace admin)
-- =====================================================
CREATE TABLE IF NOT EXISTS retention_policies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  data_type TEXT NOT NULL CHECK (data_type IN ('runs', 'reports', 'audit_logs', 'screenshots')),
  retention_period_days INTEGER NOT NULL CHECK (retention_period_days > 0),
  action_on_expiry TEXT NOT NULL DEFAULT 'purge' CHECK (action_on_expiry IN ('purge', 'archive')),

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS retention_policies_created_by_idx ON retention_policies(created_by);
CREATE INDEX IF NOT EXISTS retention_policies_data_type_idx ON retention_policies(data_type);

DROP TRIGGER IF EXISTS update_retention_policies_updated_at ON retention_policies;
CREATE TRIGGER update_retention_policies_updated_at
  BEFORE UPDATE ON retention_policies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE retention_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "retention_policies_select_own"
  ON retention_policies FOR SELECT
  USING (auth.uid() = created_by);

CREATE POLICY "retention_policies_insert_own"
  ON retention_policies FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "retention_policies_update_own"
  ON retention_policies FOR UPDATE
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "retention_policies_delete_own"
  ON retention_policies FOR DELETE
  USING (auth.uid() = created_by);

COMMENT ON TABLE retention_policies IS 'Data retention rules: type, period in days, action on expiry (purge/archive)';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS retention_policies CASCADE;
-- DROP TABLE IF EXISTS exports CASCADE;
