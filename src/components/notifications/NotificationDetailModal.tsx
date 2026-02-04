import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { formatDistanceToNow } from 'date-fns'
import { Check, Trash2 } from 'lucide-react'
import type { Notification } from '@/types/notification'
import { useMarkNotificationRead, useDeleteNotification } from '@/hooks/useNotifications'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

export interface NotificationDetailModalProps {
  notification: Notification | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NotificationDetailModal({
  notification,
  open,
  onOpenChange,
}: NotificationDetailModalProps) {
  const markRead = useMarkNotificationRead()
  const deleteNotification = useDeleteNotification()

  if (!notification) return null

  const handleMarkRead = () => {
    if (notification.status === 'unread') {
      markRead.mutate(notification.id, {
        onSuccess: () => onOpenChange(false),
      })
    } else {
      onOpenChange(false)
    }
  }

  const handleDelete = () => {
    deleteNotification.mutate(notification.id, {
      onSuccess: () => onOpenChange(false),
    })
  }

  const timeAgo = formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="border-border bg-card text-foreground"
        aria-describedby="notification-detail-description"
      >
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {notification.title ?? notification.type.replace(/_/g, ' ')}
          </DialogTitle>
          <DialogDescription id="notification-detail-description" className="text-muted-foreground">
            {timeAgo}
          </DialogDescription>
        </DialogHeader>
        <div className="py-2">
          <p className={cn('text-sm', notification.status === 'unread' && 'font-medium text-foreground')}>
            {notification.content}
          </p>
          {notification.link && (
            <Link
              to={notification.link}
              className="mt-2 inline-block text-sm text-primary hover:underline"
              onClick={() => onOpenChange(false)}
            >
              View details
            </Link>
          )}
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          {notification.status === 'unread' && (
            <Button
              variant="outline"
              size="sm"
              className="transition-transform hover:scale-[1.02]"
              onClick={handleMarkRead}
              disabled={markRead.isPending}
            >
              <Check className="mr-2 h-4 w-4" />
              Mark as read
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={handleDelete}
            disabled={deleteNotification.isPending}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
