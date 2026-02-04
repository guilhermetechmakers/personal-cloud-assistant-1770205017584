'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { signInWithMagicLink } from '@/lib/auth'
import { toast } from 'sonner'

const magicLinkSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
})

type MagicLinkForm = z.infer<typeof magicLinkSchema>

interface MagicLinkDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MagicLinkDialog({ open, onOpenChange }: MagicLinkDialogProps) {
  const [sent, setSent] = useState(false)
  const [sentEmail, setSentEmail] = useState('')
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<MagicLinkForm>({
    resolver: zodResolver(magicLinkSchema),
    defaultValues: { email: '' },
  })

  const onSubmit = async (data: MagicLinkForm) => {
    const result = await signInWithMagicLink(data.email)
    if (result.ok) {
      setSent(true)
      setSentEmail(data.email)
      toast.success('Magic link sent', {
        description: 'Check your email and click the link to sign in.',
      })
    } else {
      toast.error('Could not send link', { description: result.error })
    }
  }

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setSent(false)
      setSentEmail('')
    }
    onOpenChange(isOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent showClose className="border-border bg-card">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {sent ? 'Check your email' : 'Send magic link'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {sent
              ? `We sent a sign-in link to ${sentEmail}. Click the link in that email to sign in. You can close this and open the link on this device.`
              : 'Enter your email and we’ll send you a one-time link to sign in—no password needed.'}
          </DialogDescription>
        </DialogHeader>
        {sent ? (
          <div className="flex flex-col items-center gap-4 py-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <CheckCircle2 className="h-6 w-6" aria-hidden />
            </div>
            <Button variant="outline" onClick={() => handleClose(false)} className="w-full">
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="magic-email" className="text-foreground">
                Email
              </Label>
              <Input
                id="magic-email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                disabled={isSubmitting}
                {...register('email')}
                className="border-border bg-background"
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <p className="text-sm text-destructive" role="alert">
                  {errors.email.message}
                </p>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => handleClose(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Sending…' : 'Send magic link'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
