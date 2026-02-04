/**
 * Approval Edit Modal: modify approval decision or rollback options.
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { RunApproval, RunApprovalUpdate, ApprovalDecision } from '@/types/run'

export interface ApprovalEditModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  approval: RunApproval | null
  onSave: (updates: RunApprovalUpdate) => void
  isSubmitting?: boolean
}

const decisionLabels: Record<ApprovalDecision, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
}

export function ApprovalEditModal({
  open,
  onOpenChange,
  approval,
  onSave,
  isSubmitting = false,
}: ApprovalEditModalProps) {
  const [decision, setDecision] = React.useState<ApprovalDecision>(
    approval?.decision ?? 'pending'
  )
  const [rollbackNote, setRollbackNote] = React.useState(
    approval?.rollback_options
      ? String((approval.rollback_options as { note?: string }).note ?? '')
      : ''
  )

  React.useEffect(() => {
    if (approval) {
      setDecision(approval.decision)
      setRollbackNote(
        approval.rollback_options
          ? String((approval.rollback_options as { note?: string }).note ?? '')
          : ''
      )
    }
  }, [approval])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    onSave({
      decision,
      rollback_options: rollbackNote.trim()
        ? { note: rollbackNote.trim() }
        : {},
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit approval</DialogTitle>
          <DialogDescription>
            {approval
              ? `Update decision or rollback options for: ${approval.requested_action}`
              : 'Update approval decision and rollback options.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="approval-decision">Decision</Label>
            <Select
              value={decision}
              onValueChange={(v) => setDecision(v as ApprovalDecision)}
            >
              <SelectTrigger id="approval-decision">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(
                  ['pending', 'approved', 'rejected'] as ApprovalDecision[]
                ).map((d) => (
                  <SelectItem key={d} value={d}>
                    {decisionLabels[d]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="rollback-note">Rollback note (optional)</Label>
            <textarea
              id="rollback-note"
              className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Reason or instructions for rollback"
              value={rollbackNote}
              onChange={(e) => setRollbackNote(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
