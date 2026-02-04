/**
 * Workspace settings data layer.
 * Uses Supabase when configured; otherwise returns fallback data for development.
 */

import { supabase } from '@/lib/supabase'
import type {
  Workspace,
  WorkspaceUpdate,
  WorkspaceMember,
  WorkspaceMemberUpdate,
  WorkspaceBilling,
  WorkspaceBillingUpdate,
  WorkspaceSecurityPolicy,
  WorkspaceSecurityPolicyUpdate,
  WorkspaceAuditLog,
} from '@/types/workspace'

const DEFAULT_USAGE_STATS = {
  skills_used: 0,
  runs_this_month: 0,
  skills_limit: 10,
  runs_limit: 50,
}

async function getAuthUserId(): Promise<string | null> {
  if (!supabase) return null
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  return user.id
}

/** Get current user's primary workspace (first by ownership or membership) */
export async function getCurrentWorkspace(): Promise<Workspace | null> {
  const userId = await getAuthUserId()
  if (!userId || !supabase) return getMockWorkspace(userId)

  const { data: owned } = await supabase
    .from('workspaces')
    .select('*')
    .eq('owner_id', userId)
    .limit(1)
    .maybeSingle()

  if (owned) return owned as Workspace

  const { data: memberRow } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle()

  if (!memberRow) return getMockWorkspace(userId)

  const { data: ws } = await supabase
    .from('workspaces')
    .select('*')
    .eq('id', memberRow.workspace_id)
    .single()

  return (ws as Workspace) ?? getMockWorkspace(userId)
}

function getMockWorkspace(ownerId: string | null): Workspace {
  return {
    id: 'mock-workspace-id',
    owner_id: ownerId ?? 'mock-user-id',
    name: 'My Workspace',
    plan: 'pro',
    usage_stats: { ...DEFAULT_USAGE_STATS, skills_used: 2, runs_this_month: 5 },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}

/** Update workspace */
export async function updateWorkspace(
  workspaceId: string,
  updates: WorkspaceUpdate
): Promise<Workspace | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('workspaces')
    .update(updates)
    .eq('id', workspaceId)
    .select()
    .single()
  if (error) return null
  return data as Workspace
}

/** Get workspace members (with profile email/name when available) */
export async function getWorkspaceMembers(workspaceId: string): Promise<WorkspaceMember[]> {
  if (!supabase) return getMockWorkspaceMembers(workspaceId)

  const { data: members, error } = await supabase
    .from('workspace_members')
    .select('id, workspace_id, user_id, role, permissions, created_at')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: true })

  if (error || !members?.length) return (members ?? []) as WorkspaceMember[]

  const userIds = [...new Set((members as { user_id: string }[]).map((m) => m.user_id))]
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name')
    .in('id', userIds)

  const profileMap = new Map(
    (profiles ?? []).map((p) => [p.id, { full_name: (p as { full_name?: string }).full_name }])
  )
  const { data: { user } } = await supabase.auth.getUser()
  const emailMap = new Map<string, string>()
  if (user && userIds.includes(user.id)) emailMap.set(user.id, user.email ?? '')

  return (members as WorkspaceMember[]).map((m) => ({
    ...m,
    email: emailMap.get(m.user_id) ?? undefined,
    full_name: profileMap.get(m.user_id)?.full_name ?? undefined,
  }))
}

function getMockWorkspaceMembers(workspaceId: string): WorkspaceMember[] {
  return [
    {
      id: 'mock-member-1',
      workspace_id: workspaceId,
      user_id: 'mock-user-id',
      role: 'owner',
      permissions: {},
      created_at: new Date().toISOString(),
      email: 'you@example.com',
      full_name: 'You',
    },
  ]
}

/** Invite member by email (creates pending invite in workspace_invitations; backend/edge resolves and adds to workspace_members) */
export async function inviteWorkspaceMember(
  workspaceId: string,
  payload: { email: string; role: 'admin' | 'member' | 'viewer' }
): Promise<{ id: string } | null> {
  const userId = await getAuthUserId()
  if (!userId) return null
  if (!supabase) return { id: 'mock-invite-id' }

  const { data, error } = await supabase
    .from('workspace_invitations')
    .insert({
      workspace_id: workspaceId,
      email: payload.email.trim().toLowerCase(),
      role: payload.role,
      invited_by_user_id: userId,
    })
    .select('id')
    .single()
  if (error) return null
  return data as { id: string }
}

