import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AnimatedPage } from '@/components/layout/AnimatedPage'
import { PasswordStrengthIndicator } from '@/components/auth/PasswordStrengthIndicator'
import { getPasswordStrength } from '@/lib/password-strength'
import { getSession, updatePassword, signOut } from '@/lib/auth'

const resetSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .refine(
        (val) => getPasswordStrength(val).level !== 'weak',
        { message: 'Choose a stronger password (mix of letters, numbers, and symbols)' },
      ),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type ResetForm = z.infer<typeof resetSchema>

type PageState = 'loading' | 'ready' | 'invalid' | 'success'

export function ResetPassword() {
  const navigate = useNavigate()
  const [pageState, setPageState] = useState<PageState>('loading')
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  const {
    register,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })
  const password = watch('password', '')

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      const { data } = await getSession()
      const hasHash = typeof window !== 'undefined' && window.location.hash.length > 0
      if (cancelled) return
      if (data.session) {
        setPageState('ready')
        return
      }
      if (hasHash) {
        // Give Supabase a moment to process the hash
        await new Promise((r) => setTimeout(r, 500))
        const { data: retry } = await getSession()
        if (cancelled) return
        setPageState(retry.session ? 'ready' : 'invalid')
        return
      }
      setPageState('invalid')
    }
    run()
    return () => {
      cancelled = true
    }
  }, [])

  const onSubmit = async (data: ResetForm) => {
    const result = await updatePassword(data.password)
    if (result.ok) {
      setShowSuccessModal(true)
      toast.success('Password updated', { description: 'You can now sign in with your new password.' })
    } else {
      toast.error('Could not update password', { description: result.error })
    }
  }

  const goToLogin = async () => {
    setShowSuccessModal(false)
    await signOut()
    navigate('/login', { replace: true })
  }

  if (pageState === 'loading') {
    return (
      <AnimatedPage>
        <Card className="w-full border-[rgb(var(--border))] bg-[rgb(var(--card))] shadow-card rounded-lg">
          <CardContent className="flex items-center justify-center py-12 px-6">
            <p className="text-sm text-[rgb(var(--muted-foreground))]">Verifying reset link…</p>
          </CardContent>
        </Card>
      </AnimatedPage>
    )
  }

  if (pageState === 'invalid') {
    return (
      <AnimatedPage>
        <Card className="w-full border-[rgb(var(--border))] bg-[rgb(var(--card))] shadow-card rounded-lg">
          <CardHeader className="space-y-1 px-6 pt-6 pb-4 sm:px-8 sm:pt-8 sm:pb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive mb-2">
              <AlertCircle className="h-5 w-5" aria-hidden />
            </div>
            <CardTitle className="text-xl font-bold text-[rgb(var(--card-foreground))]">
              Invalid or expired link
            </CardTitle>
            <CardDescription className="text-[rgb(var(--muted-foreground))]">
              This password reset link is invalid or has expired. Request a new one below.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6 sm:px-8 sm:pb-8 space-y-6">
            <Button asChild className="w-full h-11 rounded-lg font-medium" size="lg">
              <Link to="/forgot-password">Request new reset link</Link>
            </Button>
            <p className="text-center text-sm text-[rgb(var(--muted-foreground))]">
              <Link to="/login" className="text-primary font-medium hover:underline">
                Back to login
              </Link>
            </p>
          </CardContent>
        </Card>
      </AnimatedPage>
    )
  }

  return (
    <>
      <AnimatedPage>
        <Card className="w-full border-[rgb(var(--border))] bg-[rgb(var(--card))] shadow-card rounded-lg">
          <CardHeader className="space-y-1 px-6 pt-6 pb-4 sm:px-8 sm:pt-8 sm:pb-6">
            <CardTitle className="text-xl font-bold text-[rgb(var(--card-foreground))]">
              Set new password
            </CardTitle>
            <CardDescription className="text-[rgb(var(--muted-foreground))]">
              Enter your new password and confirm. Use a mix of letters, numbers, and symbols for a strong password.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6 sm:px-8 sm:pb-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="reset-password" className="text-[rgb(var(--foreground))]">
                  New password
                </Label>
                <Input
                  id="reset-password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  disabled={isSubmitting}
                  {...register('password')}
                  className="h-11 rounded-lg border-[rgb(var(--border))] bg-[rgb(var(--input))] text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))] focus-visible:ring-2 focus-visible:ring-[rgb(var(--ring))]"
                  aria-invalid={!!errors.password}
                  aria-describedby={
                    errors.password
                      ? 'reset-password-error'
                      : password
                        ? 'reset-password-strength'
                        : undefined
                  }
                />
                <PasswordStrengthIndicator password={password} id="reset-password-strength" />
                {errors.password && (
                  <p id="reset-password-error" className="text-sm text-destructive" role="alert">
                    {errors.password.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="reset-confirm" className="text-[rgb(var(--foreground))]">
                  Confirm password
                </Label>
                <Input
                  id="reset-confirm"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  disabled={isSubmitting}
                  {...register('confirmPassword')}
                  className="h-11 rounded-lg border-[rgb(var(--border))] bg-[rgb(var(--input))] text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))] focus-visible:ring-2 focus-visible:ring-[rgb(var(--ring))]"
                  aria-invalid={!!errors.confirmPassword}
                  aria-describedby={errors.confirmPassword ? 'reset-confirm-error' : undefined}
                />
                {errors.confirmPassword && (
                  <p id="reset-confirm-error" className="text-sm text-destructive" role="alert">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full h-11 rounded-lg font-medium transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70"
                disabled={isSubmitting}
                size="lg"
              >
                {isSubmitting ? 'Saving…' : 'Reset password'}
              </Button>
            </form>
            <p className="mt-6 text-center text-sm text-[rgb(var(--muted-foreground))]">
              <Link to="/login" className="text-primary font-medium hover:underline">
                Back to login
              </Link>
            </p>
          </CardContent>
        </Card>
      </AnimatedPage>

      <Dialog open={showSuccessModal} onOpenChange={(open) => !open && goToLogin()}>
        <DialogContent
          showClose={true}
          className="border-[rgb(var(--border))] bg-[rgb(var(--card))] text-[rgb(var(--card-foreground))]"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => {
            goToLogin()
            e.preventDefault()
          }}
        >
          <DialogHeader>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10 text-success mx-auto mb-2">
              <CheckCircle2 className="h-6 w-6" aria-hidden />
            </div>
            <DialogTitle className="text-center">Password reset successfully</DialogTitle>
            <DialogDescription className="text-center">
              Your password has been updated. You can now sign in with your new password.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex sm:justify-center">
            <Button
              type="button"
              onClick={goToLogin}
              className="w-full sm:w-auto h-11 rounded-lg font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
              size="lg"
            >
              Go to login
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
