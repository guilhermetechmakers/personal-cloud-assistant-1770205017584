import { useState } from 'react'
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
import { PasswordStrengthIndicator } from '@/components/auth/PasswordStrengthIndicator'
import { getPasswordStrength } from '@/lib/password-strength'
import { signUp, signInWithGoogle } from '@/lib/auth'

const signupSchema = z
  .object({
    email: z.string().email('Invalid email'),
    password: z
      .string()
      .min(8, 'At least 8 characters')
      .refine(
        (val) => getPasswordStrength(val).level !== 'weak',
        { message: 'Use a stronger password (mix of letters, numbers, and symbols)' }
      ),
    confirmPassword: z.string(),
    full_name: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type SignupForm = z.infer<typeof signupSchema>

export function Signup() {
  const [signupSuccess, setSignupSuccess] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const {
    register,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: { full_name: '' },
  })
  const password = watch('password', '')

  const onSubmit = async (data: SignupForm) => {
    const result = await signUp({
      email: data.email,
      password: data.password,
      full_name: data.full_name?.trim() || undefined,
    })
    if (result.ok) {
      setSignupSuccess(true)
      toast.success('Account created', {
        description: 'Check your email to verify your account, then sign in.',
      })
    } else {
      toast.error('Sign-up failed', { description: result.error })
    }
  }

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true)
    const result = await signInWithGoogle()
    setGoogleLoading(false)
    if (!result.ok) {
      toast.error('Google sign-up failed', { description: result.error })
    }
  }

  if (signupSuccess) {
    return (
      <AnimatedPage>
        <Card className="border-border bg-card">
          <CardHeader className="space-y-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Mail className="h-5 w-5" aria-hidden />
            </div>
            <CardTitle className="text-foreground">Check your email</CardTitle>
            <CardDescription className="text-muted-foreground">
              We sent a verification link to your email. Click the link to verify your account, then sign in.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full" size="lg">
              <Link to="/login">Go to login</Link>
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              <Link to="/verify-email" className="text-primary hover:underline">
                Already verified? Continue to app
              </Link>
            </p>
            <div className="mt-4 flex justify-center gap-4 text-xs text-muted-foreground">
              <Link to="/privacy">Privacy</Link>
              <Link to="/terms">Terms</Link>
              <Link to="/cookies">Cookies</Link>
            </div>
          </CardContent>
        </Card>
      </AnimatedPage>
    )
  }

  return (
    <AnimatedPage>
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">Sign up</CardTitle>
          <CardDescription className="text-muted-foreground">
            Create your account with email or Google
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            className="mb-4 w-full"
            type="button"
            onClick={handleGoogleSignUp}
            disabled={googleLoading}
          >
            {googleLoading ? 'Redirecting…' : 'Continue with Google'}
          </Button>
          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <span className="relative flex justify-center text-xs uppercase text-muted-foreground">
              Or sign up with email
            </span>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full name (optional)</Label>
              <Input
                id="full_name"
                type="text"
                placeholder="Jane Doe"
                {...register('full_name')}
                className="border-border bg-card"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register('email')}
                className="border-border bg-card"
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register('password')}
                className="border-border bg-card"
              />
              <PasswordStrengthIndicator password={password} id="signup-password-strength" />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                {...register('confirmPassword')}
                className="border-border bg-card"
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Creating account…' : 'Sign up'}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline">
              Log in
            </Link>
          </p>
          <div className="mt-4 flex justify-center gap-4 text-xs text-muted-foreground">
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
            <Link to="/cookies">Cookies</Link>
          </div>
        </CardContent>
      </Card>
    </AnimatedPage>
  )
}
