import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AnimatedPage } from '@/components/layout/AnimatedPage'
import { SupportContactDialog } from '@/components/support/SupportContactDialog'
import { AlertTriangle, RefreshCw, Mail, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Generates a short unique ID for error reference (e.g. support tickets).
 * Not cryptographically secure; suitable for display and logging.
 */
function generateErrorId(): string {
  const t = Date.now().toString(36)
  const r = Math.random().toString(36).slice(2, 8)
  return `${t}-${r}`.toUpperCase()
}

interface ServerErrorProps {
  errorId?: string
}

export function ServerError({ errorId: errorIdProp }: ServerErrorProps) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const errorId = useMemo(
    () =>
      errorIdProp ??
      searchParams.get('errorId') ??
      generateErrorId(),
    [errorIdProp, searchParams]
  )
  const [supportOpen, setSupportOpen] = useState(false)

  const handleRetry = () => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/dashboard', { replace: true })
    }
  }

  return (
    <AnimatedPage>
      <div className="flex min-h-screen flex-col bg-background">
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4 sm:px-6">
          <Link
            to="/"
            className="flex items-center gap-2 text-xl font-bold text-primary transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background rounded"
            aria-label="ClawCloud home"
          >
            ClawCloud
          </Link>
          <Link
            to="/"
            className={cn(
              'inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground',
              'transition-colors hover:text-foreground hover:bg-card focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
            )}
          >
            <Home className="h-4 w-4" aria-hidden />
            Home
          </Link>
        </header>

        {/* Main */}
        <main className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-6">
          <Card
            className={cn(
              'w-full max-w-md border-border bg-card shadow-card',
              'transition-all duration-200 hover:shadow-lg'
            )}
          >
            <CardHeader className="text-center">
              <div
                className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/20"
                aria-hidden
              >
                <AlertTriangle className="h-7 w-7 text-destructive" />
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Something went wrong
              </CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                We encountered an internal error and couldn’t complete your request. Our team has
                been notified and we’re working on it. You can try again or contact support with
                the error ID below.
              </CardDescription>
              <div className="mt-4 rounded-md bg-muted/50 px-3 py-2 font-mono text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Error ID: </span>
                <span id="error-id">{errorId}</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={handleRetry}
                className="w-full gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98]"
                size="lg"
              >
                <RefreshCw className="h-4 w-4" aria-hidden />
                Retry
              </Button>
              <Button
                variant="outline"
                className="w-full gap-2 border-border hover:bg-card/80"
                size="lg"
                onClick={() => setSupportOpen(true)}
              >
                <Mail className="h-4 w-4" aria-hidden />
                Contact support
              </Button>
            </CardContent>
          </Card>
        </main>

        {/* Footer */}
        <footer className="shrink-0 border-t border-border px-4 py-6 sm:px-6">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4">
            <span className="text-sm text-muted-foreground">© ClawCloud</span>
            <nav className="flex flex-wrap gap-6" aria-label="Footer links">
              <Link
                to="/privacy"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
              >
                Privacy
              </Link>
              <Link
                to="/terms"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
              >
                Terms
              </Link>
              <Link
                to="/cookies"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
              >
                Cookies
              </Link>
              <Link
                to="/help"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
              >
                Help
              </Link>
            </nav>
          </div>
        </footer>
      </div>

      <SupportContactDialog
        open={supportOpen}
        onOpenChange={setSupportOpen}
        errorId={errorId}
      />
    </AnimatedPage>
  )
}
