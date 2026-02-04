import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AnimatedPage } from '@/components/layout/AnimatedPage'
import { Bot, Play, Pause, Square, RotateCcw, User } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function WebAgentRuns() {
  return (
    <AnimatedPage>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Web Agent Runs</h1>
            <p className="text-muted-foreground">
              Start/monitor browser automation with approval checkpoints
            </p>
          </div>
          <div className="flex gap-2">
            <Select>
              <SelectTrigger className="w-[180px] border-border bg-card">
                <SelectValue placeholder="Profile" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ephemeral">Ephemeral</SelectItem>
                <SelectItem value="persistent">Persistent</SelectItem>
              </SelectContent>
            </Select>
            <Button className="gap-2">
              <Play className="h-4 w-4" />
              Start run
            </Button>
          </div>
        </div>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Recorder / Script Preview</CardTitle>
            <CardDescription className="text-muted-foreground">
              High-level action list
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              No script loaded. Start a run to see the action list.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Run Timeline</CardTitle>
            <CardDescription className="text-muted-foreground">
              Chronological steps with screenshots/logs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Bot className="mb-4 h-12 w-12 opacity-50" />
              <p className="text-sm">No runs yet</p>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" disabled>
                  <Pause className="mr-2 h-4 w-4" />
                  Pause
                </Button>
                <Button variant="outline" size="sm" disabled>
                  <Square className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button variant="outline" size="sm" disabled>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Retry
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <User className="h-5 w-5" />
              Profile Management
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Manage encrypted persistent profiles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline">Manage profiles</Button>
          </CardContent>
        </Card>
      </div>
    </AnimatedPage>
  )
}
