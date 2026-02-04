/**
 * Trigger Configuration Dialog: set trigger type and schedule/event config.
 */

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Skill, SkillTriggerType } from '@/types/skill'

const schema = z.object({
  trigger_type: z.enum(['manual', 'schedule', 'event']),
  cron_expression: z.string().optional(),
  timezone: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export interface TriggerConfigDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  skill: Skill | null
  onSubmit: (values: {
    trigger_type: SkillTriggerType
    trigger_config: Record<string, unknown>
  }) => void
  isSubmitting?: boolean
}

export function TriggerConfigDialog({
  open,
  onOpenChange,
  skill,
  onSubmit,
  isSubmitting = false,
}: TriggerConfigDialogProps) {
  const triggerConfig = (skill?.trigger_config ?? {}) as Record<string, unknown>
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      trigger_type: skill?.trigger_type ?? 'manual',
      cron_expression: (triggerConfig.cron_expression as string) ?? '',
      timezone: (triggerConfig.timezone as string) ?? 'UTC',
    },
  })

  const triggerType = watch('trigger_type')

  useEffect(() => {
    if (open) {
      if (skill) {
        const cfg = (skill.trigger_config ?? {}) as Record<string, unknown>
        reset({
          trigger_type: skill.trigger_type,
          cron_expression: (cfg.cron_expression as string) ?? '',
          timezone: (cfg.timezone as string) ?? 'UTC',
        })
      } else {
        reset({
          trigger_type: 'manual',
          cron_expression: '',
          timezone: 'UTC',
        })
      }
    }
  }, [open, skill, reset])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Configure trigger</DialogTitle>
          <DialogDescription>
            Choose when this skill runs: manual, on a schedule, or on an event.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit((values) => {
            onSubmit({
              trigger_type: values.trigger_type as SkillTriggerType,
              trigger_config: {
                cron_expression:
                  values.trigger_type === 'schedule'
                    ? values.cron_expression
                    : undefined,
                timezone: values.timezone ?? 'UTC',
              },
            })
            onOpenChange(false)
          })}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label>Trigger type</Label>
            <Select
              value={triggerType}
              onValueChange={(v) => setValue('trigger_type', v as FormValues['trigger_type'])}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select trigger" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="schedule">Schedule</SelectItem>
                <SelectItem value="event">Event</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {triggerType === 'schedule' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="cron">Cron expression</Label>
                <Input
                  id="cron"
                  placeholder="0 8 * * * (daily at 08:00)"
                  {...register('cron_expression')}
                />
                {errors.cron_expression && (
                  <p className="text-sm text-destructive">
                    {errors.cron_expression.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Input
                  id="timezone"
                  placeholder="UTC"
                  {...register('timezone')}
                />
              </div>
            </>
          )}
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
