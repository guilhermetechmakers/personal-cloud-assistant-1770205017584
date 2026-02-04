import { useState } from 'react'
import { Bell, CheckCheck, Loader2, Settings2, Trash2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { AnimatedPage } from '@/components/layout/AnimatedPage'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useDeleteNotification,
} from '@/hooks/useNotifications'
import { NotificationDetailModal, NotificationPreferencesForm } from '@/components/notifications'
import type { Notification } from '@/types/notification'

function NotificationRow({
  notification,
  onOpenDetail,
  onMarkRead,
  onDelete,
}: {
  notification: Notification
  onOpenDetail: () => void
  onMarkRead: () => void
  onDelete: () => void
}) {
  const timeAgo = formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })

  return (
    <div
      className={cn(
        'flex items-start justify-between gap-4 rounded-lg border border-border bg-card p-4 transition-shadow duration-200 hover:shadow-card',
        notification.status === 'unread' && 'border-primary/30 bg-primary/5'
      )}
    >
      <button
        type="button"
        className="flex-1 text-left focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background rounded-md"
        onClick={() => {
          onOpenDetail()
          if (notification.status === 'unread') onMarkRead()
        }}
      >
        <div className="flex items-start justify-between gap-2">
          <p className={cn('font-medium text-foreground', notification.status === 'unread' && 'font-semibold')}>
            {notification.title ?? notification.type.replace(/_/g, ' ')}
          </p>
          <span className="shrink-0 text-xs text-muted-foreground">{timeAgo}</span>
        </div>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{notification.content}</p>
      </button>
      <div className="flex shrink-0 items-center gap-1">
        {notification.status === 'unread' && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation()
              onMarkRead()
            }}
            aria-label="Mark as read"
          >
            <CheckCheck className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          aria-label="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

function NotificationList({ filter }: { filter: 'all' | 'unread' }) {
  const { data: notifications = [], isLoading } = useNotifications(
    filter === 'unread' ? { status: 'unread' } : undefined
  )
  const markRead = useMarkNotificationRead()
  const markAllRead = useMarkAllNotificationsRead()
  const deleteNotification = useDeleteNotification()
  const [detailId, setDetailId] = useState<string | null>(null)

  const selectedNotification = notifications.find((n) => n.id === detailId) ?? null
  const unreadCount = notifications.filter((n) => n.status === 'unread').length

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg bg-muted" />
        ))}
      </div>
    )
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Bell className="mb-4 h-12 w-12 text-muted-foreground" />
        <p className="text-sm font-medium text-foreground">No notifications</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {filter === 'unread' ? "You're all caught up." : 'Notifications will appear here.'}
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        {unreadCount > 0 && filter === 'all' && (
          <Button
            variant="outline"
            size="sm"
            className="transition-transform hover:scale-[1.02]"
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
          >
            {markAllRead.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CheckCheck className="mr-2 h-4 w-4" />
            )}
            Mark all read
          </Button>
        )}
      </div>
      <ScrollArea className="h-[calc(100vh-20rem)]">
        <div className="space-y-3 pr-4">
          {notifications.map((n) => (
            <NotificationRow
              key={n.id}
              notification={n}
              onOpenDetail={() => setDetailId(n.id)}
              onMarkRead={() => markRead.mutate(n.id)}
              onDelete={() => deleteNotification.mutate(n.id)}
            />
          ))}
        </div>
      </ScrollArea>
      <NotificationDetailModal
        notification={selectedNotification}
        open={!!detailId}
        onOpenChange={(open) => {
          if (!open) setDetailId(null)
        }}
      />
    </>
  )
}

export function Notifications() {
  const [showSettings, setShowSettings] = useState(false)

  return (
    <AnimatedPage>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
            <p className="text-muted-foreground">
              View and manage your notifications and preferences
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-fit transition-transform hover:scale-[1.02]"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings2 className="mr-2 h-4 w-4" />
            {showSettings ? 'Hide settings' : 'Notification settings'}
          </Button>
        </div>

        {showSettings && (
          <NotificationPreferencesForm />
        )}

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Notification center</CardTitle>
            <CardDescription className="text-muted-foreground">
              All, Unread
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="mb-4 border border-border bg-muted/50">
                <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  All
                </TabsTrigger>
                <TabsTrigger value="unread" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Unread
                </TabsTrigger>
              </TabsList>
              <TabsContent value="all">
                <NotificationList filter="all" />
              </TabsContent>
              <TabsContent value="unread">
                <NotificationList filter="unread" />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AnimatedPage>
  )
}
