/**
 * Types for automations and automation runs.
 * Aligns with Supabase tables automations and automation_runs.
 */

export type AutomationTriggerType = 'manual' | 'schedule' | 'event'

export type AutomationRunStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled'

export interface Automation {
  id: string
  user_id: string
  name: string
  skill_id: string
  skill_name: string | null
  trigger_type: AutomationTriggerType
  schedule_config: Record<string, unknown>
  timezone: string
  enabled: boolean
  next_run_at: string | null
  created_at: string
  updated_at: string
}

export interface AutomationInsert {
  id?: string
  user_id: string
  name: string
  skill_id: string
  skill_name?: string | null
  trigger_type?: AutomationTriggerType
  schedule_config?: Record<string, unknown>
  timezone?: string
  enabled?: boolean
  next_run_at?: string | null
}

export interface AutomationUpdate {
  name?: string
  skill_id?: string
  skill_name?: string | null
  trigger_type?: AutomationTriggerType
  schedule_config?: Record<string, unknown>
  timezone?: string
  enabled?: boolean
  next_run_at?: string | null
}

export interface AutomationRun {
  id: string
  automation_id: string
  run_time: string
  status: AutomationRunStatus
  result: Record<string, unknown>
  created_at: string
}

export interface AutomationRunInsert {
  automation_id: string
  run_time?: string
  status?: AutomationRunStatus
  result?: Record<string, unknown>
}

export type AutomationRow = Automation
export type AutomationRunRow = AutomationRun
