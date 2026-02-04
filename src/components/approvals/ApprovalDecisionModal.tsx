/**
 * Approval Decision Modal: checkout-style UI for reviewing and deciding on an approval.
 * Supports Approve Once, Create Rule (for future auto-approvals), and Reject.
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
import { Checkbox } from '@/components/ui/checkbox'
import type { RunApproval } from '@/types/run'
import type { ApprovalDecisionPayload } from '@/types/approval'
import { CheckCircle2, XCircle, Shield, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ApprovalDecisionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  approval: RunApproval | null
  workflowName?: string
  onDecision: (payload: ApprovalDecisionPayload) => Promise<void>
  isSubmitting?: boolean
}

export function ApprovalDecisionModal({
  open,
  onOpenChange,
  approval,
  workflowName,
  onDecision,
  isSubmitting = false,
}: ApprovalDecisionModalProps) {
  const [editablePayload, setEditablePayload] = React.useState<Record<string, string>>({})
  const [comments, setComments] = React.useState('')
  const [createRule, setCreateRule] = React.useState(false)
  const [ruleName, setRuleName] = React.useState('')

  React.useEffect(() => {
    if (approval && open) {
      const payload = approval.payload ?? {}
      const asStrings: Record<string, string> = {}
      for (const [k, v] of Object.entries(payload)) {
        asStrings[k] = typeof v === 'string' ? v : JSON.stringify(v ?? '')
      }
      setEditablePayload(asStrings)
      setComments('')
      setCreateRule(false)
      setRuleName(`Auto-approve: ${approval.requested_action}`)
    }
  }, [approval, open])

  const handleApproveOnce = (e: React.FormEvent) => {
    e.preventDefault()
    const payload: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(editablePayload)) {
      try {
        payload[k] = JSON.parse(v)
      } catch {
        payload[k] = v
      }
    }
    onDecision({
      decision: 'approved',
      payload: Object.keys(payload).length > 0 ? payload : undefined,
      comments: comments.trim() || undefined,
      create_rule: false,
    }).then(() => onOpenChange(false))
  }

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault()
    const payload: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(editablePayload)) {
      try {
        payload[k] = JSON.parse(v)
      } catch {
        payload[k] = v
      }
    }
    onDecision({
      decision: 'approved',
      payload: Object.keys(payload).length > 0 ? payload : undefined,
      comments: comments.trim() || undefined,
      create_rule: true,
      rule_name: ruleName.trim() || `Rule for ${approval?.requested_action ?? 'action'}`,
      rule_criteria: { requested_action: approval?.requested_action ?? '', ...payload },
    }).then(() => onOpenChange(false))
  }

  const handleReject = (e: React.FormEvent) => {
    e.preventDefault()
    onDecision({
      decision: 'rejected',
      comments: comments.trim() || undefined,
    }).then(() => onOpenChange(false))
  }

  if (!approval) return null

  const isPending = approval.decision === 'pending'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-lg border-border bg-card text-foreground"
        aria-describedby="approval-description"
      >
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" aria-hidden />
            <DialogTitle className="text-lg font-semibold">
              {workflowName ?? 'Approval'} — {approval.requested_action}
            </DialogTitle>
          </div>
          <DialogDescription id="approval-description" className="text-muted-foreground">
            Review the action details below. Edit key fields if needed, then approve once,
            create a rule for future approvals, or reject.
          </DialogDescription>
          <div className="flex items-center gap-2 pt-1">
            <span
              className={cn(
                'rounded px-2 py-0.5 text-xs font-medium',
                isPending
                  ? 'bg-warning/20 text-warning'
                  : approval.decision === 'approved'
                    ? 'bg-success/20 text-success'
                    : 'bg-destructive/20 text-destructive'
              )}
            >
              {approval.decision}
            </span>
          </div>
        </DialogHeader>

        <form
          id="approval-decision-form"
          onSubmit={(e) => e.preventDefault()}
          className="space-y-4"
        >
          {Object.keys(editablePayload).length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">
                Editable fields
              </Label>
              <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-3">
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
                      className="border-border bg-background text-foreground focus:ring-2 focus:ring-ring"
                      disabled={!isPending}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="approval-comments" className="text-sm text-foreground">
              Comment (optional)
            </Label>
            <Input
              id="approval-comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Add a note for the audit trail"
              className="border-border bg-background text-foreground"
              disabled={!isPending}
            />
          </div>

          {isPending && (
            <div className="flex items-center space-x-2 rounded-lg border border-border bg-muted/20 p-3">
              <Checkbox
                id="create-rule"
                checked={createRule}
                onCheckedChange={(checked) => setCreateRule(checked === true)}
                className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <Label
                htmlFor="create-rule"
                className="text-sm font-medium text-foreground cursor-pointer"
              >
                Create rule for future approvals
              </Label>
            </div>
          )}

          {isPending && createRule && (
            <div className="space-y-2">
              <Label htmlFor="rule-name" className="text-sm text-foreground">
                Rule name
              </Label>
              <Input
                id="rule-name"
                value={ruleName}
                onChange={(e) => setRuleName(e.target.value)}
                placeholder="e.g. Auto-approve booking confirmations"
                className="border-border bg-background text-foreground"
              />
            </div>
          )}
        </form>

        <DialogFooter className="gap-2 sm:gap-0 flex-wrap">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-border"
          >
            Cancel
          </Button>
          {isPending && (
            <>
              <Button
                type="button"
                variant="destructive"
                onClick={handleReject}
                disabled={isSubmitting}
                className="transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <XCircle className="h-4 w-4 mr-1.5" />
                    Reject
                  </>
                )}
              </Button>
              <Button
                type="button"
                onClick={createRule ? handleCreateRule : handleApproveOnce}
                disabled={isSubmitting}
                className="bg-primary text-primary-foreground hover:bg-primary/90 transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-1.5" />
                    {createRule ? 'Approve & create rule' : 'Approve once'}
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
