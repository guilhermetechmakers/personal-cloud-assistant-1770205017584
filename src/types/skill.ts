export type SkillBlockType =
  | 'Fetch'
  | 'Transform'
  | 'Search'
  | 'WebAgent'
  | 'CreateOutput'
  | 'Deliver'
  | 'Guard'

export interface SkillBlock {
  id: string
  type: SkillBlockType
  config: Record<string, unknown>
  order: number
}

export interface SkillTrigger {
  type: 'manual' | 'schedule' | 'event'
  config: Record<string, unknown>
}

export interface Skill {
  id: string
  workspace_id: string
  name: string
  description?: string
  triggers: SkillTrigger[]
  blocks: SkillBlock[]
  version: number
  published: boolean
  created_at: string
  updated_at: string
}

export interface SkillPack {
  id: string
  name: string
  description: string
  required_connectors: string[]
  steps: unknown[]
  pricing?: string
}
