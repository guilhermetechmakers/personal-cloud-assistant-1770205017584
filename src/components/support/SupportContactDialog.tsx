import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
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
import { cn } from '@/lib/utils'

const supportFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(120, 'Name is too long'),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  description: z.string().min(1, 'Please describe the issue').max(2000, 'Description is too long'),
  errorId: z.string().optional(),
})

export type SupportFormValues = z.infer<typeof supportFormSchema>

interface SupportContactDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  errorId?: string
}

export function SupportContactDialog({
  open,
  onOpenChange,
  errorId = '',
}: SupportContactDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SupportFormValues>({
    resolver: zodResolver(supportFormSchema),
    defaultValues: {
      name: '',
      email: '',
      description: '',
      errorId: errorId,
    },
  })

  const onSubmit = (_data: SupportFormValues) => {
    // Client-side only: show success; backend integration can send to support API later
    toast.success('Message sent', {
      description: "We've received your request. Our team will get back to you soon.",
    })
    reset({ name: '', email: '', description: '', errorId: errorId })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="border-border bg-card sm:max-w-md"
        aria-describedby="support-dialog-description"
      >
        <DialogHeader>
          <DialogTitle className="text-foreground">Contact support</DialogTitle>
          <DialogDescription id="support-dialog-description">
            Describe your issue and we&apos;ll follow up. Include the error ID below if you have one.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="support-name">Name</Label>
            <Input
              id="support-name"
              placeholder="Your name"
              className={cn(errors.name && 'border-destructive focus-visible:ring-destructive')}
              {...register('name')}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'support-name-error' : undefined}
            />
            {errors.name && (
              <p id="support-name-error" className="text-sm text-destructive">
                {errors.name.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="support-email">Email</Label>
            <Input
              id="support-email"
              type="email"
              placeholder="you@example.com"
              className={cn(errors.email && 'border-destructive focus-visible:ring-destructive')}
              {...register('email')}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'support-email-error' : undefined}
            />
            {errors.email && (
              <p id="support-email-error" className="text-sm text-destructive">
                {errors.email.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="support-description">Description of issue</Label>
            <textarea
              id="support-description"
              rows={4}
              placeholder="What happened? What were you trying to do?"
              className={cn(
                'flex w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground',
                'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                errors.description && 'border-destructive focus-visible:ring-destructive'
              )}
              {...register('description')}
              aria-invalid={!!errors.description}
              aria-describedby={errors.description ? 'support-description-error' : undefined}
            />
            {errors.description && (
              <p id="support-description-error" className="text-sm text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>
          {errorId && (
            <div className="space-y-1">
              <Label className="text-muted-foreground">Error ID (for support reference)</Label>
              <Input
                readOnly
                value={errorId}
                className="bg-muted/50 font-mono text-xs text-muted-foreground"
                aria-label="Error ID"
              />
            </div>
          )}
          <input type="hidden" {...register('errorId')} value={errorId} />
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Sending…' : 'Send message'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
