/**
 * Web Agent Approval Dialog: confirm step at checkpoint (editable fields, approve/reject).
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { WebAgentRunStep, WebAgentStepApproval, WebAgentApprovalStatus } from '@/types/webAgent'

export interface WebAgentApprovalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  step: WebAgentRunStep | null
  approval: WebAgentStepApproval | null
  onApprove: (payload: Record<string, unknown>, decisionNote?: string) => void
  onReject: (decisionNote?: string) => void
  isSubmitting?: boolean
}

const STATUS_OPTIONS: { value: WebAgentApprovalStatus; label: string }[] = [
  { value: 'approved', label: 'Approve' },
  { value: 'rejected', label: 'Reject' },
]

export function WebAgentApprovalDialog({
  open,
  onOpenChange,
  step,
  approval,
  onApprove,
  onReject,
  isSubmitting = false,
}: WebAgentApprovalDialogProps) {
  const [decision, setDecision] = React.useState<WebAgentApprovalStatus>('approved')
  const [note, setNote] = React.useState('')
  const [editablePayload, setEditablePayload] = React.useState<Record<string, string>>({})

  React.useEffect(() => {
    if (step && open) {
      setDecision(approval?.status ?? 'approved')
      setNote(approval?.decision_note ?? '')
      const payload = (step.payload || approval?.payload || {}) as Record<string, unknown>
      const asStrings: Record<string, string> = {}
      for (const [k, v] of Object.entries(payload)) {
        asStrings[k] = typeof v === 'string' ? v : String(v ?? '')
      }
      setEditablePayload(asStrings)
    }
  }, [step, approval, open])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const payload: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(editablePayload)) {
      payload[k] = v
    }
    if (decision === 'approved') {
      onApprove(payload, note.trim() || undefined)
    } else {
      onReject(note.trim() || undefined)
    }
    onOpenChange(false)
  }

  if (!step) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-border bg-card">
        <DialogHeader>
          <DialogTitle className="text-foreground">Approval checkpoint</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Step: {step.description || `Step ${step.step_index + 1}`}. Review and confirm
            or reject to continue.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {Object.keys(editablePayload).length > 0 && (
            <div className="space-y-2">
              <Label className="text-foreground">Editable fields</Label>
              <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-3">
                {Object.entries(editablePayload).map(([key, value]) => (
                  <div key={key} className="space-y-1">
                    <Label
                      htmlFor={`payload-${key}`}
                      className="text-xs text-muted-foreground capitalize"
                    >
                      {key.replace(/_/g, ' ')}
                    </Label>
                    <Input
                      id={`payload-${key}`}
                      value={value}
                      onChange={(e) =>
                        setEditablePayload((prev) => ({ ...prev, [key]: e.target.value }))
                      }
                      className="border-border bg-background text-foreground"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="decision" className="text-foreground">
              Decision
            </Label>
            <Select value={decision} onValueChange={(v) => setDecision(v as WebAgentApprovalStatus)}>
              <SelectTrigger
                id="decision"
                className="border-border bg-background text-foreground"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="note" className="text-foreground">
              Note (optional)
            </Label>
            <Input
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note for the audit trail"
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
              disabled={isSubmitting}
              className="bg-primary text-primary-foreground hover:bg-primary/90 transition-transform hover:scale-[1.02]"
            >
              {isSubmitting ? 'Submitting…' : decision === 'approved' ? 'Approve' : 'Reject'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
