/**
 * Types for runs, steps, approvals, and artifacts.
 * Aligns with automation_runs, run_steps, run_approvals, run_artifacts.
 */

import type { AutomationRunStatus } from '@/types/automation'

export type RunStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled'

export interface RunStep {
  id: string
  run_id: string
  step_index: number
  step_type: string
  input_data: Record<string, unknown>
  output_data: Record<string, unknown>
  logs: string | null
  artifact_links: unknown[]
  status: RunStatus
  created_at: string
}

export interface RunStepInsert {
  run_id: string
  step_index?: number
  step_type?: string
  input_data?: Record<string, unknown>
  output_data?: Record<string, unknown>
  logs?: string | null
  artifact_links?: unknown[]
  status?: RunStatus
}

export type RunStepRow = RunStep

export type ApprovalDecision = 'pending' | 'approved' | 'rejected'

export interface RunApproval {
  id: string
  run_id: string
  requested_action: string
  payload: Record<string, unknown>
  decision: ApprovalDecision
  actor: string | null
  rollback_options: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface RunApprovalUpdate {
  decision?: ApprovalDecision
  actor?: string | null
  payload?: Record<string, unknown>
  rollback_options?: Record<string, unknown>
}

export type RunApprovalRow = RunApproval

export interface RunArtifact {
  id: string
  run_id: string
  file_type: string
  download_link: string | null
  label: string | null
  metadata: Record<string, unknown>
  created_at: string
}

export interface RunArtifactInsert {
  run_id: string
  file_type?: string
  download_link?: string | null
  label?: string | null
  metadata?: Record<string, unknown>
}

export type RunArtifactRow = RunArtifact

/** Run header: automation run + skill name and initiator from automation */
export interface RunDetailsHeader {
  id: string
  automation_id: string
  run_time: string
  status: AutomationRunStatus
  result: Record<string, unknown>
  created_at: string
  skill_name: string | null
  initiator: string
}

/** Full run details for Run Details page */
export interface RunDetails {
  run: RunDetailsHeader
  steps: RunStep[]
  approvals: RunApproval[]
  artifacts: RunArtifact[]
}

export interface Approval {
  id: string
  run_id: string
  requested_action: string
  payload: unknown
  status: ApprovalDecision
  actor?: string | null
  created_at: string
}

export interface Run {
  id: string
  skill_id: string
  skill_name?: string
  initiator: string
  status: RunStatus
  steps: RunStep[]
  created_at: string
  updated_at?: string
}
