/**
 * Undo Dialog: confirm reverting an approved action (set back to pending).
 */

import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import type { RunApproval } from '@/types/run'
import { Undo2, Loader2 } from 'lucide-react'

export interface UndoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  approval: RunApproval | null
  onUndo: (comments?: string) => Promise<void>
  isSubmitting?: boolean
}

export function UndoDialog({
  open,
  onOpenChange,
  approval,
  onUndo,
  isSubmitting = false,
}: UndoDialogProps) {
  const [comments, setComments] = React.useState('')

  React.useEffect(() => {
    if (open) setComments('')
  }, [open])

  const handleUndo = (e: React.FormEvent) => {
    e.preventDefault()
    onUndo(comments.trim() || undefined).then(() => onOpenChange(false))
  }

  if (!approval) return null

  const canUndo = approval.decision === 'approved'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md border-border bg-card text-foreground"
        aria-describedby="undo-description"
      >
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Undo2 className="h-5 w-5 text-warning" aria-hidden />
            <DialogTitle className="text-lg font-semibold">
              Undo approval
            </DialogTitle>
          </div>
          <DialogDescription id="undo-description" className="text-muted-foreground">
            This will set the approval back to &quot;pending&quot; so someone can review it
            again. The action will not be executed (or will be reverted) according to your
            run policy. This change will be recorded in the audit log.
          </DialogDescription>
        </DialogHeader>

        {canUndo ? (
          <form onSubmit={handleUndo} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="undo-comments" className="text-sm text-foreground">
                Reason (optional)
              </Label>
              <Input
                id="undo-comments"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="e.g. Incorrect slot selected"
                className="border-border bg-background text-foreground"
              />
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-border"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="secondary"
                disabled={isSubmitting}
                className="bg-warning/20 text-warning hover:bg-warning/30 transition-transform hover:scale-[1.02]"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Undo2 className="h-4 w-4 mr-1.5" />
                    Undo approval
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <p className="text-sm text-muted-foreground">
            Only approved actions can be undone. This approval is currently &quot;
            {approval.decision}&quot;.
          </p>
        )}
      </DialogContent>
    </Dialog>
  )
}
