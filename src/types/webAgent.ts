/**
 * Types for Web Agent Runs & Recorder.
 * Aligns with web_agent_runs, web_agent_run_steps, web_agent_profiles, web_agent_step_approvals.
 */

export type WebAgentProfileType = 'ephemeral' | 'persistent'

export type WebAgentRunStatus =
  | 'pending'
  | 'running'
  | 'paused'
  | 'completed'
  | 'failed'
  | 'cancelled'

export type WebAgentStepStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'awaiting_approval'

export type WebAgentApprovalStatus = 'pending' | 'approved' | 'rejected'

export interface WebAgentProfile {
  id: string
  user_id: string
  name: string
  profile_type: WebAgentProfileType
  credentials_ref: string | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface WebAgentProfileInsert {
  id?: string
  user_id: string
  name: string
  profile_type?: WebAgentProfileType
  credentials_ref?: string | null
  metadata?: Record<string, unknown>
}

export interface WebAgentProfileUpdate {
  name?: string
  profile_type?: WebAgentProfileType
  credentials_ref?: string | null
  metadata?: Record<string, unknown>
}

export type WebAgentProfileRow = WebAgentProfile

export interface WebAgentRun {
  id: string
  user_id: string
  profile_id: string | null
  profile_type: WebAgentProfileType
  status: WebAgentRunStatus
  start_time: string | null
  end_time: string | null
  script_preview: ScriptAction[]
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface ScriptAction {
  id?: string
  label: string
  type?: string
  order?: number
}

export interface WebAgentRunInsert {
  id?: string
  user_id: string
  profile_id?: string | null
  profile_type?: WebAgentProfileType
  status?: WebAgentRunStatus
  start_time?: string | null
  end_time?: string | null
  script_preview?: ScriptAction[]
  metadata?: Record<string, unknown>
}

export interface WebAgentRunUpdate {
  profile_id?: string | null
  profile_type?: WebAgentProfileType
  status?: WebAgentRunStatus
  start_time?: string | null
  end_time?: string | null
  script_preview?: ScriptAction[]
  metadata?: Record<string, unknown>
}

export type WebAgentRunRow = WebAgentRun

export interface WebAgentRunStep {
  id: string
  run_id: string
  step_index: number
  description: string
  screenshot_url: string | null
  requires_approval: boolean
  logs: string | null
  status: WebAgentStepStatus
  payload: Record<string, unknown>
  created_at: string
}

export interface WebAgentRunStepInsert {
  id?: string
  run_id: string
  step_index?: number
  description?: string
  screenshot_url?: string | null
  requires_approval?: boolean
  logs?: string | null
  status?: WebAgentStepStatus
  payload?: Record<string, unknown>
}

export interface WebAgentRunStepUpdate {
  description?: string
  screenshot_url?: string | null
  requires_approval?: boolean
  logs?: string | null
  status?: WebAgentStepStatus
  payload?: Record<string, unknown>
}

export type WebAgentRunStepRow = WebAgentRunStep

export interface WebAgentStepApproval {
  id: string
  step_id: string
  user_id: string | null
  status: WebAgentApprovalStatus
  payload: Record<string, unknown>
  decision_note: string | null
  created_at: string
  updated_at: string
}

export interface WebAgentStepApprovalInsert {
  id?: string
  step_id: string
  user_id?: string | null
  status?: WebAgentApprovalStatus
  payload?: Record<string, unknown>
  decision_note?: string | null
}

export interface WebAgentStepApprovalUpdate {
  user_id?: string | null
  status?: WebAgentApprovalStatus
  payload?: Record<string, unknown>
  decision_note?: string | null
}

export type WebAgentStepApprovalRow = WebAgentStepApproval

/** Run with steps and approvals for timeline view */
export interface WebAgentRunWithDetails extends WebAgentRun {
  steps: WebAgentRunStep[]
  step_approvals: Map<string, WebAgentStepApproval>
}
