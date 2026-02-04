import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AnimatedPage } from '@/components/layout/AnimatedPage'
import { Building2, Plug, Bot, Package, FileText, BarChart3 } from 'lucide-react'

const metrics = [
  { label: 'Workspaces', value: '—', icon: Building2 },
  { label: 'Active connectors', value: '—', icon: Plug },
  { label: 'Web Agent workers', value: '—', icon: Bot },
]

export function AdminDashboard() {
  return (
    <AnimatedPage>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Operator tools: system health, packs, workspaces
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {metrics.map((m) => {
            const Icon = m.icon
            return (
              <Card key={m.label} className="border-border bg-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {m.label}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-foreground">{m.value}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Workspace List</CardTitle>
            <CardDescription className="text-muted-foreground">
              Quick actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No workspaces</p>
          </CardContent>
        </Card>

        <div className="grid gap-6 sm:grid-cols-2">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Plug className="h-5 w-5" />
                Connector Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">—</p>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Bot className="h-5 w-5" />
                Web Agent Cluster
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">—</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Package className="h-5 w-5" />
              Pack Management CMS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="outline">Manage packs</Button>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <FileText className="h-5 w-5" />
              Logs & Monitoring
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              View logs
            </Button>
          </CardContent>
        </Card>
      </div>
    </AnimatedPage>
  )
}
