/**
 * Rule Creation Form: define criteria and action type for auto-approval rules.
 */

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { ApprovalRuleInsert } from '@/types/approval'
import { ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

const ruleFormSchema = z.object({
  name: z.string().min(1, 'Rule name is required').max(120),
  action_type: z.string().min(1, 'Action type is required'),
  criteria_key: z.string().optional(),
  criteria_value: z.string().optional(),
})

type RuleFormValues = z.infer<typeof ruleFormSchema>

export interface RuleCreationFormProps {
  userId: string
  defaultActionType?: string
  defaultName?: string
  onSubmit: (payload: ApprovalRuleInsert) => void
  onCancel?: () => void
  isSubmitting?: boolean
  className?: string
}

const ACTION_TYPES = [
  'send_email',
  'create_calendar_event',
  'book_reservation',
  'submit_form',
  'other',
]

export function RuleCreationForm({
  userId,
  defaultActionType = '',
  defaultName = '',
  onSubmit,
  onCancel,
  isSubmitting = false,
  className,
}: RuleCreationFormProps) {
  const form = useForm<RuleFormValues>({
    resolver: zodResolver(ruleFormSchema),
    defaultValues: {
      name: defaultName || 'Auto-approve rule',
      action_type: defaultActionType || ACTION_TYPES[0],
      criteria_key: '',
      criteria_value: '',
    },
  })

  const handleSubmit = form.handleSubmit((values) => {
    const criteria: Record<string, unknown> = {}
    if (values.criteria_key?.trim()) {
      criteria[values.criteria_key.trim()] = values.criteria_value?.trim() ?? ''
    }
    onSubmit({
      user_id: userId,
      name: values.name,
      action_type: values.action_type,
      criteria: Object.keys(criteria).length > 0 ? criteria : { action_type: values.action_type },
    })
  })

  return (
    <Card className={cn('border-border bg-card', className)}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" aria-hidden />
          <CardTitle className="text-lg font-semibold text-foreground">
            Create approval rule
          </CardTitle>
        </div>
        <CardDescription className="text-muted-foreground">
          Define criteria so future matching actions are auto-approved.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rule-name" className="text-foreground">
              Rule name
            </Label>
            <Input
              id="rule-name"
              {...form.register('name')}
              placeholder="e.g. Auto-approve calendar invites"
              className="border-border bg-background text-foreground"
            />
            {form.formState.errors.name && (
              <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="action-type" className="text-foreground">
              Action type
            </Label>
            <Select
              value={form.watch('action_type')}
              onValueChange={(v) => form.setValue('action_type', v)}
            >
              <SelectTrigger
                id="action-type"
                className="border-border bg-background text-foreground"
              >
                <SelectValue placeholder="Select action type" />
              </SelectTrigger>
              <SelectContent>
                {ACTION_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t.replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="criteria-key" className="text-foreground text-xs">
                Criteria key (optional)
              </Label>
              <Input
                id="criteria-key"
                {...form.register('criteria_key')}
                placeholder="e.g. skill_id"
                className="border-border bg-background text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="criteria-value" className="text-foreground text-xs">
                Criteria value
              </Label>
              <Input
                id="criteria-value"
                {...form.register('criteria_value')}
                placeholder="e.g. abc-123"
                className="border-border bg-background text-foreground"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="border-border"
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary text-primary-foreground hover:bg-primary/90 transition-transform hover:scale-[1.02]"
            >
              {isSubmitting ? 'Creating…' : 'Create rule'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
