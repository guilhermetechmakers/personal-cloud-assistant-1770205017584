/**
 * Types for exports and retention policies.
 * Aligns with Supabase tables exports and retention_policies.
 */

export type ExportDataType = 'runs' | 'reports' | 'audit_logs'
export type ExportFormat = 'csv' | 'pdf' | 'json'
export type ExportStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface Export {
  id: string
  user_id: string
  data_type: ExportDataType
  format: ExportFormat
  date_from: string
  date_to: string
  status: ExportStatus
  download_link: string | null
  created_at: string
  updated_at: string
}

export interface ExportInsert {
  id?: string
  user_id: string
  data_type: ExportDataType
  format: ExportFormat
  date_from: string
  date_to: string
  status?: ExportStatus
  download_link?: string | null
}

export interface ExportUpdate {
  status?: ExportStatus
  download_link?: string | null
}

export type ExportRow = Export

export type RetentionPolicyDataType = 'runs' | 'reports' | 'audit_logs' | 'screenshots'
export type ActionOnExpiry = 'purge' | 'archive'

export interface RetentionPolicy {
  id: string
  created_by: string
  data_type: RetentionPolicyDataType
  retention_period_days: number
  action_on_expiry: ActionOnExpiry
  created_at: string
  updated_at: string
}

export interface RetentionPolicyInsert {
  id?: string
  created_by: string
  data_type: RetentionPolicyDataType
  retention_period_days: number
  action_on_expiry?: ActionOnExpiry
}

export interface RetentionPolicyUpdate {
  data_type?: RetentionPolicyDataType
  retention_period_days?: number
  action_on_expiry?: ActionOnExpiry
}

export type RetentionPolicyRow = RetentionPolicy
