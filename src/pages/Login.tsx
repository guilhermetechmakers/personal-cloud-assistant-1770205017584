import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AnimatedPage } from '@/components/layout/AnimatedPage'
import { MagicLinkDialog } from '@/components/auth/MagicLinkDialog'
import { signIn, signInWithGoogle, getSession } from '@/lib/auth'

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
})

type LoginForm = z.infer<typeof loginSchema>

export function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const [magicLinkOpen, setMagicLinkOpen] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/dashboard'

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    const result = await signIn(data)
    if (result.ok) {
      const { data: sessionData } = await getSession()
      const user = sessionData.session?.user as { email_confirmed_at?: string } | undefined
      const verified = !!user?.email_confirmed_at
      if (verified) {
        toast.success('Signed in')
        navigate(from, { replace: true })
      } else {
        navigate('/verify-email', { replace: true })
      }
    } else {
      toast.error('Sign-in failed', { description: result.error })
    }
  }

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)
    const result = await signInWithGoogle()
    setGoogleLoading(false)
    if (!result.ok) {
      toast.error('Google sign-in failed', { description: result.error })
    }
    // On success Supabase redirects to Google and back to redirectTo; no need to navigate here
  }

  return (
    <AnimatedPage>
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">Log in</CardTitle>
          <CardDescription className="text-muted-foreground">
            Enter your credentials or use SSO / magic link
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="password" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-muted">
              <TabsTrigger value="password">Email / Password</TabsTrigger>
              <TabsTrigger value="sso">SSO / Magic link</TabsTrigger>
            </TabsList>
            <TabsContent value="password">
              <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
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
                    {...register('password')}
                    className="border-border bg-card"
                  />
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password.message}</p>
                  )}
                </div>
                <Link
                  to="/forgot-password"
                  className="block text-sm text-primary hover:underline"
                >
                  Forgot password?
                </Link>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Signing in...' : 'Log in'}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="sso">
              <div className="mt-6 space-y-4">
                <Button
                  variant="outline"
                  className="w-full"
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={googleLoading}
                >
                  {googleLoading ? 'Redirecting…' : 'Continue with Google'}
                </Button>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <span className="relative flex justify-center text-xs uppercase text-muted-foreground">
                    Or
                  </span>
                </div>
                <Button
                  variant="ghost"
                  className="w-full"
                  type="button"
                  onClick={() => setMagicLinkOpen(true)}
                >
                  Send magic link
                </Button>
              </div>
            </TabsContent>
          </Tabs>
          <MagicLinkDialog open={magicLinkOpen} onOpenChange={setMagicLinkOpen} />
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="text-primary hover:underline">
              Sign up
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
