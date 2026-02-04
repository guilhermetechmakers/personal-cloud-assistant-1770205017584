import { useEffect, useState, type ReactNode } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

interface RequireVerifiedProps {
  children: ReactNode
}

/**
 * Redirects unverified users to /verify-email when accessing protected routes.
 * When Supabase is not configured, allows access. When configured, requires
 * a signed-in user with email_confirmed_at set.
 */
export function RequireVerified({ children }: RequireVerifiedProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [allowed, setAllowed] = useState<boolean | null>(null)

  useEffect(() => {
    const client = supabase
    if (!client) {
      setAllowed(true)
      return
    }

    let cancelled = false

    const check = async () => {
      const { data: { user } } = await client.auth.getUser()
      if (cancelled) return
      if (!user) {
        navigate('/login', { state: { from: location }, replace: true })
        return
      }
      const verified = !!(user as { email_confirmed_at?: string }).email_confirmed_at
      if (!verified) {
        navigate('/verify-email', { state: { from: location }, replace: true })
        return
      }
      setAllowed(true)
    }

    check()
    const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
      if (cancelled) return
      if (!session) {
        navigate('/login', { state: { from: location }, replace: true })
        return
      }
      const verified = !!(session.user as { email_confirmed_at?: string }).email_confirmed_at
      if (!verified) {
        navigate('/verify-email', { state: { from: location }, replace: true })
        return
      }
      setAllowed(true)
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [navigate, location.pathname, location])

  if (allowed === null && supabase != null) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-pulse rounded-full bg-muted" aria-hidden />
        <span className="sr-only">Checking verification…</span>
      </div>
    )
  }

  if (allowed === true) {
    return <>{children}</>
  }

  return null
}
