import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { AnimatedPage } from '@/components/layout/AnimatedPage'
import { Zap, Plus, Calendar, Clock, Trash2 } from 'lucide-react'
const mockAutomations = [
  {
    id: '1',
    name: 'Daily Digest',
    skillName: 'Inbox Zero',
    trigger: 'schedule',
    nextRun: 'Tomorrow 08:00',
    enabled: true,
  },
  {
    id: '2',
    name: 'Meeting Prep',
    skillName: 'Meeting Master',
    trigger: 'event',
    nextRun: 'On calendar event',
    enabled: false,
  },
]

export function Automations() {
  return (
    <AnimatedPage>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Automations</h1>
            <p className="text-muted-foreground">
              Manage scheduled runs and automation rules
            </p>
          </div>
          <Button asChild>
            <Link to="/dashboard/automations/new" className="gap-2">
              <Plus className="h-4 w-4" />
              Create automation
            </Link>
          </Button>
        </div>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Automation List</CardTitle>
            <CardDescription className="text-muted-foreground">
              Name, trigger, next run time, status toggle
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockAutomations.map((a) => (
                <div
                  key={a.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-card/50 p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Zap className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{a.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Skill: {a.skillName} • {a.trigger}
                      </p>
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        Next: {a.nextRun}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Switch defaultChecked={a.enabled} />
                    <Link to={`/dashboard/runs?automation=${a.id}`}>
                      <Button variant="ghost" size="sm">
                        Last run
                      </Button>
                    </Link>
                    <Button variant="ghost" size="icon" aria-label="Delete">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Calendar className="h-5 w-5" />
              Run Calendar View
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Visual schedule of upcoming runs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Calendar view placeholder. Integrate with a calendar component.
            </p>
          </CardContent>
        </Card>
      </div>
    </AnimatedPage>
  )
}
