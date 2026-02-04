/**
 * Skills and Skill Studio data layer.
 * Uses Supabase when configured; otherwise returns empty/mock data.
 */

import { supabase } from '@/lib/supabase'
import type {
  Skill,
  SkillInsert,
  SkillUpdate,
  SkillBlockRow,
  SkillBlockInsert,
  SkillBlockUpdate,
  SkillVersionHistoryRow,
  SkillVersionHistoryInsert,
  SkillTestRow,
  SkillTestInsert,
} from '@/types/skill'

async function getAuthUserId(): Promise<string | null> {
  if (!supabase) return null
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) return null
  return user.id
}

/** List skills for the current user */
export async function listSkills(): Promise<Skill[]> {
  if (!supabase) return []
  const userId = await getAuthUserId()
  if (!userId) return []
  const { data, error } = await supabase
    .from('skills')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
  if (error) return []
  return (data ?? []) as Skill[]
}

/** Get a single skill by id */
export async function getSkill(id: string): Promise<Skill | null> {
  if (!supabase) return null
  const userId = await getAuthUserId()
  if (!userId) return null
  const { data, error } = await supabase
    .from('skills')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single()
  if (error || !data) return null
  return data as Skill
}

/** Create a skill */
export async function createSkill(
  payload: Omit<SkillInsert, 'user_id'>
): Promise<Skill | null> {
  if (!supabase) return null
  const userId = await getAuthUserId()
  if (!userId) return null
  const insert: SkillInsert = { ...payload, user_id: userId }
  const { data, error } = await supabase
    .from('skills')
    .insert(insert)
    .select()
    .single()
  if (error) return null
  return data as Skill
}

/** Update a skill */
export async function updateSkill(
  id: string,
  updates: SkillUpdate
): Promise<Skill | null> {
  if (!supabase) return null
  const userId = await getAuthUserId()
  if (!userId) return null
  const { data, error } = await supabase
    .from('skills')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()
  if (error) return null
  return data as Skill
}

/** Delete a skill */
export async function deleteSkill(id: string): Promise<boolean> {
  if (!supabase) return false
  const userId = await getAuthUserId()
  if (!userId) return false
  const { error } = await supabase
    .from('skills')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
  return !error
}

/** Publish a skill (set status to published) */
export async function publishSkill(id: string): Promise<Skill | null> {
  return updateSkill(id, { status: 'published' })
}

/** List blocks for a skill */
export async function listSkillBlocks(skillId: string): Promise<SkillBlockRow[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('skill_blocks')
    .select('*')
    .eq('skill_id', skillId)
    .order('order_index', { ascending: true })
  if (error) return []
  return (data ?? []) as SkillBlockRow[]
}

/** Create a block */
export async function createSkillBlock(
  payload: SkillBlockInsert
): Promise<SkillBlockRow | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('skill_blocks')
    .insert({
      ...payload,
      order_index: payload.order_index ?? 0,
    })
    .select()
    .single()
  if (error) return null
  return data as SkillBlockRow
}

/** Update a block */
export async function updateSkillBlock(
  id: string,
  updates: SkillBlockUpdate
): Promise<SkillBlockRow | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('skill_blocks')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) return null
  return data as SkillBlockRow
}

/** Delete a block */
export async function deleteSkillBlock(id: string): Promise<boolean> {
  if (!supabase) return false
  const { error } = await supabase.from('skill_blocks').delete().eq('id', id)
  return !error
}

/** Reorder blocks: set order_index for each block id in order */
export async function reorderSkillBlocks(
  skillId: string,
  blockIds: string[]
): Promise<boolean> {
  if (!supabase) return false
  for (let i = 0; i < blockIds.length; i++) {
    const { error } = await supabase
      .from('skill_blocks')
      .update({ order_index: i })
      .eq('id', blockIds[i])
      .eq('skill_id', skillId)
    if (error) return false
  }
  return true
}

/** List version history for a skill */
export async function listSkillVersionHistory(
  skillId: string
): Promise<SkillVersionHistoryRow[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('skill_version_history')
    .select('*')
    .eq('skill_id', skillId)
    .order('created_at', { ascending: false })
  if (error) return []
  return (data ?? []) as SkillVersionHistoryRow[]
}

/** Create a version snapshot (call before major updates) */
export async function createSkillVersionSnapshot(
  skillId: string,
  version: number,
  snapshot: Record<string, unknown>
): Promise<SkillVersionHistoryRow | null> {
  if (!supabase) return null
  const userId = await getAuthUserId()
  if (!userId) return null
  const insert: SkillVersionHistoryInsert = {
    skill_id: skillId,
    user_id: userId,
    version,
    snapshot,
  }
  const { data, error } = await supabase
    .from('skill_version_history')
    .insert(insert)
    .select()
    .single()
  if (error) return null
  return data as SkillVersionHistoryRow
}

/** List test runs for a skill */
export async function listSkillTests(
  skillId: string,
  limit = 20
): Promise<SkillTestRow[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('skill_tests')
    .select('*')
    .eq('skill_id', skillId)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) return []
  return (data ?? []) as SkillTestRow[]
}

/** Create a test run record */
export async function createSkillTest(
  payload: SkillTestInsert
): Promise<SkillTestRow | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('skill_tests')
    .insert(payload)
    .select()
    .single()
  if (error) return null
  return data as SkillTestRow
}
