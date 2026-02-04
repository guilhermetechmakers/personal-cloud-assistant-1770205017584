import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { AnimatedPage } from '@/components/layout/AnimatedPage'
import { Mail, HelpCircle } from 'lucide-react'
import { useState } from 'react'

const COOLDOWN_SEC = 60

export function EmailVerification() {
  const [cooldown, setCooldown] = useState(0)

  const handleResend = () => {
    if (cooldown > 0) return
    setCooldown(COOLDOWN_SEC)
    const id = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          clearInterval(id)
          return 0
        }
        return c - 1
      })
    }, 1000)
  }

  return (
    <AnimatedPage>
      <Card className="border-border bg-card">
        <CardHeader>
          <div className="mb-2 flex items-center gap-2 rounded-lg bg-primary/10 p-3 w-fit">
            <Mail className="h-5 w-5 text-primary" />
          </div>
          <CardTitle className="text-foreground">Verify your email</CardTitle>
          <CardDescription className="text-muted-foreground">
            We sent a verification link to your email. Click it to continue.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button
            onClick={handleResend}
            disabled={cooldown > 0}
            variant="outline"
            className="w-full"
          >
            {cooldown > 0
              ? `Resend in ${cooldown}s`
              : 'Resend verification email'}
          </Button>
          {cooldown > 0 && (
            <Progress value={((COOLDOWN_SEC - cooldown) / COOLDOWN_SEC) * 100} className="h-1.5" />
          )}
          <Link
            to="/help"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <HelpCircle className="h-4 w-4" />
            Need help? Contact support
          </Link>
          <Link to="/dashboard" className="block">
            <Button className="w-full">Continue to app</Button>
          </Link>
        </CardContent>
      </Card>
    </AnimatedPage>
  )
}
