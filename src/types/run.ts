export type RunStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'

export interface RunStep {
  id: string
  type: string
  input?: unknown
  output?: unknown
  status: RunStatus
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
  updated_at: string
}

export interface Approval {
  id: string
  run_id: string
  requested_action: string
  payload: unknown
  status: 'pending' | 'approved' | 'rejected'
  actor?: string
  created_at: string
}
