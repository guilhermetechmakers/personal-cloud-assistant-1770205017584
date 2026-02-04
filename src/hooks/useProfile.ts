/**
 * React Query hooks for profile and preferences.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  getProfileView,
  updateProfile,
  updatePreferences,
  getSessions,
  revokeOtherSessions,
  setTwoFaEnabled,
} from '@/lib/profile'
import type { ProfileUpdate, UserPreferencesUpdate } from '@/types/profile'

export const profileKeys = {
  view: ['profile', 'view'] as const,
  sessions: ['profile', 'sessions'] as const,
}

export function useProfileView() {
  return useQuery({
    queryKey: profileKeys.view,
    queryFn: getProfileView,
    staleTime: 1000 * 60 * 2,
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, updates }: { userId: string; updates: ProfileUpdate }) =>
      updateProfile(userId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.view })
      toast.success('Profile updated')
    },
    onError: () => {
      toast.error('Failed to update profile')
    },
  })
}

export function useUpdatePreferences() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, updates }: { userId: string; updates: UserPreferencesUpdate }) =>
      updatePreferences(userId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.view })
      toast.success('Preferences saved')
    },
    onError: () => {
      toast.error('Failed to save preferences')
    },
  })
}

export function useSessions() {
  return useQuery({
    queryKey: profileKeys.sessions,
    queryFn: getSessions,
  })
}

export function useRevokeOtherSessions() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: revokeOtherSessions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.sessions })
      toast.success('Other sessions will be revoked when you change your password.')
    },
  })
}

export function useSetTwoFaEnabled() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, enabled }: { userId: string; enabled: boolean }) =>
      setTwoFaEnabled(userId, enabled),
    onSuccess: (_, { enabled }) => {
      queryClient.invalidateQueries({ queryKey: profileKeys.view })
      toast.success(enabled ? 'Two-factor authentication enabled' : 'Two-factor authentication disabled')
    },
    onError: () => {
      toast.error('Failed to update 2FA setting')
    },
  })
}
