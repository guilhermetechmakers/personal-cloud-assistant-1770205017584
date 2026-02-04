# User Authentication & Session Management — Implementation Plan

## Summary

This feature wires the existing auth UI (Login, Signup, ForgotPassword, ResetPassword, EmailVerification, Profile) to **Supabase Auth**, delivering signup with email confirmation/magic link, login via email/password or Google SSO, magic-link login, and session handling with logout and session visibility. The app is a Vite + React SPA; Supabase manages users (auth.users), JWTs, and refresh tokens. Profiles are extended in public.profiles; a DB trigger will create a profile row when a user signs up. Session “list” shows the current device (Supabase client does not expose multi-device sessions); “revoke other sessions” is clarified with copy and a link to change password to invalidate other sessions.

## Scope

- **In scope:** Signup (email/password + optional full_name, redirect to verify-email); Login (email/password, Google OAuth, magic link); magic link dialog and success state; session display (current session) and logout; Profile Security section with clear “revoke others” copy and link to forgot-password; Navbar showing user email when logged in and real logout; AuthLayout with header/footer (login/signup links already on Landing); ensure profile created on signup (DB trigger).
- **Out of scope:** Custom backend auth endpoints (/auth/signup, etc.)—auth is via Supabase client; HttpOnly cookie storage (Supabase SPA uses localStorage by default; no custom backend); rate limiting / brute-force / CSRF at application layer (rely on Supabase and optional future Edge Functions); custom Sessions/Revoked Tokens tables (Supabase manages sessions; we keep current-session-only UI and “change password to revoke others”).

## Architecture / Approach

- **Auth provider:** Supabase Auth (already in use). `lib/auth.ts` extended with `signUp`, `signIn`, `signInWithOtp`, `signInWithOAuth`, and redirect URL helpers.
- **Users:** auth.users (Supabase). Extended profile in public.profiles; trigger on auth.users INSERT to create profile row.
- **Sessions:** Supabase handles JWT and refresh token; client uses `getSession()` and `onAuthStateChange`. No custom Sessions table for this iteration.
- **Profile creation:** Database trigger `on auth.users insert` → insert into profiles(id, …) so every new user gets a profile.
- **Navigation:** After login/signup, redirect to `/verify-email` if email not confirmed, else `/dashboard`. After logout, redirect to `/`.

## Implementation Steps

### Step 1: Extend lib/auth.ts
- **Files:** `src/lib/auth.ts`
- **Description:** Add `signUp`, `signIn`, `signInWithOtp`, `signInWithOAuth`. Add `getRedirectUrl()` variant for auth callback (e.g. `${origin}/dashboard` or pass path). Return `{ ok: true } | { ok: false; error: string }` for each. Use `supabase.auth.getSession()` / existing `getSession` for session.
- **Dependencies:** None.

### Step 2: Database trigger for profile on signup
- **Files:** New migration `supabase/migrations/20250204290000_auth_profile_trigger.sql`
- **Description:** Create trigger on `auth.users` AFTER INSERT that inserts a row into `public.profiles` with `id = NEW.id` and defaults (timezone, locale, workspace_role).
- **Dependencies:** None.

### Step 3: Wire Login page
- **Files:** `src/pages/Login.tsx`
- **Description:** Email/password form calls `signIn` from auth; on success redirect to `/verify-email` or `/dashboard`. Google button calls `signInWithOAuth({ provider: 'google' })`. “Send magic link” opens a dialog; email input → `signInWithOtp`; show success message. Use toast for errors.
- **Dependencies:** Step 1.

### Step 4: Wire Signup page
- **Files:** `src/pages/Signup.tsx`
- **Description:** Form calls `signUp` with email, password, optional full_name (user_metadata). Set emailRedirectTo to `/verify-email` or `/dashboard`. On success show “Check your email” and link to login or verify-email. Optional: add “Sign up with Google” that uses same OAuth flow (creates user on first Google sign-in).
- **Dependencies:** Step 1.

### Step 5: Magic Link dialog component
- **Files:** New `src/components/auth/MagicLinkDialog.tsx` (and export from auth index if present)
- **Description:** Dialog with email input, submit sends magic link via `signInWithOtp`, shows “Check your email” and cooldown/resend if desired. Used by Login page.
- **Dependencies:** Step 1.

### Step 6: Navbar auth state and logout
- **Files:** `src/components/layout/Navbar.tsx`
- **Description:** Use Supabase `getSession` / `onAuthStateChange` (or a small `useAuth` hook) to read current user. Show user email in dropdown when signed in; “Log out” calls `signOut()` from auth and redirects to `/`. When not signed in, show Login/Signup links if on dashboard layout (or keep current behavior for dashboard: RequireVerified already redirects to login).
- **Dependencies:** Step 1.

### Step 7: Profile logout and session copy
- **Files:** `src/pages/Profile.tsx`, `src/lib/profile.ts`
- **Description:** Logout already calls `signOut` and removes `auth_token`; ensure redirect to `/` or `/login`. In Security section, clarify “Revoke other sessions” with copy: “To sign out on other devices, change your password” and link to `/forgot-password`. Optionally keep “Revoke other sessions” button that shows this explanation in a dialog.
- **Dependencies:** None.

### Step 8: AuthLayout header/footer
- **Files:** `src/components/layout/AuthLayout.tsx`
- **Description:** Ensure footer has Security/Privacy/Terms links (already present on Login/Signup). No structural change if already present.
- **Dependencies:** None.

## Data / API Changes

- **DB:** New migration adding trigger on `auth.users` → insert into `profiles`.
- **Auth:** No new API routes; all via `@supabase/supabase-js` (signUp, signInWithPassword, signInWithOtp, signInWithOAuth, signOut, getSession, resetPasswordForEmail, updateUser).

## Testing / Validation

1. **Signup:** Open /signup, submit email + password (+ optional full name); confirm “Check your email” and that Supabase sends confirmation; click magic link → land on app with session; profile row exists.
2. **Login:** Open /login, submit email/password → redirect to dashboard or verify-email; “Continue with Google” redirects to Google and back; “Send magic link” sends email, click link → logged in.
3. **Session:** Open /dashboard/profile; see “Active sessions” (current device); “Revoke other sessions” shows explanation and link to change password.
4. **Logout:** From Navbar or Profile, click Log out → session cleared, redirect to home or login.
5. **Guards:** Unauthenticated access to /dashboard redirects to /login; unverified user redirects to /verify-email.

## Notes / Risks

- **Redirect URLs:** Supabase project must have Site URL and Redirect URLs configured (e.g. `http://localhost:5173`, `http://localhost:5173/dashboard`, `http://localhost:5173/verify-email`) for OAuth and magic links.
- **Google OAuth:** Enable Google provider in Supabase Dashboard and set client ID/secret.
- **Session storage:** Supabase default is localStorage; acceptable for this SPA. HttpOnly cookies would require a backend proxy.
- **Multi-session revoke:** Supabase JS client cannot list or revoke other devices’ sessions; “change password” invalidates other sessions. Future: Edge Function using Admin API to revoke by user.
