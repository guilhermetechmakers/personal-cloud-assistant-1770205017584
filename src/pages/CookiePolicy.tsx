import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AnimatedPage } from '@/components/layout/AnimatedPage'

export function CookiePolicy() {
  return (
    <AnimatedPage>
      <div className="min-h-screen bg-background px-6 py-12">
        <div className="mx-auto max-w-3xl">
          <Link to="/">
            <Button variant="ghost" className="mb-8">
              ← Back
            </Button>
          </Link>
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Cookie Policy</CardTitle>
              <p className="text-sm text-muted-foreground">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
              <section>
                <h2 className="text-lg font-semibold text-foreground">1. What we use</h2>
                <p>
                  We use cookies and similar technologies for authentication, preferences, and analytics.
                </p>
              </section>
              <section>
                <h2 className="text-lg font-semibold text-foreground">2. Your choices</h2>
                <p>
                  You can manage cookie preferences in your browser or account settings.
                </p>
              </section>
              <section>
                <h2 className="text-lg font-semibold text-foreground">3. Contact</h2>
                <p>
                  For cookie-related inquiries, contact privacy@clawcloud.example.com.
                </p>
              </section>
            </CardContent>
          </Card>
        </div>
      </div>
    </AnimatedPage>
  )
}
