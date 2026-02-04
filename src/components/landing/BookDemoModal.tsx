import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const bookDemoSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  company: z.string().optional(),
  message: z.string().optional(),
})

type BookDemoForm = z.infer<typeof bookDemoSchema>

export interface BookDemoModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BookDemoModal({ open, onOpenChange }: BookDemoModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BookDemoForm>({
    resolver: zodResolver(bookDemoSchema),
  })

  const onSubmit = async (_payload: BookDemoForm) => {
    try {
      // API integration: POST to CRM/demo endpoint when backend is ready
      await new Promise((r) => setTimeout(r, 600))
      toast.success('Demo request received. We\'ll be in touch shortly.')
      reset()
      onOpenChange(false)
    } catch {
      toast.error('Something went wrong. Please try again.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="border-border bg-card sm:max-w-md"
        showClose
      >
        <DialogHeader>
          <DialogTitle className="text-foreground">Book a demo</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Tell us a bit about yourself and we&apos;ll schedule a walkthrough.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="demo-name" className="text-foreground">
              Name
            </Label>
            <Input
              id="demo-name"
              placeholder="Your name"
              className="border-border bg-card"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="demo-email" className="text-foreground">
              Email
            </Label>
            <Input
              id="demo-email"
              type="email"
              placeholder="you@company.com"
              className="border-border bg-card"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="demo-company" className="text-foreground">
              Company <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="demo-company"
              placeholder="Company name"
              className="border-border bg-card"
              {...register('company')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="demo-message" className="text-foreground">
              Message <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="demo-message"
              placeholder="What would you like to see?"
              className="border-border bg-card"
              {...register('message')}
            />
          </div>
          <Button
            type="submit"
            className={cn(
              'w-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]'
            )}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Sending…' : 'Request demo'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
