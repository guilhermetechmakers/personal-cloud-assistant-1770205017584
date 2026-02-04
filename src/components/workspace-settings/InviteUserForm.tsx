/**
 * Invite User Form: email and role for workspace invitation.
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { UserPlus } from 'lucide-react'
import { cn } from '@/lib/utils'

const inviteSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  role: z.enum(['admin', 'member', 'viewer']),
})

export type InviteUserFormValues = z.infer<typeof inviteSchema>

export interface InviteUserFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: InviteUserFormValues) => void
  isSubmitting?: boolean
  className?: string
}

const ROLE_OPTIONS: { value: InviteUserFormValues['role']; label: string }[] = [
  { value: 'admin', label: 'Admin' },
  { value: 'member', label: 'Member' },
  { value: 'viewer', label: 'Viewer' },
]

export function InviteUserForm({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
  className,
}: InviteUserFormProps) {
  const form = useForm<InviteUserFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: '',
      role: 'member',
    },
  })

  const handleSubmit = form.handleSubmit((values) => {
    onSubmit(values)
    form.reset({ email: '', role: 'member' })
    onOpenChange(false)
  })

  const handleOpenChange = (next: boolean) => {
    if (!next) form.reset({ email: '', role: 'member' })
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showClose
        className={cn('border-border bg-card sm:max-w-md', className)}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <UserPlus className="h-5 w-5 text-primary" aria-hidden />
            Invite member
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Enter their email and assign a role. They will receive an invitation to join the workspace.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invite-email" className="text-foreground">
              Email
            </Label>
            <Input
              id="invite-email"
              type="email"
              placeholder="colleague@example.com"
              className="border-border bg-background"
              {...form.register('email')}
              aria-invalid={!!form.formState.errors.email}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-destructive">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="invite-role" className="text-foreground">
              Role
            </Label>
            <Select
              value={form.watch('role')}
              onValueChange={(v) => form.setValue('role', v as InviteUserFormValues['role'])}
            >
              <SelectTrigger
                id="invite-role"
                className="border-border bg-background"
              >
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              className="border-border"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary text-primary-foreground hover:bg-primary/90 transition-transform hover:scale-[1.02]"
            >
              {isSubmitting ? 'Sending…' : 'Send invitation'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
