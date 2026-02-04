/**
 * Retention policies data layer.
 * Uses Supabase when configured; retention job scheduler runs server-side.
 */

import { supabase } from '@/lib/supabase'
import type {
  RetentionPolicy,
  RetentionPolicyInsert,
  RetentionPolicyUpdate,
} from '@/types/export'

async function getAuthUserId(): Promise<string | null> {
  if (!supabase) return null
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  return user.id
}

/** List retention policies for the current user */
export async function listRetentionPolicies(): Promise<RetentionPolicy[]> {
  if (!supabase) return []
  const userId = await getAuthUserId()
  if (!userId) return []
  const { data, error } = await supabase
    .from('retention_policies')
    .select('*')
    .eq('created_by', userId)
    .order('created_at', { ascending: false })
  if (error) return []
  return (data ?? []) as RetentionPolicy[]
}

/** Get a single retention policy by id */
export async function getRetentionPolicy(id: string): Promise<RetentionPolicy | null> {
  if (!supabase) return null
  const userId = await getAuthUserId()
  if (!userId) return null
  const { data, error } = await supabase
    .from('retention_policies')
    .select('*')
    .eq('id', id)
    .eq('created_by', userId)
    .single()
  if (error || !data) return null
  return data as RetentionPolicy
}

/** Create a retention policy */
export async function createRetentionPolicy(
  payload: Omit<RetentionPolicyInsert, 'created_by'>
): Promise<RetentionPolicy | null> {
  if (!supabase) return null
  const userId = await getAuthUserId()
  if (!userId) return null
  const insert: RetentionPolicyInsert = { ...payload, created_by: userId }
  const { data, error } = await supabase
    .from('retention_policies')
    .insert(insert)
    .select()
    .single()
  if (error) return null
  return data as RetentionPolicy
}

/** Update a retention policy */
export async function updateRetentionPolicy(
  id: string,
  updates: RetentionPolicyUpdate
): Promise<RetentionPolicy | null> {
  if (!supabase) return null
  const userId = await getAuthUserId()
  if (!userId) return null
  const { data, error } = await supabase
    .from('retention_policies')
    .update(updates)
    .eq('id', id)
    .eq('created_by', userId)
    .select()
    .single()
  if (error) return null
  return data as RetentionPolicy
}

/** Delete a retention policy */
export async function deleteRetentionPolicy(id: string): Promise<boolean> {
  if (!supabase) return false
  const userId = await getAuthUserId()
  if (!userId) return false
  const { error } = await supabase
    .from('retention_policies')
    .delete()
    .eq('id', id)
    .eq('created_by', userId)
  return !error
}
