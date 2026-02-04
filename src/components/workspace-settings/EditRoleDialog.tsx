/**
 * Edit Role Dialog: adjust workspace member role and permissions.
 */

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
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
import { UserCog } from 'lucide-react'
import type { WorkspaceMember, WorkspaceMemberRole } from '@/types/workspace'
import { cn } from '@/lib/utils'

const editRoleSchema = z.object({
  role: z.enum(['admin', 'member', 'viewer']),
})

export type EditRoleFormValues = z.infer<typeof editRoleSchema>

export interface EditRoleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  member: WorkspaceMember | null
  onSubmit: (memberId: string, values: EditRoleFormValues) => void
  isSubmitting?: boolean
  className?: string
}

const ROLE_OPTIONS: { value: WorkspaceMemberRole; label: string }[] = [
  { value: 'admin', label: 'Admin' },
  { value: 'member', label: 'Member' },
  { value: 'viewer', label: 'Viewer' },
]

export function EditRoleDialog({
  open,
  onOpenChange,
  member,
  onSubmit,
  isSubmitting = false,
  className,
}: EditRoleDialogProps) {
  const form = useForm<EditRoleFormValues>({
    resolver: zodResolver(editRoleSchema),
    defaultValues: {
      role: (member?.role === 'owner' ? 'admin' : member?.role) ?? 'member',
    },
  })

  useEffect(() => {
    if (open && member) {
      form.reset({
        role: member.role === 'owner' ? 'admin' : member.role,
      })
    }
  }, [open, member, form])

  const handleSubmit = form.handleSubmit((values) => {
    if (member) {
      onSubmit(member.id, values)
      onOpenChange(false)
    }
  })

  const displayName =
    member?.full_name || member?.email || member?.user_id?.slice(0, 8) || 'Member'
  const isOwner = member?.role === 'owner'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showClose
        className={cn('border-border bg-card sm:max-w-md', className)}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <UserCog className="h-5 w-5 text-primary" aria-hidden />
            Edit role
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Change role for {displayName}. Owners cannot be demoted from this dialog.
          </DialogDescription>
        </DialogHeader>
        {isOwner ? (
          <p className="text-sm text-muted-foreground py-2">
            This user is the workspace owner. Role cannot be changed here.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-role" className="text-foreground">
                Role
              </Label>
              <Select
                value={form.watch('role')}
                onValueChange={(v) =>
                  form.setValue('role', v as EditRoleFormValues['role'])
                }
              >
                <SelectTrigger
                  id="edit-role"
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
