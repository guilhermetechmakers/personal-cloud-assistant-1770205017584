/**
 * Types for Notifications & Alerts: notifications and notification_preferences.
 * Aligns with notifications and notification_preferences tables.
 */

export type NotificationStatus = 'unread' | 'read'

export type NotificationType =
  | 'digest'
  | 'approval'
  | 'run_failure'
  | 'billing'
  | 'run_success'
  | 'system'

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string | null
  content: string
  status: NotificationStatus
  link: string | null
  metadata: Record<string, unknown>
  read_at: string | null
  created_at: string
}

export interface NotificationInsert {
  user_id: string
  type: NotificationType
  title?: string | null
  content: string
  status?: NotificationStatus
  link?: string | null
  metadata?: Record<string, unknown>
}

export interface NotificationUpdate {
  status?: NotificationStatus
  read_at?: string | null
}

export type NotificationRow = Notification

export type NotificationChannel = 'in_app' | 'email' | 'push'

export type NotificationEventType =
  | 'approval'
  | 'billing'
  | 'run_failure'
  | 'digest'
  | 'run_success'
  | 'system'

export interface NotificationPreference {
  id: string
  user_id: string
  channel: NotificationChannel
  event_type: NotificationEventType
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface NotificationPreferenceInsert {
  user_id: string
  channel: NotificationChannel
  event_type: NotificationEventType
  is_active?: boolean
}

export interface NotificationPreferenceUpdate {
  is_active?: boolean
}

export type NotificationPreferenceRow = NotificationPreference
