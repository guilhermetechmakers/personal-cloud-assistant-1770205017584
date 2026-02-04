import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AnimatedPage } from '@/components/layout/AnimatedPage'
import { Building2, Users, CreditCard, Shield, FileText, Download } from 'lucide-react'
import { Link } from 'react-router-dom'

export function WorkspaceSettings() {
  return (
    <AnimatedPage>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Workspace Settings</h1>
          <p className="text-muted-foreground">
            Admin-level workspace configuration and security policies
          </p>
        </div>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Building2 className="h-5 w-5" />
              Workspace Info
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Name, plan, usage stats
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="workspace-name">Workspace name</Label>
              <Input
                id="workspace-name"
                defaultValue="My Workspace"
                className="border-border bg-card max-w-md"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Plan: Pro • Usage: 2/10 skills, 5/50 runs this month
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Users className="h-5 w-5" />
              Team Management
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Invite users, roles, permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline">Invite member</Button>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <CreditCard className="h-5 w-5" />
              Billing & Subscription
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Plan details, payment method, upgrade/downgrade
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/checkout">
              <Button variant="outline">Manage billing</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Shield className="h-5 w-5" />
              Security & Policies
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Default action levels, allowed auto-run types, connectors whitelist
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Default approval level: Requires approval for irreversible actions
            </p>
            <Button variant="outline">Edit policies</Button>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <FileText className="h-5 w-5" />
              Audit Logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export audit log
            </Button>
          </CardContent>
        </Card>
      </div>
    </AnimatedPage>
  )
}
