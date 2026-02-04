import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell, CheckCheck, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from '@/hooks/useNotifications'
import { NotificationDetailModal } from './NotificationDetailModal'
import type { Notification } from '@/types/notification'

const NOTIFICATION_PREVIEW_LIMIT = 8

function NotificationItem({
  notification,
  onSelect,
  onMarkRead,
  onCloseDropdown,
}: {
  notification: Notification
  onSelect: () => void
  onMarkRead: () => void
  onCloseDropdown?: () => void
}) {
  const timeAgo = formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })

  return (
    <div
      role="button"
      tabIndex={0}
      className={cn(
        'flex flex-col gap-1 border-b border-border px-4 py-3 text-left transition-colors last:border-0 hover:bg-card/80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background',
        notification.status === 'unread' && 'bg-primary/5'
      )}
      onClick={() => {
        onSelect()
        if (notification.status === 'unread') onMarkRead()
        onCloseDropdown?.()
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect()
          if (notification.status === 'unread') onMarkRead()
          onCloseDropdown?.()
        }
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <p className={cn('line-clamp-1 text-sm', notification.status === 'unread' && 'font-medium text-foreground')}>
          {notification.title ?? notification.type.replace(/_/g, ' ')}
        </p>
        <span className="shrink-0 text-xs text-muted-foreground">{timeAgo}</span>
      </div>
      <p className="line-clamp-2 text-xs text-muted-foreground">{notification.content}</p>
    </div>
  )
}

export function NotificationCenter() {
  const [open, setOpen] = useState(false)
  const [detailId, setDetailId] = useState<string | null>(null)

  const { data: notifications = [], isLoading } = useNotifications({
    limit: NOTIFICATION_PREVIEW_LIMIT,
  })
  const markRead = useMarkNotificationRead()
  const markAllRead = useMarkAllNotificationsRead()

  const unreadCount = notifications.filter((n) => n.status === 'unread').length
  const selectedNotification = notifications.find((n) => n.id === detailId) ?? null

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-[380px] border-border bg-card p-0"
          align="end"
          sideOffset={8}
          forceMount
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs text-muted-foreground hover:text-foreground"
                  onClick={(e) => {
                    e.preventDefault()
                    markAllRead.mutate()
                  }}
                  disabled={markAllRead.isPending}
                >
                  {markAllRead.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <>
                      <CheckCheck className="mr-1 h-3.5 w-3.5" />
                      Mark all read
                    </>
                  )}
                </Button>
              )}
              <Button variant="ghost" size="sm" asChild className="h-8 text-xs">
                <Link to="/dashboard/notifications" onClick={() => setOpen(false)}>
                  View all
                </Link>
              </Button>
            </div>
          </div>
          <ScrollArea className="h-[320px]">
            {isLoading ? (
              <div className="space-y-2 p-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-md bg-muted" />
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                <Bell className="h-10 w-10 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No notifications yet</p>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/dashboard/notifications" onClick={() => setOpen(false)}>
                    Open notification center
                  </Link>
                </Button>
              </div>
            ) : (
              notifications.map((n) => (
                <NotificationItem
                  key={n.id}
                  notification={n}
                  onSelect={() => setDetailId(n.id)}
                  onMarkRead={() => markRead.mutate(n.id)}
                  onCloseDropdown={() => setOpen(false)}
                />
              ))
            )}
          </ScrollArea>
        </DropdownMenuContent>
      </DropdownMenu>
      <NotificationDetailModal
        notification={selectedNotification}
        open={!!detailId}
        onOpenChange={(isOpen) => {
          if (!isOpen) setDetailId(null)
        }}
      />
    </>
  )
}
