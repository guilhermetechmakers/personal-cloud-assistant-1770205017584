import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AnimatedPage } from '@/components/layout/AnimatedPage'

export function Privacy() {
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
              <CardTitle className="text-foreground">Privacy Policy</CardTitle>
              <p className="text-sm text-muted-foreground">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
              <section>
                <h2 className="text-lg font-semibold text-foreground">1. Information we collect</h2>
                <p>
                  We collect information you provide when signing up, using our services, or contacting support.
                </p>
              </section>
              <section>
                <h2 className="text-lg font-semibold text-foreground">2. How we use it</h2>
                <p>
                  We use your information to provide and improve our services, communicate with you, and ensure security.
                </p>
              </section>
              <section>
                <h2 className="text-lg font-semibold text-foreground">3. Data retention</h2>
                <p>
                  We retain your data according to our retention policy and applicable law.
                </p>
              </section>
              <section>
                <h2 className="text-lg font-semibold text-foreground">4. Contact</h2>
                <p>
                  For privacy inquiries, contact us at privacy@clawcloud.example.com.
                </p>
              </section>
            </CardContent>
          </Card>
        </div>
      </div>
    </AnimatedPage>
  )
}
