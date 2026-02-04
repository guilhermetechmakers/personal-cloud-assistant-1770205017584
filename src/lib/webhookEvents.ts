/**
 * Webhook events data layer.
 * Inbound events from connected services (Gmail push, Slack events, etc.).
 */

import { supabase } from '@/lib/supabase'
import type { WebhookEvent } from '@/types/connector'

async function getAuthUserId(): Promise<string | null> {
  if (!supabase) return null
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  return user.id
}

function mapRow(row: Record<string, unknown>): WebhookEvent {
  return {
    id: row.id as string,
    connector_id: row.connector_id as string,
    event_type: row.event_type as string,
    payload: (row.payload as Record<string, unknown>) ?? {},
    received_at: row.received_at as string,
  }
}

/** List webhook events for a connector */
export async function listWebhookEvents(
  connectorId: string,
  limit = 50
): Promise<WebhookEvent[]> {
  if (!supabase) return []
  const userId = await getAuthUserId()
  if (!userId) return []
  const { data: connector } = await supabase
    .from('connectors')
    .select('id')
    .eq('id', connectorId)
    .eq('user_id', userId)
    .single()
  if (!connector) return []
  const { data, error } = await supabase
    .from('webhook_events')
    .select('*')
    .eq('connector_id', connectorId)
    .order('received_at', { ascending: false })
    .limit(limit)
  if (error) return []
  return (data ?? []).map(mapRow)
}
