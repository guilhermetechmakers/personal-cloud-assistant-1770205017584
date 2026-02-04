/**
 * Auth helpers for password reset and recovery.
 * Uses Supabase Auth; tokens and email are handled by Supabase.
 */

import { supabase } from '@/lib/supabase'

const getRedirectUrl = () =>
  typeof window !== 'undefined'
    ? `${window.location.origin}/reset-password`
    : ''

/**
 * Sends a password reset email to the given address.
 * Supabase sends a secure, time-bound link. No custom token table needed.
 */
export async function requestPasswordReset(email: string): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!supabase) {
    return { ok: false, error: 'Authentication is not configured.' }
  }
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: getRedirectUrl(),
  })
  if (error) {
    return { ok: false, error: error.message }
  }
  return { ok: true }
}

/**
 * Returns the current session if present (e.g. after recovery redirect).
 */
export async function getSession() {
  if (!supabase) return { data: { session: null }, error: null }
  return supabase.auth.getSession()
}

/**
 * Updates the current user's password. Use after recovery redirect when session exists.
 */
export async function updatePassword(newPassword: string): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!supabase) {
    return { ok: false, error: 'Authentication is not configured.' }
  }
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) {
    return { ok: false, error: error.message }
  }
  return { ok: true }
}

/**
 * Signs out the current session (e.g. after password reset so user logs in with new password).
 */
export async function signOut(): Promise<void> {
  if (supabase) {
    await supabase.auth.signOut()
  }
}
