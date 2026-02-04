import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AnimatedPage } from '@/components/layout/AnimatedPage'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const bookDemoSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  company: z.string().optional(),
  message: z.string().optional(),
})

type BookDemoForm = z.infer<typeof bookDemoSchema>

export function Demo() {
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
      await new Promise((r) => setTimeout(r, 600))
      toast.success('Demo request received. We\'ll be in touch shortly.')
      reset()
    } catch {
      toast.error('Something went wrong. Please try again.')
    }
  }

  return (
    <AnimatedPage>
      <div className="min-h-screen bg-background">
        <header className="border-b border-border px-4 py-4 sm:px-6">
          <Link
            to="/"
            className="text-lg font-bold text-foreground hover:opacity-90"
          >
            ← ClawCloud
          </Link>
        </header>
        <main className="mx-auto max-w-md px-4 py-16 sm:px-6">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Book a demo</CardTitle>
              <CardDescription className="text-muted-foreground">
                Tell us a bit about yourself and we&apos;ll schedule a walkthrough.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            </CardContent>
          </Card>
        </main>
      </div>
    </AnimatedPage>
  )
}
