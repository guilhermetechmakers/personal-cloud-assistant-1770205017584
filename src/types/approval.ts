/**
 * Types for Approvals & Trust Controls: audit logs and auto-approval rules.
 * Aligns with approval_audit_logs and approval_rules tables.
 */

export type AuditLogDecision = 'approved' | 'rejected' | 'undo'

export interface ApprovalAuditLog {
  id: string
  approval_id: string
  user_id: string | null
  decision: AuditLogDecision
  comments: string | null
  created_at: string
}

export interface ApprovalAuditLogInsert {
  approval_id: string
  user_id?: string | null
  decision: AuditLogDecision
  comments?: string | null
}

export type ApprovalAuditLogRow = ApprovalAuditLog

export interface ApprovalRule {
  id: string
  user_id: string
  name: string
  criteria: Record<string, unknown>
  action_type: string
  created_by: string | null
  created_at: string
}

export interface ApprovalRuleInsert {
  user_id: string
  name: string
  criteria: Record<string, unknown>
  action_type: string
  created_by?: string | null
}

export interface ApprovalRuleUpdate {
  name?: string
  criteria?: Record<string, unknown>
  action_type?: string
}

export type ApprovalRuleRow = ApprovalRule

/** Payload for submitting an approval decision (approve once, reject, or create rule) */
export interface ApprovalDecisionPayload {
  decision: 'approved' | 'rejected'
  payload?: Record<string, unknown>
  comments?: string
  create_rule?: boolean
  rule_name?: string
  rule_criteria?: Record<string, unknown>
}
