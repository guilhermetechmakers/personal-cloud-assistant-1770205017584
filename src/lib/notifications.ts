/**
 * Notifications & Alerts: list, mark read, delete; preference CRUD.
 * Uses Supabase when configured.
 */

import { supabase } from '@/lib/supabase'
import type {
  Notification,
  NotificationInsert,
  NotificationUpdate,
  NotificationPreference,
  NotificationPreferenceInsert,
  NotificationPreferenceUpdate,
} from '@/types/notification'

async function getAuthUserId(): Promise<string | null> {
  if (!supabase) return null
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) return null
  return user.id
}

/** List notifications for the current user; optional filter by status */
export async function listNotifications(options?: {
  status?: 'unread' | 'read'
  limit?: number
}): Promise<Notification[]> {
  if (!supabase) return []
  const userId = await getAuthUserId()
  if (!userId) return []
  let q = supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (options?.status) q = q.eq('status', options.status)
  if (options?.limit) q = q.limit(options.limit)
  const { data, error } = await q
  if (error) return []
  return (data ?? []) as Notification[]
}

/** Get a single notification by id */
export async function getNotification(id: string): Promise<Notification | null> {
  if (!supabase) return null
  const userId = await getAuthUserId()
  if (!userId) return null
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single()
  if (error) return null
  return data as Notification
}

/** Create a notification (e.g. from backend/dispatcher; user_id must match auth) */
export async function createNotification(
  payload: NotificationInsert
): Promise<Notification | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('notifications')
    .insert(payload)
    .select()
    .single()
  if (error) return null
  return data as Notification
}

/** Mark a notification as read */
export async function markNotificationRead(id: string): Promise<Notification | null> {
  if (!supabase) return null
  const userId = await getAuthUserId()
  if (!userId) return null
  const { data, error } = await supabase
    .from('notifications')
    .update({ status: 'read', read_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()
  if (error) return null
  return data as Notification
}

/** Mark all notifications as read */
export async function markAllNotificationsRead(): Promise<boolean> {
  if (!supabase) return false
  const userId = await getAuthUserId()
  if (!userId) return false
  const { error } = await supabase
    .from('notifications')
    .update({ status: 'read', read_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('status', 'unread')
  return !error
}

/** Update notification (e.g. status) */
export async function updateNotification(
  id: string,
  updates: NotificationUpdate
): Promise<Notification | null> {
  if (!supabase) return null
  const userId = await getAuthUserId()
  if (!userId) return null
  const { data, error } = await supabase
    .from('notifications')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()
  if (error) return null
  return data as Notification
}

/** Delete a notification */
export async function deleteNotification(id: string): Promise<boolean> {
  if (!supabase) return false
  const userId = await getAuthUserId()
  if (!userId) return false
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
  return !error
}

/** List notification preferences for the current user */
export async function listNotificationPreferences(): Promise<NotificationPreference[]> {
  if (!supabase) return []
  const userId = await getAuthUserId()
  if (!userId) return []
  const { data, error } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('user_id', userId)
    .order('event_type')
  if (error) return []
  return (data ?? []) as NotificationPreference[]
}

/** Upsert a notification preference (by user_id, channel, event_type) */
export async function upsertNotificationPreference(
  payload: NotificationPreferenceInsert
): Promise<NotificationPreference | null> {
  if (!supabase) return null
  const userId = await getAuthUserId()
  if (!userId) return null
  const row = { ...payload, user_id: userId }
  const { data, error } = await supabase
    .from('notification_preferences')
    .upsert(row, {
      onConflict: 'user_id,channel,event_type',
      ignoreDuplicates: false,
    })
    .select()
    .single()
  if (error) return null
  return data as NotificationPreference
}

/** Update a notification preference */
export async function updateNotificationPreference(
  id: string,
  updates: NotificationPreferenceUpdate
): Promise<NotificationPreference | null> {
  if (!supabase) return null
  const userId = await getAuthUserId()
  if (!userId) return null
  const { data, error } = await supabase
    .from('notification_preferences')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()
  if (error) return null
  return data as NotificationPreference
}

/** Bulk upsert preferences (replace all for user) */
export async function saveNotificationPreferences(
  items: Omit<NotificationPreferenceInsert, 'user_id'>[]
): Promise<NotificationPreference[]> {
  const userId = await getAuthUserId()
  if (!userId || !supabase) return []
  const rows = items.map((item) => ({ ...item, user_id: userId }))
  const { data, error } = await supabase
    .from('notification_preferences')
    .upsert(rows, {
      onConflict: 'user_id,channel,event_type',
      ignoreDuplicates: false,
    })
    .select()
  if (error) return []
  return (data ?? []) as NotificationPreference[]
}
