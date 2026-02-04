/**
 * Database and UI types for profiles and user preferences
 * Aligns with supabase/migrations/20250204140000_profiles_and_preferences.sql
 */

export type WorkspaceRole = 'member' | 'admin' | 'owner'
export type AssistantTone = 'professional' | 'friendly' | 'concise' | 'detailed'
export type Verbosity = 'low' | 'medium' | 'high'
export type DefaultApprovalLevel = 'draft_only' | 'requires_approval' | 'always_allow'

export interface Profile {
  id: string
  display_name: string | null
  full_name: string | null
  timezone: string
  locale: string
  avatar_url: string | null
  workspace_role: WorkspaceRole
  two_fa_enabled: boolean
  created_at: string
  updated_at: string
}

export interface ProfileInsert {
  id: string
  display_name?: string | null
  full_name?: string | null
  timezone?: string
  locale?: string
  avatar_url?: string | null
  workspace_role?: WorkspaceRole
  two_fa_enabled?: boolean
}

export interface ProfileUpdate {
  display_name?: string | null
  full_name?: string | null
  timezone?: string
  locale?: string
  avatar_url?: string | null
  workspace_role?: WorkspaceRole
  two_fa_enabled?: boolean
}

export interface UserPreferences {
  id: string
  user_id: string
  assistant_tone: AssistantTone
  verbosity: Verbosity
  default_approval_level: DefaultApprovalLevel
  created_at: string
  updated_at: string
}

export interface UserPreferencesInsert {
  user_id: string
  assistant_tone?: AssistantTone
  verbosity?: Verbosity
  default_approval_level?: DefaultApprovalLevel
}

export interface UserPreferencesUpdate {
  assistant_tone?: AssistantTone
  verbosity?: Verbosity
  default_approval_level?: DefaultApprovalLevel
}

/** Combined view for Profile page: auth user + profile + preferences */
export interface ProfileView {
  id: string
  email: string
  full_name: string | null
  display_name: string | null
  avatar_url: string | null
  timezone: string
  locale: string
  workspace_role: WorkspaceRole
  two_fa_enabled: boolean
  assistant_tone: AssistantTone
  verbosity: Verbosity
  default_approval_level: DefaultApprovalLevel
}

/** Session info for Security section (Supabase Auth session or placeholder) */
export interface SessionInfo {
  id: string
  created_at?: string
  last_accessed_at?: string
  device?: string
  is_current?: boolean
}
