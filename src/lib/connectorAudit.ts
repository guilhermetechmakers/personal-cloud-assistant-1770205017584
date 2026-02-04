/**
 * Connector audit log data layer.
 * Append-only log for connector actions (connect, disconnect, refresh, error).
 */

import { supabase } from '@/lib/supabase'
import type { ConnectorAuditLog, ConnectorAuditLogInsert } from '@/types/connector'

async function getAuthUserId(): Promise<string | null> {
  if (!supabase) return null
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  return user.id
}

function mapRow(row: Record<string, unknown>): ConnectorAuditLog {
  return {
    id: row.id as string,
    user_id: row.user_id as string,
    connector_id: row.connector_id as string,
    action: row.action as string,
    details: (row.details as Record<string, unknown>) ?? {},
    created_at: row.created_at as string,
  }
}

/** List audit log entries for a connector */
export async function listConnectorAuditLogs(
  connectorId: string,
  limit = 50
): Promise<ConnectorAuditLog[]> {
  if (!supabase) return []
  const userId = await getAuthUserId()
  if (!userId) return []
  const { data, error } = await supabase
    .from('connector_audit_logs')
    .select('*')
    .eq('connector_id', connectorId)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) return []
  return (data ?? []).map(mapRow)
}

/** Append an audit log entry (e.g. on connect, disconnect, refresh failure) */
export async function createConnectorAuditLog(
  payload: Omit<ConnectorAuditLogInsert, 'user_id'>
): Promise<ConnectorAuditLog | null> {
  if (!supabase) return null
  const userId = await getAuthUserId()
  if (!userId) return null
  const insert: ConnectorAuditLogInsert = { ...payload, user_id: userId }
  const { data, error } = await supabase
    .from('connector_audit_logs')
    .insert(insert)
    .select()
    .single()
  if (error) return null
  return data ? mapRow(data) : null
}
