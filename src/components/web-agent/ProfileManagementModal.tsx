/**
 * Profile Management Modal: create/edit persistent profiles (credentials ref only; KMS handled server-side).
 */

import * as React from 'react'
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
import type { WebAgentProfile, WebAgentProfileType } from '@/types/webAgent'

const profileFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(120),
  profile_type: z.enum(['ephemeral', 'persistent']),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export interface ProfileManagementModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  profiles: WebAgentProfile[]
  editingProfile: WebAgentProfile | null
  onCreate: (values: { name: string; profile_type: WebAgentProfileType }) => void
  onUpdate: (
    profileId: string,
    values: { name: string; profile_type: WebAgentProfileType }
  ) => void
  onDelete: (profileId: string) => void
  isSubmitting?: boolean
}

export function ProfileManagementModal({
  open,
  onOpenChange,
  profiles,
  editingProfile,
  onCreate,
  onUpdate,
  onDelete,
  isSubmitting = false,
}: ProfileManagementModalProps) {
  const isEdit = !!editingProfile
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: '',
      profile_type: 'persistent',
    },
  })

  React.useEffect(() => {
    if (open) {
      if (editingProfile) {
        form.reset({
          name: editingProfile.name,
          profile_type: editingProfile.profile_type,
        })
      } else {
        form.reset({ name: '', profile_type: 'persistent' })
      }
    }
  }, [open, editingProfile, form])

  const onSubmit = form.handleSubmit((values) => {
    if (editingProfile) {
      onUpdate(editingProfile.id, values)
    } else {
      onCreate(values)
    }
    onOpenChange(false)
  })

  const handleDelete = () => {
    if (editingProfile && window.confirm('Delete this profile? This cannot be undone.')) {
      onDelete(editingProfile.id)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-border bg-card">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {isEdit ? 'Edit profile' : 'New profile'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {isEdit
              ? 'Update profile name and type. Credentials are managed securely (KMS).'
              : `Create a persistent profile. Credentials are stored encrypted (KMS). You have ${profiles.length} profile(s).`}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground">
              Name
            </Label>
            <Input
              id="name"
              {...form.register('name')}
              placeholder="e.g. Main browser"
              className="border-border bg-background text-foreground"
            />
            {form.formState.errors.name && (
              <p className="text-xs text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile_type" className="text-foreground">
              Type
            </Label>
            <Select
              value={form.watch('profile_type')}
              onValueChange={(v) => form.setValue('profile_type', v as WebAgentProfileType)}
            >
              <SelectTrigger
                id="profile_type"
                className="border-border bg-background text-foreground"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ephemeral">Ephemeral</SelectItem>
                <SelectItem value="persistent">Persistent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            {isEdit && (
              <Button
                type="button"
                variant="outline"
                onClick={handleDelete}
                className="border-destructive text-destructive hover:bg-destructive/10"
              >
                Delete
              </Button>
            )}
            <div className="flex flex-1 justify-end gap-2">
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
                {isSubmitting ? 'Saving…' : isEdit ? 'Save' : 'Create'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
