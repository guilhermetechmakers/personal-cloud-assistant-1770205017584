import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AnimatedPage } from '@/components/layout/AnimatedPage'
import { Search, BookOpen, MessageCircle, FileText } from 'lucide-react'

export function Help() {
  return (
    <AnimatedPage>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">About & Help</h1>
          <p className="text-muted-foreground">
            Searchable docs, connector walkthroughs, FAQ, contact support
          </p>
        </div>

        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search docs & guides..."
            className="pl-9 border-border bg-card"
            aria-label="Search"
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="border-border bg-card">
            <CardHeader>
              <BookOpen className="mb-2 h-10 w-10 text-primary" />
              <CardTitle className="text-foreground">Docs & Guides</CardTitle>
              <CardDescription className="text-muted-foreground">
                Connector setup walkthroughs and API docs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm">
                Browse docs
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <FileText className="mb-2 h-10 w-10 text-primary" />
              <CardTitle className="text-foreground">FAQ</CardTitle>
              <CardDescription className="text-muted-foreground">
                Common questions and answers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm">
                View FAQ
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <MessageCircle className="mb-2 h-10 w-10 text-primary" />
              <CardTitle className="text-foreground">Contact Support</CardTitle>
              <CardDescription className="text-muted-foreground">
                Changelog, release notes, contact form
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm">
                Contact support
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AnimatedPage>
  )
}
