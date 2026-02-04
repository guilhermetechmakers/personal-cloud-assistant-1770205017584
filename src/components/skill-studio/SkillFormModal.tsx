/**
 * Skill Form Modal: create or edit skill name and description.
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
import type { Skill } from '@/types/skill'

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().max(1000).optional(),
})

type FormValues = z.infer<typeof schema>

export interface SkillFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  skill: Skill | null
  onSubmit: (values: FormValues) => void
  isSubmitting?: boolean
}

export function SkillFormModal({
  open,
  onOpenChange,
  skill,
  onSubmit,
  isSubmitting = false,
}: SkillFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', description: '' },
  })

  useEffect(() => {
    if (open) {
      reset({
        name: skill?.name ?? '',
        description: skill?.description ?? '',
      })
    }
  }, [open, skill, reset])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{skill ? 'Edit skill' : 'New skill'}</DialogTitle>
          <DialogDescription>
            {skill
              ? 'Update the skill name and description.'
              : 'Give your skill a name and optional description.'}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit((values) => {
            onSubmit(values)
            onOpenChange(false)
          })}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="skill-name">Name</Label>
            <Input
              id="skill-name"
              placeholder="e.g. Summarize emails"
              className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="skill-description">Description (optional)</Label>
            <Input
              id="skill-description"
              placeholder="What does this skill do?"
              className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              {...register('description')}
            />
            {errors.description && (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
            )}
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
              {isSubmitting ? 'Saving…' : skill ? 'Save' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
