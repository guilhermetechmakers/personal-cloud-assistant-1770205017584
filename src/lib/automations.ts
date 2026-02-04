/**
 * Automations and automation runs data layer.
 * Uses Supabase when configured; otherwise returns empty/mock data for development.
 */

import { supabase } from '@/lib/supabase'
import type {
  Automation,
  AutomationInsert,
  AutomationUpdate,
  AutomationRun,
  AutomationRunInsert,
} from '@/types/automation'

async function getAuthUserId(): Promise<string | null> {
  if (!supabase) return null
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  return user.id
}

/** List automations for the current user */
export async function listAutomations(): Promise<Automation[]> {
  if (!supabase) return []
  const userId = await getAuthUserId()
  if (!userId) return []
  const { data, error } = await supabase
    .from('automations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) return []
  return (data ?? []) as Automation[]
}

/** Get a single automation by id */
export async function getAutomation(id: string): Promise<Automation | null> {
  if (!supabase) return null
  const userId = await getAuthUserId()
  if (!userId) return null
  const { data, error } = await supabase
    .from('automations')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single()
  if (error || !data) return null
  return data as Automation
}

/** Create an automation */
export async function createAutomation(
  payload: Omit<AutomationInsert, 'user_id'>
): Promise<Automation | null> {
  if (!supabase) return null
  const userId = await getAuthUserId()
  if (!userId) return null
  const insert: AutomationInsert = { ...payload, user_id: userId }
  const { data, error } = await supabase
    .from('automations')
    .insert(insert)
    .select()
    .single()
  if (error) return null
  return data as Automation
}

/** Update an automation */
export async function updateAutomation(
  id: string,
  updates: AutomationUpdate
): Promise<Automation | null> {
  if (!supabase) return null
  const userId = await getAuthUserId()
  if (!userId) return null
  const { data, error } = await supabase
    .from('automations')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()
  if (error) return null
  return data as Automation
}

/** Delete an automation */
export async function deleteAutomation(id: string): Promise<boolean> {
  if (!supabase) return false
  const userId = await getAuthUserId()
  if (!userId) return false
  const { error } = await supabase
    .from('automations')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
  return !error
}

/** Toggle automation enabled status */
export async function setAutomationEnabled(
  id: string,
  enabled: boolean
): Promise<Automation | null> {
  return updateAutomation(id, { enabled })
}

/** List runs for an automation (for audit / last run) */
export async function listAutomationRuns(
  automationId: string,
  limit = 10
): Promise<AutomationRun[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('automation_runs')
    .select('*')
    .eq('automation_id', automationId)
    .order('run_time', { ascending: false })
    .limit(limit)
  if (error) return []
  return (data ?? []) as AutomationRun[]
}

/** Get last run for an automation */
export async function getLastRunForAutomation(
  automationId: string
): Promise<AutomationRun | null> {
  const runs = await listAutomationRuns(automationId, 1)
  return runs[0] ?? null
}

/** Insert a run (typically called by backend/scheduler; exposed for completeness) */
export async function createAutomationRun(
  payload: AutomationRunInsert
): Promise<AutomationRun | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('automation_runs')
    .insert(payload)
    .select()
    .single()
  if (error) return null
  return data as AutomationRun
}
