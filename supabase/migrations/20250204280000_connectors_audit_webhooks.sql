-- =====================================================
-- Migration: connectors, connector_audit_logs, webhook_events
-- Created: 2025-02-04T28:00:00Z
-- Tables: connectors, connector_audit_logs, webhook_events
-- Purpose: OAuth & token management; audit logs and webhook events for Connector Service
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
-- TABLE: connectors
-- Purpose: Third-party integrations (Gmail, Calendar, Slack, etc.); tokens stored via token_ref (KMS/vault)
-- =====================================================
CREATE TABLE IF NOT EXISTS connectors (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  provider TEXT NOT NULL,
  scopes JSONB DEFAULT '[]'::jsonb,
  token_ref TEXT,
  refresh_token_ref TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disconnected', 'error', 'expired')),
  expires_at TIMESTAMPTZ,
  last_health_at TIMESTAMPTZ,
  last_sync_at TIMESTAMPTZ,

  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  CONSTRAINT connectors_provider_not_empty CHECK (length(trim(provider)) > 0)
);

CREATE INDEX IF NOT EXISTS connectors_user_id_idx ON connectors(user_id);
CREATE INDEX IF NOT EXISTS connectors_provider_idx ON connectors(provider);
CREATE INDEX IF NOT EXISTS connectors_status_idx ON connectors(status);
CREATE INDEX IF NOT EXISTS connectors_created_at_idx ON connectors(created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS connectors_user_provider_unique ON connectors(user_id, provider);

DROP TRIGGER IF EXISTS update_connectors_updated_at ON connectors;
CREATE TRIGGER update_connectors_updated_at
  BEFORE UPDATE ON connectors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE connectors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "connectors_select_own"
  ON connectors FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "connectors_insert_own"
  ON connectors FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "connectors_update_own"
  ON connectors FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "connectors_delete_own"
  ON connectors FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE connectors IS 'OAuth connectors per user; token_ref/refresh_token_ref reference KMS/vault';
COMMENT ON COLUMN connectors.token_ref IS 'Reference to encrypted access token (KMS/vault); never store raw token';
COMMENT ON COLUMN connectors.refresh_token_ref IS 'Reference to encrypted refresh token';
COMMENT ON COLUMN connectors.last_health_at IS 'Last successful health check timestamp';

-- =====================================================
-- TABLE: connector_audit_logs
-- Purpose: Audit trail for connector actions (connect, disconnect, refresh, error)
-- =====================================================
CREATE TABLE IF NOT EXISTS connector_audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  connector_id UUID REFERENCES connectors(id) ON DELETE CASCADE NOT NULL,

  action TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  CONSTRAINT connector_audit_logs_action_not_empty CHECK (length(trim(action)) > 0)
);

CREATE INDEX IF NOT EXISTS connector_audit_logs_user_id_idx ON connector_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS connector_audit_logs_connector_id_idx ON connector_audit_logs(connector_id);
CREATE INDEX IF NOT EXISTS connector_audit_logs_created_at_idx ON connector_audit_logs(created_at DESC);

ALTER TABLE connector_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "connector_audit_logs_select_own"
  ON connector_audit_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "connector_audit_logs_insert_own"
  ON connector_audit_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- No UPDATE/DELETE on audit logs (append-only)

COMMENT ON TABLE connector_audit_logs IS 'Append-only audit log for connector actions';

-- =====================================================
-- TABLE: webhook_events
-- Purpose: Inbound webhook events from connected services (Gmail push, Slack events, etc.)
-- =====================================================
CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  connector_id UUID REFERENCES connectors(id) ON DELETE CASCADE NOT NULL,

  event_type TEXT NOT NULL,
  payload JSONB DEFAULT '{}'::jsonb,
  received_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  CONSTRAINT webhook_events_event_type_not_empty CHECK (length(trim(event_type)) > 0)
);

CREATE INDEX IF NOT EXISTS webhook_events_connector_id_idx ON webhook_events(connector_id);
CREATE INDEX IF NOT EXISTS webhook_events_received_at_idx ON webhook_events(received_at DESC);

ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

-- Users can read webhook_events only for their own connectors
CREATE POLICY "webhook_events_select_via_connector"
  ON webhook_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM connectors c
      WHERE c.id = webhook_events.connector_id AND c.user_id = auth.uid()
    )
  );

-- Insert typically from backend/service role; allow user for testing (optional)
CREATE POLICY "webhook_events_insert_via_connector"
  ON webhook_events FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM connectors c
      WHERE c.id = webhook_events.connector_id AND c.user_id = auth.uid()
    )
  );

COMMENT ON TABLE webhook_events IS 'Inbound webhook events per connector';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS webhook_events CASCADE;
-- DROP TABLE IF EXISTS connector_audit_logs CASCADE;
-- DROP TABLE IF EXISTS connectors CASCADE;
