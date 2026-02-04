/**
 * Audit Log Viewer: browse historical approval decisions and comments.
 */

import * as React from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { ApprovalAuditLog } from '@/types/approval'
import { format } from 'date-fns'
import { History, CheckCircle2, XCircle, Undo2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface AuditLogViewerProps {
  logs: ApprovalAuditLog[]
  isLoading?: boolean
  emptyMessage?: string
  className?: string
}

const decisionConfig: Record<
  ApprovalAuditLog['decision'],
  { label: string; icon: React.ElementType; className: string }
> = {
  approved: {
    label: 'Approved',
    icon: CheckCircle2,
    className: 'text-success',
  },
  rejected: {
    label: 'Rejected',
    icon: XCircle,
    className: 'text-destructive',
  },
  undo: {
    label: 'Undone',
    icon: Undo2,
    className: 'text-muted-foreground',
  },
}

export function AuditLogViewer({
  logs,
  isLoading = false,
  emptyMessage = 'No audit history yet.',
  className,
}: AuditLogViewerProps) {
  return (
    <Card className={cn('border-border bg-card', className)}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-primary" aria-hidden />
          <CardTitle className="text-lg font-semibold text-foreground">
            Approval history
          </CardTitle>
        </div>
        <CardDescription className="text-muted-foreground">
          Decisions and comments for this approval.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-14 rounded-lg bg-muted/50 animate-pulse"
                aria-hidden
              />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            {emptyMessage}
          </p>
        ) : (
          <ScrollArea className="h-[240px] pr-4">
            <ul className="space-y-3" role="list">
              {logs.map((log) => {
                const config = decisionConfig[log.decision]
                const Icon = config.icon
                return (
                  <li
                    key={log.id}
                    className={cn(
                      'flex items-start gap-3 rounded-lg border border-border bg-muted/20 p-3 transition-colors'
                    )}
                  >
                    <Icon
                      className={cn('h-4 w-4 shrink-0 mt-0.5', config.className)}
                      aria-hidden
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {config.label}
                        {log.user_id && (
                          <span className="text-muted-foreground font-normal">
                            {' '}
                            — {log.user_id.slice(0, 8)}…
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {format(new Date(log.created_at), 'PPp')}
                      </p>
                      {log.comments && (
                        <p className="text-sm text-muted-foreground mt-2 border-l-2 border-border pl-2">
                          {log.comments}
                        </p>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
