/**
 * Auth helpers: signup, login (password, magic link, Google), password reset, session.
 * Uses Supabase Auth; tokens and email are handled by Supabase.
 */

import { supabase } from '@/lib/supabase'

const getOrigin = () => (typeof window !== 'undefined' ? window.location.origin : '')

/** Redirect URL for password reset email link */
export const getPasswordResetRedirectUrl = () => `${getOrigin()}/reset-password`

/** Redirect URL for email confirmation and OAuth callback (e.g. after signup or magic link) */
export const getAuthCallbackRedirectUrl = () => `${getOrigin()}/dashboard`

const getRedirectUrl = () => getPasswordResetRedirectUrl()

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
 * Signs out the current session and clears local session state.
 */
export async function signOut(): Promise<void> {
  if (supabase) {
    await supabase.auth.signOut()
  }
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token')
  }
}

export interface SignUpInput {
  email: string
  password: string
  full_name?: string
}

/**
 * Sign up with email and password. Sends confirmation email when email confirmations are enabled.
 */
export async function signUp(
  input: SignUpInput
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!supabase) {
    return { ok: false, error: 'Authentication is not configured.' }
  }
  const { error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      emailRedirectTo: getAuthCallbackRedirectUrl(),
      data: input.full_name ? { full_name: input.full_name } : undefined,
    },
  })
  if (error) {
    return { ok: false, error: error.message }
  }
  return { ok: true }
}

export interface SignInInput {
  email: string
  password: string
}

/**
 * Sign in with email and password.
 */
export async function signIn(
  input: SignInInput
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!supabase) {
    return { ok: false, error: 'Authentication is not configured.' }
  }
  const { error } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  })
  if (error) {
    return { ok: false, error: error.message }
  }
  return { ok: true }
}

/**
 * Send a magic link to the given email. User signs in by clicking the link.
 */
export async function signInWithMagicLink(
  email: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!supabase) {
    return { ok: false, error: 'Authentication is not configured.' }
  }
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: getAuthCallbackRedirectUrl() },
  })
  if (error) {
    return { ok: false, error: error.message }
  }
  return { ok: true }
}

/**
 * Start Google OAuth sign-in. Redirects to Google; on success Supabase redirects back to redirectTo.
 */
export async function signInWithGoogle(): Promise<
  { ok: true } | { ok: false; error: string }
> {
  if (!supabase) {
    return { ok: false, error: 'Authentication is not configured.' }
  }
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: getAuthCallbackRedirectUrl() },
  })
  if (error) {
    return { ok: false, error: error.message }
  }
  return { ok: true }
}
