import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AnimatedPage } from '@/components/layout/AnimatedPage'
import { Mail, CheckSquare, MessageSquare, Clock, ChevronRight } from 'lucide-react'

export function Dashboard() {
  return (
    <AnimatedPage>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Today&apos;s Digest</h1>
          <p className="text-muted-foreground">Your assistant outputs and action items</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-medium text-foreground">
                Top threads
              </CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                No threads yet. Connect Gmail and install Inbox Zero pack.
              </p>
              <Link to="/dashboard/skills">
                <Button variant="link" className="mt-2 p-0 h-auto gap-1">
                  Browse skills <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-medium text-foreground">
                Action required
              </CardTitle>
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                No pending approvals.
              </p>
              <Link to="/dashboard">
                <Button variant="link" className="mt-2 p-0 h-auto gap-1">
                  View approvals <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-medium text-foreground">
                Suggested replies
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Draft replies will appear here after digest runs.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Run history</CardTitle>
            <CardDescription className="text-muted-foreground">
              Recent skill and automation runs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <Clock className="mb-4 h-12 w-12 opacity-50" />
              <p className="text-sm">No runs yet</p>
              <Link to="/dashboard/automations">
                <Button variant="outline" className="mt-4">
                  Set up automations
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </AnimatedPage>
  )
}
