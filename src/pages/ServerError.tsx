import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AnimatedPage } from '@/components/layout/AnimatedPage'
import { AlertTriangle, RefreshCw, Mail } from 'lucide-react'

interface ServerErrorProps {
  errorId?: string
}

export function ServerError({ errorId }: ServerErrorProps) {
  return (
    <AnimatedPage>
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md border-border bg-card text-center">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/20">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">
              Something went wrong
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              We encountered an internal error. Please try again or contact support.
            </CardDescription>
            {errorId && (
              <p className="text-xs text-muted-foreground">
                Error ID: {errorId}
              </p>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => window.location.reload()}
              className="w-full gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
            <Link to="/contact" className="block">
              <Button variant="outline" className="w-full gap-2">
                <Mail className="h-4 w-4" />
                Contact support
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </AnimatedPage>
  )
}
