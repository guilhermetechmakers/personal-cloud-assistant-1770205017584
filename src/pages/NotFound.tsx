import { Link, useNavigate } from 'react-router-dom'
import { useRef, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AnimatedPage } from '@/components/layout/AnimatedPage'
import { Search, LayoutDashboard, HelpCircle, MessageCircle, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

const suggestedLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/help', label: 'Help', icon: HelpCircle },
  { to: '/help', label: 'Contact Support', icon: MessageCircle },
] as const

export function NotFound() {
  const navigate = useNavigate()
  const searchInputRef = useRef<HTMLInputElement>(null)

  const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const query = searchInputRef.current?.value?.trim()
    if (query) {
      navigate(`/dashboard?q=${encodeURIComponent(query)}`)
    } else {
      navigate('/dashboard')
    }
  }

  return (
    <AnimatedPage>
      <div className="flex min-h-screen flex-col bg-background">
        {/* Header */}
        <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <nav
            className="flex h-16 items-center justify-between px-4 sm:px-6"
            aria-label="Main navigation"
          >
            <Link
              to="/"
              className="text-xl font-bold text-primary transition-colors hover:text-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
            >
              ClawCloud
            </Link>
            <div className="flex items-center gap-2 sm:gap-4">
              <Link to="/login">
                <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                  Log in
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="sm" className="hidden sm:inline-flex">
                  Sign up
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="outline" size="sm" className="gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Button>
              </Link>
            </div>
          </nav>
        </header>

        {/* Main content */}
        <main className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:py-16">
          <div className="w-full max-w-lg space-y-8">
            {/* Headline & message */}
            <div
              className={cn(
                'text-center animate-fade-in-up',
                '[@media(prefers-reduced-motion:reduce)]:animate-none'
              )}
              style={{ animationDelay: '0ms', animationFillMode: 'backwards' }}
            >
              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Page not found
              </h1>
              <p className="mt-3 text-base text-muted-foreground sm:text-lg">
                The page you&apos;re looking for doesn&apos;t exist or was moved. You can go back to
                the dashboard, get help, or search for what you need.
              </p>
            </div>

            {/* Search card */}
            <Card
              className={cn(
                'border-border bg-card shadow-card transition-all duration-200',
                'hover:border-primary/20 hover:shadow-card/80',
                'animate-fade-in-up',
                '[@media(prefers-reduced-motion:reduce)]:animate-none'
              )}
              style={{ animationDelay: '80ms', animationFillMode: 'backwards' }}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-foreground">
                  Find a page or content
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Search and we&apos;ll take you to the right place.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleSearchSubmit} className="space-y-4">
                  <div className="relative">
                    <Search
                      className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none"
                      aria-hidden
                    />
                    <Input
                      ref={searchInputRef}
                      type="search"
                      name="q"
                      placeholder="Search pages, skills, help..."
                      className="h-11 pl-9 border-border bg-background/50 focus-visible:ring-2 focus-visible:ring-ring"
                      aria-label="Search for pages or content"
                      autoComplete="off"
                    />
                  </div>
                  <Button type="submit" className="w-full sm:w-auto" size="lg">
                    Go to search
                  </Button>
                </form>

                {/* Suggested links */}
                <div className="border-t border-border pt-6">
                  <p className="mb-3 text-sm font-medium uppercase tracking-wider text-muted-foreground">
                    Or try these
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {suggestedLinks.map(({ to, label, icon: Icon }, i) => (
                      <Link key={label + to} to={to}>
                        <Button
                          variant="outline"
                          size="sm"
                          className={cn(
                            'gap-2 transition-all duration-200 hover:border-primary/30 hover:bg-primary/5',
                            'animate-fade-in-up',
                            '[@media(prefers-reduced-motion:reduce)]:animate-none'
                          )}
                          style={{
                            animationDelay: `${120 + i * 40}ms`,
                            animationFillMode: 'backwards',
                          }}
                        >
                          <Icon className="h-4 w-4" />
                          {label}
                        </Button>
                      </Link>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Back to home */}
            <div
              className={cn(
                'flex justify-center animate-fade-in-up',
                '[@media(prefers-reduced-motion:reduce)]:animate-none'
              )}
              style={{ animationDelay: '200ms', animationFillMode: 'backwards' }}
            >
              <Link to="/">
                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
                  <Home className="h-4 w-4" />
                  Back to home
                </Button>
              </Link>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-border px-4 py-6 sm:px-6" role="contentinfo">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4">
            <span className="text-sm text-muted-foreground">© ClawCloud</span>
            <div className="flex flex-wrap gap-4 sm:gap-6">
              <Link
                to="/help"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
              >
                Help
              </Link>
              <Link
                to="/privacy"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
              >
                Privacy
              </Link>
              <Link
                to="/terms"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
              >
                Terms
              </Link>
              <Link
                to="/cookies"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
              >
                Cookies
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </AnimatedPage>
  )
}
