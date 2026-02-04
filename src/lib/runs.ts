/**
 * Run details, steps, approvals, artifacts data layer.
 * Uses Supabase when configured; otherwise returns empty/mock data.
 */

import { supabase } from '@/lib/supabase'
import type {
  RunDetailsHeader,
  RunDetails,
  RunStep,
  RunStepInsert,
  RunApproval,
  RunApprovalUpdate,
  RunArtifact,
  RunArtifactInsert,
} from '@/types/run'
import type { AutomationRun } from '@/types/automation'

interface AutomationRunWithAutomation extends AutomationRun {
  automation: { skill_name: string | null; user_id: string } | null
}

async function getAuthUserId(): Promise<string | null> {
  if (!supabase) return null
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) return null
  return user.id
}

/** Get run header (run + skill_name, initiator) by run id */
export async function getRunDetailsHeader(
  runId: string
): Promise<RunDetailsHeader | null> {
  if (!supabase) return null
  const userId = await getAuthUserId()
  if (!userId) return null
  const { data, error } = await supabase
    .from('automation_runs')
    .select(
      `
      *,
      automation:automations(skill_name, user_id)
    `
    )
    .eq('id', runId)
    .single()
  if (error || !data) return null
  const row = data as unknown as AutomationRunWithAutomation
  const automation = row.automation
  const initiator =
    automation?.user_id === userId ? 'You' : automation?.user_id ?? '—'
  return {
    id: row.id,
    automation_id: row.automation_id,
    run_time: row.run_time,
    status: row.status,
    result: row.result ?? {},
    created_at: row.created_at,
    skill_name: automation?.skill_name ?? null,
    initiator,
  }
}

/** List steps for a run */
export async function listRunSteps(runId: string): Promise<RunStep[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('run_steps')
    .select('*')
    .eq('run_id', runId)
    .order('step_index', { ascending: true })
  if (error) return []
  return (data ?? []) as RunStep[]
}

/** List approvals for a run */
export async function listRunApprovals(runId: string): Promise<RunApproval[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('run_approvals')
    .select('*')
    .eq('run_id', runId)
    .order('created_at', { ascending: false })
  if (error) return []
  return (data ?? []) as RunApproval[]
}

/** List artifacts for a run */
export async function listRunArtifacts(
  runId: string
): Promise<RunArtifact[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('run_artifacts')
    .select('*')
    .eq('run_id', runId)
    .order('created_at', { ascending: false })
  if (error) return []
  return (data ?? []) as RunArtifact[]
}

/** Get full run details (header + steps + approvals + artifacts) */
export async function getRunDetails(runId: string): Promise<RunDetails | null> {
  const run = await getRunDetailsHeader(runId)
  if (!run) return null
  const [steps, approvals, artifacts] = await Promise.all([
    listRunSteps(runId),
    listRunApprovals(runId),
    listRunArtifacts(runId),
  ])
  return { run, steps, approvals, artifacts }
}

/** Update an approval (decision, actor, rollback_options) */
export async function updateRunApproval(
  approvalId: string,
  updates: RunApprovalUpdate
): Promise<RunApproval | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('run_approvals')
    .update(updates)
    .eq('id', approvalId)
    .select()
    .single()
  if (error) return null
  return data as RunApproval
}

/** Create a run step (for backend/test use) */
export async function createRunStep(
  payload: RunStepInsert
): Promise<RunStep | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('run_steps')
    .insert(payload)
    .select()
    .single()
  if (error) return null
  return data as RunStep
}

/** Create a run artifact (for backend use) */
export async function createRunArtifact(
  payload: RunArtifactInsert
): Promise<RunArtifact | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('run_artifacts')
    .insert(payload)
    .select()
    .single()
  if (error) return null
  return data as RunArtifact
}

/** Export run data (format: 'pdf' | 'json'). Returns blob URL or JSON string for client download. */
export async function exportRun(
  runId: string,
  format: 'pdf' | 'json'
): Promise<{ blobUrl?: string; json?: string; url?: string; error?: string }> {
  const details = await getRunDetails(runId)
  if (!details) return { error: 'Run not found' }
  if (format === 'json') {
    const json = JSON.stringify(
      {
        run: details.run,
        steps: details.steps,
        approvals: details.approvals,
        artifacts: details.artifacts,
        exported_at: new Date().toISOString(),
      },
      null,
      2
    )
    return { json }
  }
  if (format === 'pdf') {
    return {
      url: '',
      error:
        'PDF export is handled by the backend; use Export modal to trigger server-side generation.',
    }
  }
  return { url: '', error: 'Unsupported format' }
}

/** Create a shareable link with access control (mock: returns client-side link; backend would create token). */
export async function createShareLink(
  runId: string,
  _options: { expiresIn?: string; allowView?: boolean }
): Promise<{ url: string; expiresAt?: string; error?: string }> {
  const run = await getRunDetailsHeader(runId)
  if (!run) return { url: '', error: 'Run not found' }
  const base = typeof window !== 'undefined' ? window.location.origin : ''
  const url = `${base}/dashboard/runs/${runId}`
  return {
    url,
    expiresAt: undefined,
  }
}
