import { Link, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { AnimatedPage } from '@/components/layout/AnimatedPage'

const resetSchema = z
  .object({
    password: z.string().min(8, 'At least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type ResetForm = z.infer<typeof resetSchema>

function passwordStrength(value: string): number {
  if (!value) return 0
  let s = 0
  if (value.length >= 8) s += 25
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) s += 25
  if (/\d/.test(value)) s += 25
  if (/[^a-zA-Z0-9]/.test(value)) s += 25
  return s
}

export function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const {
    register,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
  })
  const password = watch('password', '')
  const strength = passwordStrength(password)

  const onSubmit = (data: ResetForm) => {
    console.log({ token, password: data.password })
  }

  return (
    <AnimatedPage>
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">Set new password</CardTitle>
          <CardDescription className="text-muted-foreground">
            Enter your new password and confirm
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register('password')}
                className="border-border bg-card"
              />
              <Progress value={strength} className="h-1.5" />
              <p className="text-xs text-muted-foreground">Password strength</p>
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
              {isSubmitting ? 'Saving...' : 'Reset password'}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            <Link to="/login" className="text-primary hover:underline">
              Back to login
            </Link>
          </p>
        </CardContent>
      </Card>
    </AnimatedPage>
  )
}
