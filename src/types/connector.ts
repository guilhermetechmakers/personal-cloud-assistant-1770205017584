/**
 * Types for connectors, connector audit logs, and webhook events.
 * Aligns with Supabase tables connectors, connector_audit_logs, webhook_events.
 */

export type ConnectorStatus = 'active' | 'disconnected' | 'error' | 'expired'

export interface Connector {
  id: string
  user_id: string
  provider: string
  scopes: string[]
  status: ConnectorStatus
  expires_at: string | null
  last_health_at: string | null
  last_sync_at: string | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface ConnectorInsert {
  id?: string
  user_id: string
  provider: string
  scopes?: string[]
  token_ref?: string | null
  refresh_token_ref?: string | null
  status?: ConnectorStatus
  expires_at?: string | null
  last_health_at?: string | null
  last_sync_at?: string | null
  metadata?: Record<string, unknown>
}

export interface ConnectorUpdate {
  scopes?: string[]
  token_ref?: string | null
  refresh_token_ref?: string | null
  status?: ConnectorStatus
  expires_at?: string | null
  last_health_at?: string | null
  last_sync_at?: string | null
  metadata?: Record<string, unknown>
}

export type ConnectorRow = Connector

/** Connector audit log entry */
export interface ConnectorAuditLog {
  id: string
  user_id: string
  connector_id: string
  action: string
  details: Record<string, unknown>
  created_at: string
}

export interface ConnectorAuditLogInsert {
  id?: string
  user_id: string
  connector_id: string
  action: string
  details?: Record<string, unknown>
}

export type ConnectorAuditLogRow = ConnectorAuditLog

/** Webhook event from a connected service */
export interface WebhookEvent {
  id: string
  connector_id: string
  event_type: string
  payload: Record<string, unknown>
  received_at: string
}

export interface WebhookEventInsert {
  id?: string
  connector_id: string
  event_type: string
  payload?: Record<string, unknown>
  received_at?: string
}

export type WebhookEventRow = WebhookEvent
