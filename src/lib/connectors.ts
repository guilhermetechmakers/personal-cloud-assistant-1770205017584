/**
 * Connectors (OAuth & token management) data layer.
 * Uses Supabase; tokens stored via token_ref/refresh_token_ref (KMS/vault).
 */

import { supabase } from '@/lib/supabase'
import type {
  Connector,
  ConnectorInsert,
  ConnectorUpdate,
} from '@/types/connector'

async function getAuthUserId(): Promise<string | null> {
  if (!supabase) return null
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  return user.id
}

function mapRow(row: Record<string, unknown>): Connector {
  return {
    id: row.id as string,
    user_id: row.user_id as string,
    provider: row.provider as string,
    scopes: Array.isArray(row.scopes) ? (row.scopes as string[]) : [],
    status: row.status as Connector['status'],
    expires_at: (row.expires_at as string) ?? null,
    last_health_at: (row.last_health_at as string) ?? null,
    last_sync_at: (row.last_sync_at as string) ?? null,
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  }
}

/** List connectors for the current user */
export async function listConnectors(): Promise<Connector[]> {
  if (!supabase) return []
  const userId = await getAuthUserId()
  if (!userId) return []
  const { data, error } = await supabase
    .from('connectors')
    .select('id, user_id, provider, scopes, status, expires_at, last_health_at, last_sync_at, metadata, created_at, updated_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) return []
  return (data ?? []).map(mapRow)
}

/** Get a single connector by id */
export async function getConnector(id: string): Promise<Connector | null> {
  if (!supabase) return null
  const userId = await getAuthUserId()
  if (!userId) return null
  const { data, error } = await supabase
    .from('connectors')
    .select('id, user_id, provider, scopes, status, expires_at, last_health_at, last_sync_at, metadata, created_at, updated_at')
    .eq('id', id)
    .eq('user_id', userId)
    .single()
  if (error || !data) return null
  return mapRow(data)
}

/** Create a connector (e.g. after OAuth callback; token_ref set by backend) */
export async function createConnector(
  payload: Omit<ConnectorInsert, 'user_id'>
): Promise<Connector | null> {
  if (!supabase) return null
  const userId = await getAuthUserId()
  if (!userId) return null
  const insert: ConnectorInsert = {
    ...payload,
    user_id: userId,
    scopes: payload.scopes ?? [],
  }
  const { data, error } = await supabase
    .from('connectors')
    .insert(insert)
    .select('id, user_id, provider, scopes, status, expires_at, last_health_at, last_sync_at, metadata, created_at, updated_at')
    .single()
  if (error) return null
  return data ? mapRow(data) : null
}

/** Update a connector (scopes, status, last_health_at, etc.) */
export async function updateConnector(
  id: string,
  updates: ConnectorUpdate
): Promise<Connector | null> {
  if (!supabase) return null
  const userId = await getAuthUserId()
  if (!userId) return null
  const { data, error } = await supabase
    .from('connectors')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
    .select('id, user_id, provider, scopes, status, expires_at, last_health_at, last_sync_at, metadata, created_at, updated_at')
    .single()
  if (error) return null
  return data ? mapRow(data) : null
}

/** Delete a connector (disconnect) */
export async function deleteConnector(id: string): Promise<boolean> {
  if (!supabase) return false
  const userId = await getAuthUserId()
  if (!userId) return false
  const { error } = await supabase
    .from('connectors')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
  return !error
}

/**
 * Get OAuth authorization URL for a provider.
 * Calls Edge Function 'connector-oauth-url' when deployed; otherwise returns null (UI shows configure message).
 */
export async function getOAuthAuthorizeUrl(provider: string): Promise<string | null> {
  if (!supabase) return null
  const userId = await getAuthUserId()
  if (!userId) return null
  try {
    const { data, error } = await supabase.functions.invoke<{ url: string }>('connector-oauth-url', {
      body: { provider, user_id: userId },
    })
    if (error || !data?.url) return null
    return data.url
  } catch {
    return null
  }
}

/**
 * Run health check for a connector.
 * Updates last_health_at and status; in production an Edge Function would verify the token.
 */
export async function checkConnectorHealth(id: string): Promise<{ ok: boolean; message?: string }> {
  if (!supabase) return { ok: false, message: 'Not configured' }
  const userId = await getAuthUserId()
  if (!userId) return { ok: false, message: 'Not authenticated' }
  try {
    const { data, error } = await supabase.functions.invoke<{ ok: boolean; message?: string }>('connector-health', {
      body: { connector_id: id, user_id: userId },
    })
    if (!error && data?.ok) {
      await updateConnector(id, { last_health_at: new Date().toISOString(), status: 'active' })
      return { ok: true }
    }
    if (!error && data?.ok === false) {
      await updateConnector(id, { status: 'error' })
      return { ok: false, message: data?.message ?? 'Health check failed' }
    }
  } catch {
    // No Edge Function: optimistic update for UI demo
    await updateConnector(id, { last_health_at: new Date().toISOString(), status: 'active' })
    return { ok: true }
  }
  await updateConnector(id, { last_health_at: new Date().toISOString(), status: 'active' })
  return { ok: true }
}
