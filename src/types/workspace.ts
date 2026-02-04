/**
 * Workspace settings types.
 * Aligns with supabase/migrations/20250204270000_workspace_settings.sql
 */

export type WorkspacePlan = 'free' | 'pro' | 'teams'

export interface WorkspaceUsageStats {
  skills_used?: number
  runs_this_month?: number
  skills_limit?: number
  runs_limit?: number
}

export interface Workspace {
  id: string
  owner_id: string
  name: string
  plan: WorkspacePlan
  usage_stats: WorkspaceUsageStats
  created_at: string
  updated_at: string
}

export interface WorkspaceUpdate {
  name?: string
  plan?: WorkspacePlan
  usage_stats?: WorkspaceUsageStats
}

export type WorkspaceMemberRole = 'owner' | 'admin' | 'member' | 'viewer'

export interface WorkspaceMember {
  id: string
  workspace_id: string
  user_id: string
  role: WorkspaceMemberRole
  permissions: Record<string, unknown>
  created_at: string
  email?: string
  full_name?: string
}

export interface WorkspaceMemberInsert {
  workspace_id: string
  user_id: string
  role: WorkspaceMemberRole
  permissions?: Record<string, unknown>
}

export interface WorkspaceMemberUpdate {
  role?: WorkspaceMemberRole
  permissions?: Record<string, unknown>
}

export interface WorkspaceBilling {
  id: string
  workspace_id: string
  plan: WorkspacePlan
  stripe_customer_id: string | null
  payment_method_id: string | null
  created_at: string
  updated_at: string
}

export interface WorkspaceBillingUpdate {
  plan?: WorkspacePlan
  payment_method_id?: string | null
}

export type DefaultActionLevel = 'draft_only' | 'requires_approval' | 'always_allow'

export interface WorkspaceSecurityPolicy {
  id: string
  workspace_id: string
  default_action_level: DefaultActionLevel
  allowed_auto_run_types: string[]
  connectors_whitelist: string[]
  created_at: string
  updated_at: string
}

export interface WorkspaceSecurityPolicyUpdate {
  default_action_level?: DefaultActionLevel
  allowed_auto_run_types?: string[]
  connectors_whitelist?: string[]
}

export interface WorkspaceAuditLog {
  id: string
  workspace_id: string
  action: string
  actor_id: string | null
  metadata: Record<string, unknown>
  created_at: string
}

export interface WorkspaceInvitation {
  id: string
  workspace_id: string
  email: string
  role: 'admin' | 'member' | 'viewer'
  invited_by_user_id: string
  created_at: string
}

export type WorkspaceMemberRow = WorkspaceMember
export type WorkspaceBillingRow = WorkspaceBilling
export type WorkspaceSecurityPolicyRow = WorkspaceSecurityPolicy
export type WorkspaceAuditLogRow = WorkspaceAuditLog
