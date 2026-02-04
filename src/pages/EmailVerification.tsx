import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AnimatedPage } from '@/components/layout/AnimatedPage'
import { Mail, HelpCircle, CheckCircle2, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

const COOLDOWN_SEC = 60

export function EmailVerification() {
  const navigate = useNavigate()
  const [cooldown, setCooldown] = useState(0)
  const [isVerified, setIsVerified] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [resendLoading, setResendLoading] = useState(false)
  const [showResendModal, setShowResendModal] = useState(false)
  const cooldownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const checkVerification = async () => {
    if (!supabase) {
      setIsLoading(false)
      return
    }
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const verified = !!(user as { email_confirmed_at?: string } | null)?.email_confirmed_at
      setIsVerified(verified)
      if (verified) {
        toast.success('Email verified. You can continue to the app.')
      }
    } catch {
      setIsVerified(false)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false)
      return
    }
    checkVerification()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const verified = !!(session?.user as { email_confirmed_at?: string } | undefined)?.email_confirmed_at
      setIsVerified(verified)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (cooldown <= 0 && cooldownIntervalRef.current) {
      clearInterval(cooldownIntervalRef.current)
      cooldownIntervalRef.current = null
    }
    return () => {
      if (cooldownIntervalRef.current) clearInterval(cooldownIntervalRef.current)
    }
  }, [cooldown])

  const startCooldown = () => {
    setCooldown(COOLDOWN_SEC)
    cooldownIntervalRef.current = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          if (cooldownIntervalRef.current) {
            clearInterval(cooldownIntervalRef.current)
            cooldownIntervalRef.current = null
          }
          return 0
        }
        return c - 1
      })
    }, 1000)
  }

  const handleResendClick = () => {
    if (cooldown > 0) return
    setShowResendModal(true)
  }

  const handleResendConfirm = async () => {
    setShowResendModal(false)
    if (!supabase) {
      toast.error('Verification is not configured.')
      return
    }
    setResendLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const email = user?.email
      if (!email) {
        toast.error('No email found. Please sign in again.')
        setResendLoading(false)
        return
      }
      const { error } = await supabase.auth.resend({ type: 'signup', email })
      if (error) throw error
      toast.success('Verification email sent. Check your inbox.')
      startCooldown()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to resend verification email'
      toast.error(message)
    } finally {
      setResendLoading(false)
    }
  }

  const handleContinue = () => {
    navigate('/dashboard', { replace: true })
  }

  if (isLoading) {
    return (
      <AnimatedPage>
        <Card className="border-border bg-card">
          <CardContent className="flex min-h-[200px] items-center justify-center py-12">
            <div className="h-8 w-8 animate-pulse rounded-full bg-muted" aria-hidden />
            <span className="sr-only">Checking verification status…</span>
          </CardContent>
        </Card>
      </AnimatedPage>
    )
  }

  return (
    <AnimatedPage>
      <Card className="border-border bg-card shadow-card transition-all duration-200 hover:shadow-lg">
        <CardHeader className="space-y-4">
          <div
            className={cn(
              'flex w-fit items-center gap-2 rounded-lg border border-border bg-card px-4 py-3',
              'animate-fade-in-up'
            )}
          >
            <Mail className="h-5 w-5 text-primary" aria-hidden />
            <span className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Email verification
            </span>
          </div>
          <CardTitle className="text-xl font-bold text-foreground md:text-2xl">
            {isVerified ? 'You\'re all set' : 'Verify your email'}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {isVerified
              ? 'Your email is verified. Continue to your dashboard to get started.'
              : 'We sent a verification link to your email. Click the link to verify your account. You can request a new link below if you didn\'t receive it.'}
          </CardDescription>
        </CardHeader>

        {/* Verification notice banner (when not verified) */}
        {!isVerified && (
          <div
            role="alert"
            className="mx-6 mb-2 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-foreground animate-fade-in-up"
          >
            <p className="font-medium">Next steps</p>
            <ol className="mt-1 list-inside list-decimal space-y-0.5 text-muted-foreground">
              <li>Check your inbox (and spam folder) for an email from ClawCloud.</li>
              <li>Click the verification link in that email.</li>
              <li>Return here and click &quot;Continue to app&quot; once verified.</li>
            </ol>
          </div>
        )}

        <CardContent className="space-y-6">
          {!isVerified && (
            <>
              <div className="space-y-3">
                <Button
                  onClick={handleResendClick}
                  disabled={cooldown > 0 || resendLoading}
                  variant="outline"
                  className="w-full border-border bg-card transition-all duration-200 hover:scale-[1.02] hover:border-primary/50 hover:bg-card/90"
                  aria-label={cooldown > 0 ? `Resend available in ${cooldown} seconds` : 'Resend verification email'}
                >
                  {resendLoading
                    ? 'Sending…'
                    : cooldown > 0
                      ? `Resend in ${cooldown}s`
                      : 'Resend verification email'}
                </Button>
                {cooldown > 0 && (
                  <Progress
                    value={((COOLDOWN_SEC - cooldown) / COOLDOWN_SEC) * 100}
                    className="h-1.5"
                    aria-hidden
                  />
                )}
              </div>

              <Link
                to="/help"
                className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background rounded-md px-2 py-1 -ml-2"
              >
                <HelpCircle className="h-4 w-4 shrink-0" aria-hidden />
                Need help? Contact support
              </Link>
            </>
          )}

          {isVerified && (
            <Button
              onClick={handleContinue}
              className="w-full bg-primary text-primary-foreground transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" aria-hidden />
              Continue to app
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </Button>
          )}

          {!isVerified && (
            <p className="text-center text-xs text-muted-foreground">
              Already verified?{' '}
              <button
                type="button"
                onClick={checkVerification}
                className="font-medium text-primary underline-offset-4 hover:underline focus:outline-none focus:ring-2 focus:ring-ring rounded"
              >
                Refresh status
              </button>
            </p>
          )}

          <div className="border-t border-border pt-4">
            <Link
              to="/login"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Back to login
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Footer: legal links (match Auth pages) */}
      <footer className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
        <Link to="/privacy" className="hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring rounded">
          Privacy
        </Link>
        <Link to="/terms" className="hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring rounded">
          Terms
        </Link>
        <Link to="/cookies" className="hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring rounded">
          Cookies
        </Link>
      </footer>

      {/* Resend confirmation modal */}
      <Dialog open={showResendModal} onOpenChange={setShowResendModal}>
        <DialogContent
          className="border-border bg-card"
          showClose={true}
          aria-describedby="resend-dialog-description"
        >
          <DialogHeader>
            <DialogTitle>Resend verification email</DialogTitle>
            <DialogDescription id="resend-dialog-description">
              We&apos;ll send another verification link to your email. To prevent spam, you can only request a new link every {COOLDOWN_SEC} seconds.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowResendModal(false)}
              className="border-border"
            >
              Cancel
            </Button>
            <Button
              onClick={handleResendConfirm}
              disabled={resendLoading}
              className="bg-primary text-primary-foreground"
            >
              {resendLoading ? 'Sending…' : 'Send link'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AnimatedPage>
  )
}
