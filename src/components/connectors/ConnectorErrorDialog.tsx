/**
 * Connector Error Dialog: actionable error when a connector fails.
 * Shows message, Reconnect CTA, and link to support.
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw, HelpCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

export interface ConnectorErrorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  connectorName: string
  message?: string
  onReconnect?: () => void
  isReconnecting?: boolean
}

export function ConnectorErrorDialog({
  open,
  onOpenChange,
  connectorName,
  message = 'The connection to this service failed or the token expired.',
  onReconnect,
  isReconnecting = false,
}: ConnectorErrorDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showClose
        className="border-border bg-card sm:max-w-md"
        aria-describedby="connector-error-description"
      >
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-destructive/15 text-destructive"
              aria-hidden
            >
              <AlertCircle className="h-5 w-5" />
            </span>
            <div>
              <DialogTitle className="text-foreground">
                {connectorName} connection error
              </DialogTitle>
              <DialogDescription id="connector-error-description" className="text-muted-foreground">
                {message}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-between">
          <Button
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
            asChild
          >
            <Link to="/help" className={cn('inline-flex items-center gap-2')}>
              <HelpCircle className="h-4 w-4" aria-hidden />
              Get help
            </Link>
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Dismiss
            </Button>
            {onReconnect && (
              <Button
                size="sm"
                disabled={isReconnecting}
                onClick={() => {
                  onReconnect()
                  onOpenChange(false)
                }}
                className="inline-flex items-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isReconnecting ? (
                  <RefreshCw className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <RefreshCw className="h-4 w-4" aria-hidden />
                )}
                Reconnect
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
