/**
 * Approvals & Trust Controls: audit logs, rules, and decision submission.
 * Uses Supabase when configured.
 */

import { supabase } from '@/lib/supabase'
import type {
  ApprovalAuditLog,
  ApprovalAuditLogInsert,
  ApprovalRule,
  ApprovalRuleInsert,
  ApprovalRuleUpdate,
  ApprovalDecisionPayload,
} from '@/types/approval'
import type { RunApproval, RunApprovalUpdate } from '@/types/run'

async function getAuthUserId(): Promise<string | null> {
  if (!supabase) return null
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) return null
  return user.id
}

/** List audit logs for an approval (run_approvals.id) */
export async function listApprovalAuditLogs(
  approvalId: string
): Promise<ApprovalAuditLog[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('approval_audit_logs')
    .select('*')
    .eq('approval_id', approvalId)
    .order('created_at', { ascending: false })
  if (error) return []
  return (data ?? []) as ApprovalAuditLog[]
}

/** Insert an audit log entry */
export async function createApprovalAuditLog(
  payload: ApprovalAuditLogInsert
): Promise<ApprovalAuditLog | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('approval_audit_logs')
    .insert(payload)
    .select()
    .single()
  if (error) return null
  return data as ApprovalAuditLog
}

/** List approval rules for the current user */
export async function listApprovalRules(): Promise<ApprovalRule[]> {
  if (!supabase) return []
  const userId = await getAuthUserId()
  if (!userId) return []
  const { data, error } = await supabase
    .from('approval_rules')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) return []
  return (data ?? []) as ApprovalRule[]
}

/** Create an approval rule */
export async function createApprovalRule(
  payload: ApprovalRuleInsert
): Promise<ApprovalRule | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('approval_rules')
    .insert(payload)
    .select()
    .single()
  if (error) return null
  return data as ApprovalRule
}

/** Update an approval rule */
export async function updateApprovalRule(
  ruleId: string,
  updates: ApprovalRuleUpdate
): Promise<ApprovalRule | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('approval_rules')
    .update(updates)
    .eq('id', ruleId)
    .select()
    .single()
  if (error) return null
  return data as ApprovalRule
}

/** Delete an approval rule */
export async function deleteApprovalRule(
  ruleId: string
): Promise<boolean> {
  if (!supabase) return false
  const { error } = await supabase
    .from('approval_rules')
    .delete()
    .eq('id', ruleId)
  return !error
}

/** Submit approval decision: update run_approval, insert audit log, optionally create rule */
export async function submitApprovalDecision(
  approvalId: string,
  payload: ApprovalDecisionPayload
): Promise<{ approval: RunApproval | null; rule?: ApprovalRule | null; error?: string }> {
  if (!supabase) return { approval: null, error: 'Supabase not configured' }
  const userId = await getAuthUserId()
  if (!userId) return { approval: null, error: 'Not authenticated' }

  const decision = payload.decision
  const updates: RunApprovalUpdate = {
    decision,
    actor: userId,
    ...(payload.payload && Object.keys(payload.payload).length > 0
      ? { payload: payload.payload }
      : {}),
    ...(payload.comments
      ? { rollback_options: { note: payload.comments } }
      : {}),
  }

  const { data: approval, error: updateError } = await supabase
    .from('run_approvals')
    .update(updates)
    .eq('id', approvalId)
    .select()
    .single()

  if (updateError) return { approval: null, error: updateError.message }
  const approvalRow = approval as RunApproval

  await createApprovalAuditLog({
    approval_id: approvalId,
    user_id: userId,
    decision,
    comments: payload.comments ?? null,
  })

  let rule: ApprovalRule | null = null
  if (
    decision === 'approved' &&
    payload.create_rule &&
    payload.rule_name &&
    payload.rule_criteria
  ) {
    rule = await createApprovalRule({
      user_id: userId,
      name: payload.rule_name,
      criteria: payload.rule_criteria,
      action_type: approvalRow.requested_action,
      created_by: userId,
    })
  }

  return { approval: approvalRow, rule: rule ?? undefined }
}

/** Undo an approved action: set decision back to pending, clear actor, insert audit log */
export async function undoApproval(
  approvalId: string,
  comments?: string
): Promise<{ approval: RunApproval | null; error?: string }> {
  if (!supabase) return { approval: null, error: 'Supabase not configured' }
  const userId = await getAuthUserId()
  if (!userId) return { approval: null, error: 'Not authenticated' }

  const { data: approval, error: updateError } = await supabase
    .from('run_approvals')
    .update({
      decision: 'pending',
      actor: null,
      rollback_options: comments ? { note: comments } : {},
    })
    .eq('id', approvalId)
    .select()
    .single()

  if (updateError) return { approval: null, error: updateError.message }

  await createApprovalAuditLog({
    approval_id: approvalId,
    user_id: userId,
    decision: 'undo',
    comments: comments ?? null,
  })

  return { approval: approval as RunApproval }
}
