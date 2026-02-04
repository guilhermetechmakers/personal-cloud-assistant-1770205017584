/**
 * Retention Policy Form: create or edit data retention rules.
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
import { Database } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { RetentionPolicyDataType, ActionOnExpiry } from '@/types/export'

const retentionFormSchema = z.object({
  data_type: z.enum(['runs', 'reports', 'audit_logs', 'screenshots']),
  retention_period_days: z.coerce.number().int().min(1, 'Must be at least 1 day'),
  action_on_expiry: z.enum(['purge', 'archive']),
})

type RetentionFormValues = z.infer<typeof retentionFormSchema>

const DATA_TYPES: { value: RetentionPolicyDataType; label: string }[] = [
  { value: 'runs', label: 'Runs' },
  { value: 'reports', label: 'Reports' },
  { value: 'audit_logs', label: 'Audit logs' },
  { value: 'screenshots', label: 'Screenshots' },
]

const ACTIONS: { value: ActionOnExpiry; label: string }[] = [
  { value: 'purge', label: 'Purge' },
  { value: 'archive', label: 'Archive' },
]

export interface RetentionPolicyFormProps {
  onSubmit: (payload: {
    data_type: RetentionPolicyDataType
    retention_period_days: number
    action_on_expiry: ActionOnExpiry
  }) => void
  onCancel?: () => void
  isSubmitting?: boolean
  className?: string
}

export function RetentionPolicyForm({
  onSubmit,
  onCancel,
  isSubmitting = false,
  className,
}: RetentionPolicyFormProps) {
  const form = useForm<RetentionFormValues>({
    resolver: zodResolver(retentionFormSchema),
    defaultValues: {
      data_type: 'runs',
      retention_period_days: 90,
      action_on_expiry: 'purge',
    },
  })

  const handleSubmit = form.handleSubmit((values) => {
    onSubmit({
      data_type: values.data_type as RetentionPolicyDataType,
      retention_period_days: values.retention_period_days,
      action_on_expiry: values.action_on_expiry as ActionOnExpiry,
    })
  })

  return (
    <Card className={cn('border-border bg-card', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Database className="h-5 w-5" />
          Retention policy
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Set retention period and action when data expires. Policies are applied by scheduled jobs.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="retention_data_type">Data type</Label>
            <Select
              value={form.watch('data_type')}
              onValueChange={(v) =>
                form.setValue('data_type', v as RetentionPolicyDataType)
              }
            >
              <SelectTrigger id="retention_data_type" className="border-border bg-card">
                <SelectValue placeholder="Select data type" />
              </SelectTrigger>
              <SelectContent>
                {DATA_TYPES.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="retention_period_days">Retention period (days)</Label>
            <Input
              id="retention_period_days"
              type="number"
              min={1}
              className="border-border bg-card"
              {...form.register('retention_period_days')}
            />
            {form.formState.errors.retention_period_days && (
              <p className="text-sm text-destructive">
                {form.formState.errors.retention_period_days.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="action_on_expiry">Action on expiry</Label>
            <Select
              value={form.watch('action_on_expiry')}
              onValueChange={(v) =>
                form.setValue('action_on_expiry', v as ActionOnExpiry)
              }
            >
              <SelectTrigger id="action_on_expiry" className="border-border bg-card">
                <SelectValue placeholder="Select action" />
              </SelectTrigger>
              <SelectContent>
                {ACTIONS.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="transition-transform hover:scale-[1.02]"
            >
              {isSubmitting ? 'Saving…' : 'Save policy'}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
