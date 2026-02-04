/**
 * React Query hooks for Notifications & Alerts: list, mark read, delete, preferences.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  listNotifications,
  getNotification,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  listNotificationPreferences,
  saveNotificationPreferences,
} from '@/lib/notifications'
import type { NotificationPreferenceInsert } from '@/types/notification'

export const notificationKeys = {
  all: (filters?: { status?: 'unread' | 'read'; limit?: number }) =>
    ['notifications', filters] as const,
  detail: (id: string) => ['notifications', 'detail', id] as const,
  preferences: ['notifications', 'preferences'] as const,
}

export function useNotifications(options?: {
  status?: 'unread' | 'read'
  limit?: number
}) {
  return useQuery({
    queryKey: notificationKeys.all(options),
    queryFn: () => listNotifications(options),
    staleTime: 1000 * 60,
  })
}

export function useNotification(id: string | null) {
  return useQuery({
    queryKey: notificationKeys.detail(id ?? ''),
    queryFn: () => (id ? getNotification(id) : Promise.resolve(null)),
    enabled: !!id,
    staleTime: 1000 * 60,
  })
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all() })
      queryClient.invalidateQueries({ queryKey: notificationKeys.detail(id) })
      toast.success('Marked as read')
    },
    onError: () => {
      toast.error('Failed to mark as read')
    },
  })
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all() })
      toast.success('All marked as read')
    },
    onError: () => {
      toast.error('Failed to mark all as read')
    },
  })
}

export function useDeleteNotification() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteNotification(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all() })
      queryClient.removeQueries({ queryKey: notificationKeys.detail(id) })
      toast.success('Notification deleted')
    },
    onError: () => {
      toast.error('Failed to delete notification')
    },
  })
}

export function useNotificationPreferences() {
  return useQuery({
    queryKey: notificationKeys.preferences,
    queryFn: listNotificationPreferences,
    staleTime: 1000 * 60,
  })
}

export function useSaveNotificationPreferences() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (items: Omit<NotificationPreferenceInsert, 'user_id'>[]) =>
      saveNotificationPreferences(items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.preferences })
      toast.success('Notification preferences saved')
    },
    onError: () => {
      toast.error('Failed to save preferences')
    },
  })
}
