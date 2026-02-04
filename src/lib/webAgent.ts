/**
 * Web Agent Runs & Recorder data layer.
 * Uses Supabase when configured; otherwise returns empty/mock data.
 */

import { supabase } from '@/lib/supabase'
import type {
  WebAgentRun,
  WebAgentRunInsert,
  WebAgentRunUpdate,
  WebAgentRunStep,
  WebAgentRunStepInsert,
  WebAgentRunStepUpdate,
  WebAgentStepApproval,
  WebAgentStepApprovalInsert,
  WebAgentStepApprovalUpdate,
  WebAgentProfile,
  WebAgentProfileInsert,
  WebAgentProfileUpdate,
  ScriptAction,
} from '@/types/webAgent'

async function getAuthUserId(): Promise<string | null> {
  if (!supabase) return null
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) return null
  return user.id
}

/** List web agent runs for the current user */
export async function listWebAgentRuns(options?: {
  status?: string
  limit?: number
}): Promise<WebAgentRun[]> {
  if (!supabase) return []
  const userId = await getAuthUserId()
  if (!userId) return []
  let q = supabase
    .from('web_agent_runs')
    .select('*')
    .eq('user_id', userId)
    .order('start_time', { ascending: false })
  if (options?.status) q = q.eq('status', options.status)
  if (options?.limit) q = q.limit(options.limit)
  const { data, error } = await q
  if (error) return []
  return (data ?? []) as WebAgentRun[]
}

/** Get a single web agent run by id */
export async function getWebAgentRun(runId: string): Promise<WebAgentRun | null> {
  if (!supabase) return null
  const userId = await getAuthUserId()
  if (!userId) return null
  const { data, error } = await supabase
    .from('web_agent_runs')
    .select('*')
    .eq('id', runId)
    .eq('user_id', userId)
    .single()
  if (error || !data) return null
  return data as WebAgentRun
}

/** Create a new web agent run (initiate run) */
export async function createWebAgentRun(
  payload: Omit<WebAgentRunInsert, 'user_id'>
): Promise<WebAgentRun | null> {
  if (!supabase) return null
  const userId = await getAuthUserId()
  if (!userId) return null
  const { data, error } = await supabase
    .from('web_agent_runs')
    .insert({
      ...payload,
      user_id: userId,
    })
    .select()
    .single()
  if (error) return null
  return data as WebAgentRun
}

/** Update a web agent run (status, end_time, script_preview) */
export async function updateWebAgentRun(
  runId: string,
  updates: WebAgentRunUpdate
): Promise<WebAgentRun | null> {
  if (!supabase) return null
  const userId = await getAuthUserId()
  if (!userId) return null
  const { data, error } = await supabase
    .from('web_agent_runs')
    .update(updates)
    .eq('id', runId)
    .eq('user_id', userId)
    .select()
    .single()
  if (error) return null
  return data as WebAgentRun
}

/** List steps for a web agent run */
export async function listWebAgentRunSteps(
  runId: string
): Promise<WebAgentRunStep[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('web_agent_run_steps')
    .select('*')
    .eq('run_id', runId)
    .order('step_index', { ascending: true })
  if (error) return []
  return (data ?? []) as WebAgentRunStep[]
}

/** Create a run step (backend / recorder use) */
export async function createWebAgentRunStep(
  payload: WebAgentRunStepInsert
): Promise<WebAgentRunStep | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('web_agent_run_steps')
    .insert(payload)
    .select()
    .single()
  if (error) return null
  return data as WebAgentRunStep
}

/** Update a run step */
export async function updateWebAgentRunStep(
  stepId: string,
  updates: WebAgentRunStepUpdate
): Promise<WebAgentRunStep | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('web_agent_run_steps')
    .update(updates)
    .eq('id', stepId)
    .select()
    .single()
  if (error) return null
  return data as WebAgentRunStep
}

/** Get approval for a step (if any) */
export async function getWebAgentStepApproval(
  stepId: string
): Promise<WebAgentStepApproval | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('web_agent_step_approvals')
    .select('*')
    .eq('step_id', stepId)
    .maybeSingle()
  if (error || !data) return null
  return data as WebAgentStepApproval
}

/** Create or update step approval (checkpoint decision) */
export async function upsertWebAgentStepApproval(
  stepId: string,
  payload: WebAgentStepApprovalInsert | WebAgentStepApprovalUpdate
): Promise<WebAgentStepApproval | null> {
  if (!supabase) return null
  const userId = await getAuthUserId()
  if (!userId) return null
  const { data: existing } = await supabase
    .from('web_agent_step_approvals')
    .select('id')
    .eq('step_id', stepId)
    .maybeSingle()
  if (existing) {
    const { data, error } = await supabase
      .from('web_agent_step_approvals')
      .update({
        ...payload,
        user_id: userId,
      } as WebAgentStepApprovalUpdate)
      .eq('step_id', stepId)
      .select()
      .single()
    if (error) return null
    return data as WebAgentStepApproval
  }
  const { data, error } = await supabase
    .from('web_agent_step_approvals')
    .insert({
      step_id: stepId,
      user_id: userId,
      ...payload,
    } as WebAgentStepApprovalInsert)
    .select()
    .single()
  if (error) return null
  return data as WebAgentStepApproval
}

/** List profiles for the current user */
export async function listWebAgentProfiles(): Promise<WebAgentProfile[]> {
  if (!supabase) return []
  const userId = await getAuthUserId()
  if (!userId) return []
  const { data, error } = await supabase
    .from('web_agent_profiles')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) return []
  return (data ?? []) as WebAgentProfile[]
}

/** Create a profile */
export async function createWebAgentProfile(
  payload: Omit<WebAgentProfileInsert, 'user_id'>
): Promise<WebAgentProfile | null> {
  if (!supabase) return null
  const userId = await getAuthUserId()
  if (!userId) return null
  const { data, error } = await supabase
    .from('web_agent_profiles')
    .insert({
      ...payload,
      user_id: userId,
    })
    .select()
    .single()
  if (error) return null
  return data as WebAgentProfile
}

/** Update a profile */
export async function updateWebAgentProfile(
  profileId: string,
  updates: WebAgentProfileUpdate
): Promise<WebAgentProfile | null> {
  if (!supabase) return null
  const userId = await getAuthUserId()
  if (!userId) return null
  const { data, error } = await supabase
    .from('web_agent_profiles')
    .update(updates)
    .eq('id', profileId)
    .eq('user_id', userId)
    .select()
    .single()
  if (error) return null
  return data as WebAgentProfile
}

/** Delete a profile */
export async function deleteWebAgentProfile(
  profileId: string
): Promise<boolean> {
  if (!supabase) return false
  const userId = await getAuthUserId()
  if (!userId) return false
  const { error } = await supabase
    .from('web_agent_profiles')
    .delete()
    .eq('id', profileId)
    .eq('user_id', userId)
  return !error
}

/** Get script preview (high-level action list) for a run */
export function getScriptPreviewForRun(run: WebAgentRun | null): ScriptAction[] {
  if (!run?.script_preview || !Array.isArray(run.script_preview)) return []
  return run.script_preview as ScriptAction[]
}