/** Update member role */
export async function updateWorkspaceMemberRole(
  workspaceId: string,
  memberId: string,
  updates: WorkspaceMemberUpdate
): Promise<WorkspaceMember | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('workspace_members')
    .update(updates)
    .eq('id', memberId)
    .eq('workspace_id', workspaceId)
    .select()
    .single()
  if (error) return null
  return data as WorkspaceMember
}

/** Remove member from workspace */
export async function removeWorkspaceMember(
  workspaceId: string,
  memberId: string
): Promise<boolean> {
  if (!supabase) return false
  const { error } = await supabase
    .from('workspace_members')
    .delete()
    .eq('id', memberId)
    .eq('workspace_id', workspaceId)
  return !error
}

/** Get workspace billing */
export async function getWorkspaceBilling(workspaceId: string): Promise<WorkspaceBilling | null> {
  if (!supabase) return getMockWorkspaceBilling(workspaceId)

  const { data, error } = await supabase
    .from('workspace_billing')
    .select('*')
    .eq('workspace_id', workspaceId)
    .maybeSingle()
  if (error || !data) return getMockWorkspaceBilling(workspaceId)
  return data as WorkspaceBilling
}

function getMockWorkspaceBilling(workspaceId: string): WorkspaceBilling {
  return {
    id: 'mock-billing-id',
    workspace_id: workspaceId,
    plan: 'pro',
    stripe_customer_id: null,
    payment_method_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}

/** Update workspace billing (plan, payment method) */
export async function updateWorkspaceBilling(
  workspaceId: string,
  updates: WorkspaceBillingUpdate
): Promise<WorkspaceBilling | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('workspace_billing')
    .upsert({ workspace_id: workspaceId, ...updates }, { onConflict: 'workspace_id' })
    .select()
    .single()
  if (error) return null
  return data as WorkspaceBilling
}

/** Get workspace security policy */
export async function getWorkspaceSecurityPolicy(
  workspaceId: string
): Promise<WorkspaceSecurityPolicy | null> {
  if (!supabase) return getMockWorkspaceSecurityPolicy(workspaceId)

  const { data, error } = await supabase
    .from('workspace_security_policies')
    .select('*')
    .eq('workspace_id', workspaceId)
    .maybeSingle()
  if (error || !data) return getMockWorkspaceSecurityPolicy(workspaceId)
  return data as WorkspaceSecurityPolicy
}

function getMockWorkspaceSecurityPolicy(workspaceId: string): WorkspaceSecurityPolicy {
  return {
    id: 'mock-policy-id',
    workspace_id: workspaceId,
    default_action_level: 'requires_approval',
    allowed_auto_run_types: ['manual', 'schedule'],
    connectors_whitelist: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}

/** Update workspace security policy */
export async function updateWorkspaceSecurityPolicy(
  workspaceId: string,
  updates: WorkspaceSecurityPolicyUpdate
): Promise<WorkspaceSecurityPolicy | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('workspace_security_policies')
    .upsert({ workspace_id: workspaceId, ...updates }, { onConflict: 'workspace_id' })
    .select()
    .single()
  if (error) return null
  return data as WorkspaceSecurityPolicy
}

/** Get workspace audit logs (paginated) */
export async function getWorkspaceAuditLogs(
  workspaceId: string,
  options?: { limit?: number; offset?: number }
): Promise<WorkspaceAuditLog[]> {
  if (!supabase) return getMockWorkspaceAuditLogs(workspaceId)

  const limit = options?.limit ?? 50
  const offset = options?.offset ?? 0

  const { data, error } = await supabase
    .from('workspace_audit_logs')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)
  if (error) return []
  return (data ?? []) as WorkspaceAuditLog[]
}

function getMockWorkspaceAuditLogs(workspaceId: string): WorkspaceAuditLog[] {
  return [
    {
      id: 'mock-log-1',
      workspace_id: workspaceId,
      action: 'workspace.updated',
      actor_id: 'mock-user-id',
      metadata: { field: 'name' },
      created_at: new Date().toISOString(),
    },
  ]
}
