/**
 * Types for Search & Filter feature.
 * search_indexes: indexed content; user_searches: saved searches.
 */

export type SearchDomainType = 'inbox' | 'run' | 'skill' | 'pack'

export interface SearchIndex {
  id: string
  user_id: string
  type: SearchDomainType
  entity_id: string
  content: string | null
  metadata: Record<string, unknown>
  created_at: string
}

export interface SearchIndexInsert {
  id?: string
  user_id: string
  type: SearchDomainType
  entity_id: string
  content?: string | null
  metadata?: Record<string, unknown>
}

export type SearchIndexRow = SearchIndex

/** Saved search parameters (query, filters, pagination) */
export interface SearchParameters {
  query?: string
  types?: SearchDomainType[]
  dateFrom?: string
  dateTo?: string
  status?: string
  page?: number
  limit?: number
  [key: string]: unknown
}

export interface UserSearch {
  id: string
  user_id: string
  search_name: string
  search_parameters: SearchParameters
  description: string | null
  created_at: string
  updated_at: string
}

export interface UserSearchInsert {
  id?: string
  user_id: string
  search_name: string
  search_parameters: SearchParameters
  description?: string | null
}

export interface UserSearchUpdate {
  search_name?: string
  search_parameters?: SearchParameters
  description?: string | null
}

export type UserSearchRow = UserSearch

/** Unified search result item (from any domain) */
export interface SearchResultItem {
  id: string
  type: SearchDomainType
  title: string
  subtitle?: string
  snippet?: string
  metadata?: Record<string, unknown>
  created_at?: string
  href?: string
}

export interface SearchResults {
  items: SearchResultItem[]
  total: number
  page: number
  limit: number
}
