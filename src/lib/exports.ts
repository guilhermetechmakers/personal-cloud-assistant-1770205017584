/**
 * Exports data layer.
 * Uses Supabase when configured; export processing is handled by backend/Edge Function.
 */

import { supabase } from '@/lib/supabase'
import type { Export, ExportInsert } from '@/types/export'

async function getAuthUserId(): Promise<string | null> {
  if (!supabase) return null
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  return user.id
}

/** List exports for the current user */
export async function listExports(): Promise<Export[]> {
  if (!supabase) return []
  const userId = await getAuthUserId()
  if (!userId) return []
  const { data, error } = await supabase
    .from('exports')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) return []
  return (data ?? []) as Export[]
}

/** Get a single export by id */
export async function getExport(id: string): Promise<Export | null> {
  if (!supabase) return null
  const userId = await getAuthUserId()
  if (!userId) return null
  const { data, error } = await supabase
    .from('exports')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single()
  if (error || !data) return null
  return data as Export
}

/** Create an export request (backend/Edge Function will process and update status/download_link) */
export async function createExport(
  payload: Omit<ExportInsert, 'user_id'>
): Promise<Export | null> {
  if (!supabase) return null
  const userId = await getAuthUserId()
  if (!userId) return null
  const insert: ExportInsert = { ...payload, user_id: userId }
  const { data, error } = await supabase
    .from('exports')
    .insert(insert)
    .select()
    .single()
  if (error) return null
  return data as Export
}
