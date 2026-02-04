import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AnimatedPage } from '@/components/layout/AnimatedPage'
import { Search, Home, HelpCircle, Mail } from 'lucide-react'

export function NotFound() {
  return (
    <AnimatedPage>
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md border-border bg-card text-center">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-foreground">
              Page not found
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              The page you&apos;re looking for doesn&apos;t exist or was moved.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-9 border-border bg-card"
                aria-label="Search"
              />
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/dashboard">
                <Button variant="outline" className="gap-2">
                  <Home className="h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              <Link to="/help">
                <Button variant="outline" className="gap-2">
                  <HelpCircle className="h-4 w-4" />
                  Help
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" className="gap-2">
                  <Mail className="h-4 w-4" />
                  Contact support
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </AnimatedPage>
  )
}
