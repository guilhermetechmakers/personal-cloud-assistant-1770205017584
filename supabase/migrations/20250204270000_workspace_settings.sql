-- =====================================================
-- Migration: Workspace settings tables
-- Created: 2025-02-04T27:00:00Z
-- Tables: workspaces, workspace_members, workspace_billing, workspace_security_policies, workspace_audit_logs
-- Purpose: Admin-level workspace configuration, team, billing, security policies, audit logs
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
-- TABLE: workspaces
-- Purpose: Workspace entity: name, plan, usage stats, owner
-- =====================================================
CREATE TABLE IF NOT EXISTS workspaces (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'teams')),
  usage_stats JSONB DEFAULT '{"skills_used": 0, "runs_this_month": 0, "skills_limit": 10, "runs_limit": 50}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT workspaces_name_not_empty CHECK (length(trim(name)) > 0)
);

CREATE INDEX IF NOT EXISTS workspaces_owner_id_idx ON workspaces(owner_id);
CREATE INDEX IF NOT EXISTS workspaces_created_at_idx ON workspaces(created_at DESC);

DROP TRIGGER IF EXISTS update_workspaces_updated_at ON workspaces;
CREATE TRIGGER update_workspaces_updated_at
  BEFORE UPDATE ON workspaces
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workspaces_select_member"
  ON workspaces FOR SELECT
  USING (
    owner_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM workspace_members wm
      WHERE wm.workspace_id = workspaces.id AND wm.user_id = auth.uid()
    )
  );

CREATE POLICY "workspaces_insert_own"
  ON workspaces FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "workspaces_update_owner"
  ON workspaces FOR UPDATE
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "workspaces_delete_owner"
  ON workspaces FOR DELETE
  USING (owner_id = auth.uid());

COMMENT ON TABLE workspaces IS 'Workspace entity: name, plan, usage stats; owner and members via workspace_members';

-- =====================================================
-- TABLE: workspace_members
-- Purpose: Team members: user, role, permissions per workspace
-- =====================================================
CREATE TABLE IF NOT EXISTS workspace_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  permissions JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(workspace_id, user_id)
);

CREATE INDEX IF NOT EXISTS workspace_members_workspace_id_idx ON workspace_members(workspace_id);
CREATE INDEX IF NOT EXISTS workspace_members_user_id_idx ON workspace_members(user_id);

ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workspace_members_select_member"
  ON workspace_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members wm2
      WHERE wm2.workspace_id = workspace_members.workspace_id AND wm2.user_id = auth.uid()
    )
    OR EXISTS (SELECT 1 FROM workspaces w WHERE w.id = workspace_members.workspace_id AND w.owner_id = auth.uid())
  );

CREATE POLICY "workspace_members_insert_admin"
  ON workspace_members FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM workspaces w
      WHERE w.id = workspace_members.workspace_id AND w.owner_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM workspace_members wm
      WHERE wm.workspace_id = workspace_members.workspace_id AND wm.user_id = auth.uid() AND wm.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "workspace_members_update_admin"
  ON workspace_members FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM workspaces w
      WHERE w.id = workspace_members.workspace_id AND w.owner_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM workspace_members wm
      WHERE wm.workspace_id = workspace_members.workspace_id AND wm.user_id = auth.uid() AND wm.role IN ('owner', 'admin')
    )
  )
  WITH CHECK (true);

CREATE POLICY "workspace_members_delete_self_or_admin"
  ON workspace_members FOR DELETE
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM workspaces w
      WHERE w.id = workspace_members.workspace_id AND w.owner_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM workspace_members wm
      WHERE wm.workspace_id = workspace_members.workspace_id AND wm.user_id = auth.uid() AND wm.role IN ('owner', 'admin')
    )
  );

COMMENT ON TABLE workspace_members IS 'Team members per workspace: role and permissions';

-- =====================================================
-- TABLE: workspace_invitations
-- Purpose: Pending invites by email; backend/edge function resolves to user and adds to workspace_members
-- =====================================================
CREATE TABLE IF NOT EXISTS workspace_invitations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member', 'viewer')),
  invited_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(workspace_id, email)
);

CREATE INDEX IF NOT EXISTS workspace_invitations_workspace_id_idx ON workspace_invitations(workspace_id);
CREATE INDEX IF NOT EXISTS workspace_invitations_email_idx ON workspace_invitations(email);

ALTER TABLE workspace_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workspace_invitations_select_admin"
  ON workspace_invitations FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM workspaces w WHERE w.id = workspace_invitations.workspace_id AND w.owner_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM workspace_members wm
      WHERE wm.workspace_id = workspace_invitations.workspace_id AND wm.user_id = auth.uid() AND wm.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "workspace_invitations_insert_admin"
  ON workspace_invitations FOR INSERT
  WITH CHECK (
    invited_by_user_id = auth.uid()
    AND (
      EXISTS (SELECT 1 FROM workspaces w WHERE w.id = workspace_invitations.workspace_id AND w.owner_id = auth.uid())
      OR EXISTS (
        SELECT 1 FROM workspace_members wm
        WHERE wm.workspace_id = workspace_invitations.workspace_id AND wm.user_id = auth.uid() AND wm.role IN ('owner', 'admin')
      )
    )
  );

CREATE POLICY "workspace_invitations_delete_admin"
  ON workspace_invitations FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM workspaces w WHERE w.id = workspace_invitations.workspace_id AND w.owner_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM workspace_members wm
      WHERE wm.workspace_id = workspace_invitations.workspace_id AND wm.user_id = auth.uid() AND wm.role IN ('owner', 'admin')
    )
  );

COMMENT ON TABLE workspace_invitations IS 'Pending workspace invites by email; backend resolves to user and adds to workspace_members';

