import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AnimatedPage } from '@/components/layout/AnimatedPage'
import { requestPasswordReset } from '@/lib/auth'
import { useState } from 'react'

const requestSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
})

type RequestForm = z.infer<typeof requestSchema>

export function ForgotPassword() {
  const [sent, setSent] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RequestForm>({
    resolver: zodResolver(requestSchema),
    defaultValues: { email: '' },
  })

  const onSubmit = async (data: RequestForm) => {
    const result = await requestPasswordReset(data.email)
    if (result.ok) {
      setSent(true)
      toast.success('Reset link sent', {
        description: 'If an account exists for that email, we sent a secure link. Check your inbox and spam folder.',
      })
    } else {
      toast.error('Could not send reset link', {
        description: result.error,
      })
    }
  }

  if (sent) {
    return (
      <AnimatedPage>
        <Card className="w-full border-[rgb(var(--border))] bg-[rgb(var(--card))] shadow-card rounded-lg">
          <CardHeader className="space-y-1 px-6 pt-6 pb-4 sm:px-8 sm:pt-8 sm:pb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-2">
              <Mail className="h-5 w-5" aria-hidden />
            </div>
            <CardTitle className="text-xl font-bold text-[rgb(var(--card-foreground))]">
              Check your email
            </CardTitle>
            <CardDescription className="text-[rgb(var(--muted-foreground))]">
              If an account exists for that email, we sent a secure reset link. The link expires in 1 hour.
              Check your inbox and spam folder.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6 sm:px-8 sm:pb-8 space-y-6">
            <Button asChild className="w-full h-11 rounded-lg font-medium transition-all hover:scale-[1.02] active:scale-[0.98]" size="lg">
              <Link to="/login">Back to login</Link>
            </Button>
            <p className="text-center text-sm text-[rgb(var(--muted-foreground))]">
              <Link to="/login" className="text-primary font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded">
                Back to login
              </Link>
            </p>
          </CardContent>
        </Card>
      </AnimatedPage>
    )
  }

  return (
    <AnimatedPage>
      <Card className="w-full border-[rgb(var(--border))] bg-[rgb(var(--card))] shadow-card rounded-lg">
        <CardHeader className="space-y-1 px-6 pt-6 pb-4 sm:px-8 sm:pt-8 sm:pb-6">
          <CardTitle className="text-xl font-bold text-[rgb(var(--card-foreground))]">
            Reset password
          </CardTitle>
          <CardDescription className="text-[rgb(var(--muted-foreground))]">
            Enter the email address for your account and we&apos;ll send you a secure link to set a new password.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6 sm:px-8 sm:pb-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="forgot-email" className="text-[rgb(var(--foreground))]">
                Email
              </Label>
              <Input
                id="forgot-email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                disabled={isSubmitting}
                {...register('email')}
                className="h-11 rounded-lg border-[rgb(var(--border))] bg-[rgb(var(--input))] text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))] focus-visible:ring-2 focus-visible:ring-[rgb(var(--ring))]"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'forgot-email-error' : undefined}
              />
              {errors.email && (
                <p id="forgot-email-error" className="text-sm text-destructive" role="alert">
                  {errors.email.message}
                </p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full h-11 rounded-lg font-medium transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70"
              disabled={isSubmitting}
              size="lg"
            >
              {isSubmitting ? 'Sending…' : 'Send reset link'}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-[rgb(var(--muted-foreground))]">
            <Link
              to="/login"
              className="text-primary font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
            >
              Back to login
            </Link>
          </p>
        </CardContent>
      </Card>
    </AnimatedPage>
  )
}
