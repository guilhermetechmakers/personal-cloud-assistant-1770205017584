/**
 * Run Summary Dialog: display completed or canceled run details.
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { WebAgentRun, WebAgentRunStep } from '@/types/webAgent'
import { format } from 'date-fns'
import { CheckCircle, XCircle, Clock, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface RunSummaryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  run: WebAgentRun | null
  steps: WebAgentRunStep[]
  onClose: () => void
}

const statusConfig: Record<
  string,
  { label: string; className: string; icon: typeof CheckCircle }
> = {
  completed: {
    label: 'Completed',
    className: 'bg-success/20 text-success',
    icon: CheckCircle,
  },
  failed: {
    label: 'Failed',
    className: 'bg-destructive/20 text-destructive',
    icon: XCircle,
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-muted text-muted-foreground',
    icon: XCircle,
  },
  running: {
    label: 'Running',
    className: 'bg-primary/20 text-primary',
    icon: Clock,
  },
  paused: {
    label: 'Paused',
    className: 'bg-warning/20 text-warning',
    icon: Clock,
  },
  pending: {
    label: 'Pending',
    className: 'bg-muted text-muted-foreground',
    icon: Clock,
  },
}

export function RunSummaryDialog({
  open,
  onOpenChange,
  run,
  steps,
  onClose,
}: RunSummaryDialogProps) {
  if (!run) return null

  const config = statusConfig[run.status] ?? statusConfig.pending
  const Icon = config.icon

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg border-border bg-card">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <Icon className="h-5 w-5" />
            Run summary
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Run ID: {run.id.slice(0, 8)}… • {run.profile_type} profile
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                'rounded px-2 py-0.5 text-xs font-medium',
                config.className
              )}
            >
              {config.label}
            </span>
            {run.start_time && (
              <span className="text-xs text-muted-foreground">
                Started {format(new Date(run.start_time), 'PPp')}
              </span>
            )}
            {run.end_time && (
              <span className="text-xs text-muted-foreground">
                Ended {format(new Date(run.end_time), 'PPp')}
              </span>
            )}
          </div>
          {steps.length > 0 && (
            <div>
              <h4 className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                <FileText className="h-4 w-4" />
                Steps ({steps.length})
              </h4>
              <ScrollArea className="h-[200px] rounded-lg border border-border bg-muted/20 p-2">
                <ul className="space-y-2">
                  {steps.map((step, i) => (
                    <li
                      key={step.id}
                      className="flex items-start gap-2 rounded border border-border/50 bg-card p-2 text-sm"
                    >
                      <span className="text-muted-foreground">{i + 1}.</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-foreground">
                          {step.description || `Step ${step.step_index + 1}`}
                        </p>
                        <span
                          className={cn(
                            'mt-1 inline-block rounded px-1.5 py-0.5 text-xs',
                            step.status === 'completed' && 'bg-success/20 text-success',
                            step.status === 'failed' && 'bg-destructive/20 text-destructive',
                            step.status === 'awaiting_approval' &&
                              'bg-warning/20 text-warning',
                            !['completed', 'failed', 'awaiting_approval'].includes(
                              step.status
                            ) && 'bg-muted text-muted-foreground'
                          )}
                        >
                          {step.status}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </div>
          )}
        </div>
        <div className="flex justify-end">
          <Button
            type="button"
            onClick={() => {
              onClose()
              onOpenChange(false)
            }}
            className="bg-primary text-primary-foreground hover:bg-primary/90 transition-transform hover:scale-[1.02]"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
