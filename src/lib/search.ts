/**
 * Search & Filter data layer.
 * Saved searches via Supabase; search runs against skills and automation_runs.
 */

import { supabase } from '@/lib/supabase'
import type {
  UserSearch,
  UserSearchInsert,
  UserSearchUpdate,
  SearchParameters,
  SearchResults,
  SearchResultItem,
  SearchDomainType,
} from '@/types/search'

async function getAuthUserId(): Promise<string | null> {
  if (!supabase) return null
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) return null
  return user.id
}

// ---------- Saved searches (user_searches) ----------

export async function listUserSearches(): Promise<UserSearch[]> {
  if (!supabase) return []
  const userId = await getAuthUserId()
  if (!userId) return []
  const { data, error } = await supabase
    .from('user_searches')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
  if (error) return []
  return (data ?? []) as UserSearch[]
}

export async function getUserSearch(id: string): Promise<UserSearch | null> {
  if (!supabase) return null
  const userId = await getAuthUserId()
  if (!userId) return null
  const { data, error } = await supabase
    .from('user_searches')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single()
  if (error || !data) return null
  return data as UserSearch
}

export async function createUserSearch(
  payload: Omit<UserSearchInsert, 'user_id'>
): Promise<UserSearch | null> {
  if (!supabase) return null
  const userId = await getAuthUserId()
  if (!userId) return null
  const insert: UserSearchInsert = {
    ...payload,
    user_id: userId,
    search_parameters: payload.search_parameters ?? {},
  }
  const { data, error } = await supabase
    .from('user_searches')
    .insert(insert)
    .select()
    .single()
  if (error) return null
  return data as UserSearch
}

export async function updateUserSearch(
  id: string,
  updates: UserSearchUpdate
): Promise<UserSearch | null> {
  if (!supabase) return null
  const userId = await getAuthUserId()
  if (!userId) return null
  const { data, error } = await supabase
    .from('user_searches')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()
  if (error) return null
  return data as UserSearch
}

export async function deleteUserSearch(id: string): Promise<boolean> {
  if (!supabase) return false
  const userId = await getAuthUserId()
  if (!userId) return false
  const { error } = await supabase
    .from('user_searches')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
  return !error
}

// ---------- Search (skills + automation_runs) ----------

const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 20

export async function performSearch(
  params: SearchParameters
): Promise<SearchResults> {
  const userId = await getAuthUserId()
  if (!supabase || !userId) {
    return { items: [], total: 0, page: params.page ?? DEFAULT_PAGE, limit: params.limit ?? DEFAULT_LIMIT }
  }

  const query = (params.query ?? '').trim().toLowerCase()
  const types = params.types ?? (['skill', 'run'] as SearchDomainType[])
  const page = Math.max(1, params.page ?? DEFAULT_PAGE)
  const limit = Math.min(50, Math.max(1, params.limit ?? DEFAULT_LIMIT))
  const offset = (page - 1) * limit
  const items: SearchResultItem[] = []

  if (types.includes('skill')) {
    let q = supabase
      .from('skills')
      .select('id, name, description, status, created_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
    if (query) {
      q = q.or(`name.ilike.%${query}%,description.ilike.%${query}%`)
    }
    const { data: skills } = await q
    const skillItems: SearchResultItem[] = (skills ?? []).map((s: { id: string; name: string; description: string | null; status: string; created_at: string }) => ({
      id: s.id,
      type: 'skill' as const,
      title: s.name,
      subtitle: s.status,
      snippet: s.description ?? undefined,
      created_at: s.created_at,
      href: `/dashboard/skills?skill=${s.id}`,
    }))
    items.push(...skillItems)
  }

  if (types.includes('run')) {
    const { data: automations } = await supabase
      .from('automations')
      .select('id, name, skill_name')
      .eq('user_id', userId)
    const automationIds = (automations ?? []).map((a: { id: string }) => a.id)
    const automationMap = new Map(
      (automations ?? []).map((a: { id: string; name: string; skill_name: string | null }) => [a.id, a.name || a.skill_name || 'Run'])
    )
    if (automationIds.length > 0) {
      let runsQ = supabase
        .from('automation_runs')
        .select('id, automation_id, run_time, status, created_at')
        .in('automation_id', automationIds)
        .order('run_time', { ascending: false })
        .limit(100)
      const { data: runs } = await runsQ
      const runList = (runs ?? []) as Array<{
        id: string
        automation_id: string
        run_time: string
        status: string
        created_at: string
      }>
      const runItems: SearchResultItem[] = runList
        .filter((r) => {
          if (!query) return true
          const name = automationMap.get(r.automation_id) ?? ''
          return name.toLowerCase().includes(query)
        })
        .map((r) => ({
          id: r.id,
          type: 'run' as const,
          title: automationMap.get(r.automation_id) ?? 'Run',
          subtitle: r.status,
          snippet: new Date(r.run_time).toLocaleString(),
          created_at: r.created_at,
          href: `/dashboard/runs/${r.id}`,
        }))
      items.push(...runItems)
    }
  }

  // Optional: filter by date range
  if (params.dateFrom || params.dateTo) {
    const from = params.dateFrom ? new Date(params.dateFrom).getTime() : 0
    const to = params.dateTo ? new Date(params.dateTo).getTime() : Number.MAX_SAFE_INTEGER
    const filtered = items.filter((i) => {
      const t = i.created_at ? new Date(i.created_at).getTime() : 0
      return t >= from && t <= to
    })
    items.length = 0
    items.push(...filtered)
  }

  if (params.status) {
    const filtered = items.filter((i) => i.subtitle === params.status)
    items.length = 0
    items.push(...filtered)
  }

  // Sort by created_at desc and paginate
  items.sort((a, b) => {
    const ta = a.created_at ? new Date(a.created_at).getTime() : 0
    const tb = b.created_at ? new Date(b.created_at).getTime() : 0
    return tb - ta
  })
  const total = items.length
  const paginated = items.slice(offset, offset + limit)

  return {
    items: paginated,
    total,
    page,
    limit,
  }
}
