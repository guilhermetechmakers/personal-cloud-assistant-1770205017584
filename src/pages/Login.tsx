import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AnimatedPage } from '@/components/layout/AnimatedPage'

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
})

type LoginForm = z.infer<typeof loginSchema>

export function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = (data: LoginForm) => {
    console.log(data)
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
                <Button variant="outline" className="w-full" type="button">
                  Continue with Google
                </Button>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <span className="relative flex justify-center text-xs uppercase text-muted-foreground">
                    Or
                  </span>
                </div>
                <Button variant="ghost" className="w-full" type="button">
                  Send magic link
                </Button>
              </div>
            </TabsContent>
          </Tabs>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
          <div className="mt-4 flex justify-center gap-4 text-xs text-muted-foreground">
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
          </div>
        </CardContent>
      </Card>
    </AnimatedPage>
  )
}
