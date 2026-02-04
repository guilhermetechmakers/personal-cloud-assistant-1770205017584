import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AnimatedPage } from '@/components/layout/AnimatedPage'

export function Terms() {
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
              <CardTitle className="text-foreground">Terms of Service</CardTitle>
              <p className="text-sm text-muted-foreground">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
              <section>
                <h2 className="text-lg font-semibold text-foreground">1. Acceptance</h2>
                <p>
                  By using ClawCloud, you agree to these terms.
                </p>
              </section>
              <section>
                <h2 className="text-lg font-semibold text-foreground">2. Use of service</h2>
                <p>
                  You agree to use the service in compliance with applicable laws and our policies.
                </p>
              </section>
              <section>
                <h2 className="text-lg font-semibold text-foreground">3. Contact</h2>
                <p>
                  For legal inquiries, contact legal@clawcloud.example.com.
                </p>
              </section>
            </CardContent>
          </Card>
        </div>
      </div>
    </AnimatedPage>
  )
}
