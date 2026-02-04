/**
 * Security Policy Form: default action level, allowed auto-run types, connectors whitelist.
 */

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Shield } from 'lucide-react'
import type { DefaultActionLevel, WorkspaceSecurityPolicy } from '@/types/workspace'
import { cn } from '@/lib/utils'

const securityPolicySchema = z.object({
  default_action_level: z.enum(['draft_only', 'requires_approval', 'always_allow']),
  allowed_manual: z.boolean(),
  allowed_schedule: z.boolean(),
  allowed_event: z.boolean(),
  connectors_whitelist: z.string(), // comma-separated for form; parsed to array on submit
})

export type SecurityPolicyFormValues = z.infer<typeof securityPolicySchema>

export interface SecurityPolicyFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  policy: WorkspaceSecurityPolicy | null | undefined
  isLoading?: boolean
  onSubmit: (values: {
    default_action_level: DefaultActionLevel
    allowed_auto_run_types: string[]
    connectors_whitelist: string[]
  }) => void
  isSubmitting?: boolean
  className?: string
}

const ACTION_LEVEL_OPTIONS: { value: DefaultActionLevel; label: string }[] = [
  { value: 'draft_only', label: 'Draft only' },
  { value: 'requires_approval', label: 'Requires approval' },
  { value: 'always_allow', label: 'Always allow' },
]

export function SecurityPolicyForm({
  open,
  onOpenChange,
  policy,
  isLoading,
  onSubmit,
  isSubmitting = false,
  className,
}: SecurityPolicyFormProps) {
  const form = useForm<SecurityPolicyFormValues>({
    resolver: zodResolver(securityPolicySchema),
    defaultValues: {
      default_action_level: policy?.default_action_level ?? 'requires_approval',
      allowed_manual: true,
      allowed_schedule: true,
      allowed_event: false,
      connectors_whitelist: (policy?.connectors_whitelist ?? []).join(', '),
    },
  })

  useEffect(() => {
    if (open && policy) {
      const types = policy.allowed_auto_run_types ?? []
      form.reset({
        default_action_level: policy.default_action_level,
        allowed_manual: types.includes('manual'),
        allowed_schedule: types.includes('schedule'),
        allowed_event: types.includes('event'),
        connectors_whitelist: (policy.connectors_whitelist ?? []).join(', '),
      })
    }
  }, [open, policy, form])

  const handleSubmit = form.handleSubmit((values) => {
    const allowed: string[] = []
    if (values.allowed_manual) allowed.push('manual')
    if (values.allowed_schedule) allowed.push('schedule')
    if (values.allowed_event) allowed.push('event')
    const connectors = values.connectors_whitelist
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    onSubmit({
      default_action_level: values.default_action_level as DefaultActionLevel,
      allowed_auto_run_types: allowed,
      connectors_whitelist: connectors,
    })
    onOpenChange(false)
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showClose
        className={cn('border-border bg-card sm:max-w-lg', className)}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Shield className="h-5 w-5 text-primary" aria-hidden />
            Security & Policies
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Set default approval level, allowed automation triggers, and connector whitelist.
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="space-y-4 py-4">
            <div className="h-10 rounded-md bg-muted animate-pulse" />
            <div className="h-24 rounded-md bg-muted animate-pulse" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="default_action_level" className="text-foreground">
                Default action level
              </Label>
              <Select
                value={form.watch('default_action_level')}
                onValueChange={(v) =>
                  form.setValue('default_action_level', v as DefaultActionLevel)
                }
              >
                <SelectTrigger
                  id="default_action_level"
                  className="border-border bg-background"
                >
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  {ACTION_LEVEL_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Applies to irreversible actions when no rule matches.
              </p>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Allowed auto-run types</Label>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                  <Checkbox
                    checked={form.watch('allowed_manual')}
                    onCheckedChange={(c) => form.setValue('allowed_manual', !!c)}
                    aria-label="Allow manual"
                  />
                  Manual
                </label>
                <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                  <Checkbox
                    checked={form.watch('allowed_schedule')}
                    onCheckedChange={(c) => form.setValue('allowed_schedule', !!c)}
                    aria-label="Allow schedule"
                  />
                  Schedule
                </label>
                <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                  <Checkbox
                    checked={form.watch('allowed_event')}
                    onCheckedChange={(c) => form.setValue('allowed_event', !!c)}
                    aria-label="Allow event"
                  />
                  Event
                </label>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="connectors_whitelist" className="text-foreground">
                Connectors whitelist
              </Label>
              <Input
                id="connectors_whitelist"
                placeholder="gmail, google_calendar, slack (comma-separated)"
                className="border-border bg-background"
                {...form.register('connectors_whitelist')}
              />
              <p className="text-xs text-muted-foreground">
                Leave empty to allow all connected connectors.
              </p>
            </div>
            <DialogFooter>
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
                {isSubmitting ? 'Saving…' : 'Save changes'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
