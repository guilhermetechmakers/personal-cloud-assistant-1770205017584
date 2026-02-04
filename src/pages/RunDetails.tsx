import { useParams, Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AnimatedPage } from '@/components/layout/AnimatedPage'
import { ArrowLeft, Clock, User, CheckCircle, FileOutput, Download } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

export function RunDetails() {
  const { id } = useParams<{ id: string }>()

  return (
    <AnimatedPage>
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Link to="/dashboard">
            <Button variant="ghost" size="icon" aria-label="Back">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Run Details</h1>
            <p className="text-muted-foreground">
              Run ID: {id || '—'}
            </p>
          </div>
        </div>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Run Header</CardTitle>
            <CardDescription className="text-muted-foreground">
              Skill name, initiator, status, timestamps
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-6 text-sm">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                Started: —
              </span>
              <span className="flex items-center gap-2 text-muted-foreground">
                <User className="h-4 w-4" />
                Initiator: —
              </span>
              <span className="rounded bg-success/20 px-2 py-0.5 text-success">
                Completed
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <CheckCircle className="h-5 w-5" />
              Steps Timeline
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Step inputs/outputs, AI logs, artifacts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-lg border border-border p-4">
                <p className="text-sm font-medium text-foreground">Step 1</p>
                <p className="text-xs text-muted-foreground">Fetch • Completed</p>
              </div>
              <Separator />
              <div className="rounded-lg border border-border p-4">
                <p className="text-sm font-medium text-foreground">Step 2</p>
                <p className="text-xs text-muted-foreground">Transform • Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <FileOutput className="h-5 w-5" />
              Artifacts
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Screenshots, exports, downloads
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export (PDF/JSON)
            </Button>
          </CardContent>
        </Card>
      </div>
    </AnimatedPage>
  )
}
