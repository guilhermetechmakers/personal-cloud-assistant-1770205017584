export type SkillBlockType =
  | 'Fetch'
  | 'Transform'
  | 'Search'
  | 'WebAgent'
  | 'CreateOutput'
  | 'Deliver'
  | 'Guard'

export type SkillTriggerType = 'manual' | 'schedule' | 'event'

export type SkillStatus = 'draft' | 'published'

export interface SkillBlock {
  id: string
  type: SkillBlockType
  config: Record<string, unknown>
  order: number
}

/** DB row: skill_blocks table */
export interface SkillBlockRow {
  id: string
  skill_id: string
  block_type: SkillBlockType
  config: Record<string, unknown>
  order_index: number
  created_at: string
  updated_at: string
}

export interface SkillBlockInsert {
  id?: string
  skill_id: string
  block_type: SkillBlockType
  config?: Record<string, unknown>
  order_index?: number
}

export interface SkillBlockUpdate {
  block_type?: SkillBlockType
  config?: Record<string, unknown>
  order_index?: number
}

export interface SkillTrigger {
  type: SkillTriggerType
  config: Record<string, unknown>
}

/** DB row: skills table (Skill Studio) */
export interface Skill {
  id: string
  user_id: string
  name: string
  description: string | null
  trigger_type: SkillTriggerType
  trigger_config: Record<string, unknown>
  status: SkillStatus
  version: number
  created_at: string
  updated_at: string
}

export interface SkillInsert {
  id?: string
  user_id: string
  name: string
  description?: string | null
  trigger_type?: SkillTriggerType
  trigger_config?: Record<string, unknown>
  status?: SkillStatus
  version?: number
}

export interface SkillUpdate {
  name?: string
  description?: string | null
  trigger_type?: SkillTriggerType
  trigger_config?: Record<string, unknown>
  status?: SkillStatus
  version?: number
}

/** DB row: skill_version_history table */
export interface SkillVersionHistoryRow {
  id: string
  skill_id: string
  user_id: string
  version: number
  snapshot: Record<string, unknown>
  created_at: string
}

export interface SkillVersionHistoryInsert {
  id?: string
  skill_id: string
  user_id: string
  version: number
  snapshot: Record<string, unknown>
}

/** DB row: skill_tests table */
export type SkillTestStatus = 'pending' | 'running' | 'completed' | 'failed'

export interface SkillTestRow {
  id: string
  skill_id: string
  inputs: Record<string, unknown>
  outputs: Record<string, unknown>
  status: SkillTestStatus
  created_at: string
}

export interface SkillTestInsert {
  id?: string
  skill_id: string
  inputs?: Record<string, unknown>
  outputs?: Record<string, unknown>
  status?: SkillTestStatus
}

/** Validation / preflight error or warning for Skill Studio */
export interface SkillValidationIssue {
  id: string
  type: 'error' | 'warning'
  source: 'connector' | 'scope' | 'block' | 'trigger' | 'preflight'
  message: string
  blockId?: string
  blockType?: SkillBlockType
}

export interface SkillPack {
  id: string
  name: string
  description: string
  required_connectors: string[]
  steps: unknown[]
  pricing?: string
}