-- Allow workspace admins to update workspace (policy references workspace_members, so must run after that table exists)
DROP POLICY IF EXISTS "workspaces_update_owner" ON workspaces;
CREATE POLICY "workspaces_update_owner_or_admin"
  ON workspaces FOR UPDATE
  USING (
    owner_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM workspace_members wm
      WHERE wm.workspace_id = workspaces.id AND wm.user_id = auth.uid() AND wm.role IN ('owner', 'admin')
    )
  )
  WITH CHECK (true);

-- =====================================================
-- TABLE: workspace_billing
-- Purpose: Billing and subscription per workspace
-- =====================================================
CREATE TABLE IF NOT EXISTS workspace_billing (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL UNIQUE,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'teams')),
  stripe_customer_id TEXT,
  payment_method_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS workspace_billing_workspace_id_idx ON workspace_billing(workspace_id);

DROP TRIGGER IF EXISTS update_workspace_billing_updated_at ON workspace_billing;
CREATE TRIGGER update_workspace_billing_updated_at
  BEFORE UPDATE ON workspace_billing
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE workspace_billing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workspace_billing_select_member"
  ON workspace_billing FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM workspaces w WHERE w.id = workspace_billing.workspace_id AND w.owner_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM workspace_members wm
      WHERE wm.workspace_id = workspace_billing.workspace_id AND wm.user_id = auth.uid()
    )
  );

CREATE POLICY "workspace_billing_insert_owner"
  ON workspace_billing FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM workspaces w WHERE w.id = workspace_billing.workspace_id AND w.owner_id = auth.uid())
  );

CREATE POLICY "workspace_billing_update_owner_admin"
  ON workspace_billing FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM workspaces w WHERE w.id = workspace_billing.workspace_id AND w.owner_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM workspace_members wm
      WHERE wm.workspace_id = workspace_billing.workspace_id AND wm.user_id = auth.uid() AND wm.role IN ('owner', 'admin')
    )
  )
  WITH CHECK (true);

COMMENT ON TABLE workspace_billing IS 'Billing and subscription per workspace; Stripe integration';

-- =====================================================
-- TABLE: workspace_security_policies
-- Purpose: Default action levels, allowed auto-run types, connectors whitelist
-- =====================================================
CREATE TABLE IF NOT EXISTS workspace_security_policies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL UNIQUE,
  default_action_level TEXT NOT NULL DEFAULT 'requires_approval'
    CHECK (default_action_level IN ('draft_only', 'requires_approval', 'always_allow')),
  allowed_auto_run_types JSONB DEFAULT '["manual", "schedule"]'::jsonb,
  connectors_whitelist JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS workspace_security_policies_workspace_id_idx ON workspace_security_policies(workspace_id);

DROP TRIGGER IF EXISTS update_workspace_security_policies_updated_at ON workspace_security_policies;
CREATE TRIGGER update_workspace_security_policies_updated_at
  BEFORE UPDATE ON workspace_security_policies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE workspace_security_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workspace_security_policies_select_member"
  ON workspace_security_policies FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM workspaces w WHERE w.id = workspace_security_policies.workspace_id AND w.owner_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM workspace_members wm
      WHERE wm.workspace_id = workspace_security_policies.workspace_id AND wm.user_id = auth.uid()
    )
  );

CREATE POLICY "workspace_security_policies_insert_owner"
  ON workspace_security_policies FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM workspaces w WHERE w.id = workspace_security_policies.workspace_id AND w.owner_id = auth.uid())
  );

CREATE POLICY "workspace_security_policies_update_owner_admin"
  ON workspace_security_policies FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM workspaces w WHERE w.id = workspace_security_policies.workspace_id AND w.owner_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM workspace_members wm
      WHERE wm.workspace_id = workspace_security_policies.workspace_id AND wm.user_id = auth.uid() AND wm.role IN ('owner', 'admin')
    )
  )
  WITH CHECK (true);

COMMENT ON TABLE workspace_security_policies IS 'Security policies: default approval level, allowed auto-run types, connectors whitelist';

-- =====================================================
-- TABLE: workspace_audit_logs
-- Purpose: Immutable audit log per workspace for compliance
-- =====================================================
CREATE TABLE IF NOT EXISTS workspace_audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL,
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS workspace_audit_logs_workspace_id_idx ON workspace_audit_logs(workspace_id);
CREATE INDEX IF NOT EXISTS workspace_audit_logs_created_at_idx ON workspace_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS workspace_audit_logs_action_idx ON workspace_audit_logs(action);

ALTER TABLE workspace_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workspace_audit_logs_select_member"
  ON workspace_audit_logs FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM workspaces w WHERE w.id = workspace_audit_logs.workspace_id AND w.owner_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM workspace_members wm
      WHERE wm.workspace_id = workspace_audit_logs.workspace_id AND wm.user_id = auth.uid()
    )
  );

CREATE POLICY "workspace_audit_logs_insert_member"
  ON workspace_audit_logs FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM workspaces w WHERE w.id = workspace_audit_logs.workspace_id AND w.owner_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM workspace_members wm
      WHERE wm.workspace_id = workspace_audit_logs.workspace_id AND wm.user_id = auth.uid()
    )
  );

-- No UPDATE or DELETE: audit logs are immutable

COMMENT ON TABLE workspace_audit_logs IS 'Immutable audit log for workspace actions; compliance and transparency';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute in order:
-- DROP TABLE IF EXISTS workspace_audit_logs CASCADE;
-- DROP TABLE IF EXISTS workspace_security_policies CASCADE;
-- DROP TABLE IF EXISTS workspace_billing CASCADE;
-- DROP TABLE IF EXISTS workspace_invitations CASCADE;
-- DROP TABLE IF EXISTS workspace_members CASCADE;
-- DROP TABLE IF EXISTS workspaces CASCADE;
