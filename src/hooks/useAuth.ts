/**
 * Auth state hook: current user and session from Supabase.
 */

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

export interface AuthState {
  user: User | null
  session: Session | null
  isLoading: boolean
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!supabase) {
      setUser(null)
      setSession(null)
      setIsLoading(false)
      return
    }

    let cancelled = false

    const update = (s: Session | null) => {
      if (cancelled) return
      setSession(s)
      setUser(s?.user ?? null)
      setIsLoading(false)
    }

    supabase.auth.getSession().then(({ data: { session: s } }) => update(s))

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      update(s)
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])

  return { user, session, isLoading }
}
