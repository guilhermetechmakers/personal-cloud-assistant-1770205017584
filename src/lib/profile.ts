/**
 * Profile and preferences data layer.
 * Uses Supabase when configured; otherwise returns fallback data for development.
 */

import { supabase } from '@/lib/supabase'
import type {
  Profile,
  ProfileUpdate,
  UserPreferences,
  UserPreferencesUpdate,
  ProfileView,
  SessionInfo,
} from '@/types/profile'

const DEFAULT_TIMEZONE = 'UTC'
const DEFAULT_LOCALE = 'en-US'
const DEFAULT_WORKSPACE_ROLE = 'member' as const
const DEFAULT_TONE = 'professional' as const
const DEFAULT_VERBOSITY = 'medium' as const
const DEFAULT_APPROVAL_LEVEL = 'requires_approval' as const

/** Fetch current user from Supabase Auth */
async function getAuthUser() {
  if (!supabase) return null
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  return user
}

/** Get profile by user id from public.profiles */
export async function getProfile(userId: string): Promise<Profile | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error || !data) return null
  return data as Profile
}

/** Update or create profile (upsert by id) */
export async function updateProfile(
  userId: string,
  updates: ProfileUpdate
): Promise<Profile | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ id: userId, ...updates }, { onConflict: 'id' })
    .select()
    .single()
  if (error) return null
  return data as Profile
}

/** Ensure profile row exists for user (e.g. after signup) */
export async function ensureProfile(userId: string, defaults?: Partial<ProfileUpdate>): Promise<Profile | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('profiles')
    .upsert(
      {
        id: userId,
        display_name: defaults?.display_name ?? null,
        full_name: defaults?.full_name ?? null,
        timezone: defaults?.timezone ?? DEFAULT_TIMEZONE,
        locale: defaults?.locale ?? DEFAULT_LOCALE,
        workspace_role: defaults?.workspace_role ?? DEFAULT_WORKSPACE_ROLE,
      },
      { onConflict: 'id' }
    )
    .select()
    .single()
  if (error) return null
  return data as Profile
}

/** Get user preferences by user id */
export async function getPreferences(userId: string): Promise<UserPreferences | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single()
  if (error || !data) return null
  return data as UserPreferences
}

/** Update user preferences (upsert) */
export async function updatePreferences(
  userId: string,
  updates: UserPreferencesUpdate
): Promise<UserPreferences | null> {
  if (!supabase) return null
  const { error: upsertError } = await supabase
    .from('user_preferences')
    .upsert(
      { user_id: userId, ...updates },
      { onConflict: 'user_id' }
    )
  if (upsertError) return null
  return getPreferences(userId)
}

/** Get full profile view for Profile page: auth user + profile + preferences */
export async function getProfileView(): Promise<ProfileView | null> {
  const user = await getAuthUser()
  if (!user) return null

  const profile = await getProfile(user.id)
  const prefs = await getPreferences(user.id)

  return {
    id: user.id,
    email: user.email ?? '',
    full_name: profile?.full_name ?? user.user_metadata?.full_name ?? null,
    display_name: profile?.display_name ?? null,
    avatar_url: profile?.avatar_url ?? user.user_metadata?.avatar_url ?? null,
    timezone: profile?.timezone ?? DEFAULT_TIMEZONE,
    locale: profile?.locale ?? DEFAULT_LOCALE,
    workspace_role: profile?.workspace_role ?? DEFAULT_WORKSPACE_ROLE,
    two_fa_enabled: profile?.two_fa_enabled ?? false,
    assistant_tone: prefs?.assistant_tone ?? DEFAULT_TONE,
    verbosity: prefs?.verbosity ?? DEFAULT_VERBOSITY,
    default_approval_level: prefs?.default_approval_level ?? DEFAULT_APPROVAL_LEVEL,
  }
}

/** Get list of sessions for Security section (Supabase Auth) */
export async function getSessions(): Promise<SessionInfo[]> {
  if (!supabase) {
    return [
      {
        id: 'current',
        device: 'This device',
        is_current: true,
      },
    ]
  }
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return []
  return [
    {
      id: session.access_token.slice(0, 12),
      created_at: session.user.created_at,
      last_accessed_at: new Date().toISOString(),
      device: 'This device',
      is_current: true,
    },
  ]
}

/** Revoke other sessions. Client cannot revoke other devices without backend; changing password invalidates other sessions. */
export async function revokeOtherSessions(): Promise<void> {
  if (!supabase) return
  // No-op: Supabase JS client only has current session; use backend or password reset to invalidate others
}

/** Toggle 2FA (Supabase MFA: enable/disable; for MVP we only update profiles.two_fa_enabled) */
export async function setTwoFaEnabled(userId: string, enabled: boolean): Promise<boolean> {
  const updated = await updateProfile(userId, { two_fa_enabled: enabled })
  return updated !== null
}
