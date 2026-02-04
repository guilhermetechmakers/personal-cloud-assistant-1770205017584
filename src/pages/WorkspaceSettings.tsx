import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { AnimatedPage } from '@/components/layout/AnimatedPage'
import { Building2, Users, CreditCard, Shield, FileText, Download, ShieldCheck, Plus, Bell } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useApprovalRules, useCreateApprovalRule } from '@/hooks/useApprovals'
import { useProfileView } from '@/hooks/useProfile'
import { RuleCreationForm } from '@/components/approvals'
import type { ApprovalRuleInsert } from '@/types/approval'
import { cn } from '@/lib/utils'

export function WorkspaceSettings() {
  const { data: profile } = useProfileView()
  const { data: rules = [], isLoading: rulesLoading } = useApprovalRules()
  const createRule = useCreateApprovalRule()
  const [ruleFormOpen, setRuleFormOpen] = useState(false)

  const handleCreateRule = (payload: ApprovalRuleInsert) => {
    createRule.mutate(payload, {
      onSuccess: () => setRuleFormOpen(false),
    })
  }
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
              <ShieldCheck className="h-5 w-5" />
              Approval rules
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Auto-approval rules for matching actions (Trust & Controls)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {rulesLoading ? (
              <p className="text-sm text-muted-foreground">Loading rules…</p>
            ) : rules.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No approval rules yet. Create a rule to auto-approve future matching actions.
              </p>
            ) : (
              <ul className="space-y-2">
                {rules.map((rule) => (
                  <li
                    key={rule.id}
                    className={cn(
                      'flex items-center justify-between rounded-lg border border-border bg-muted/20 px-3 py-2 text-sm text-foreground'
                    )}
                  >
                    <span className="font-medium">{rule.name}</span>
                    <span className="text-muted-foreground">{rule.action_type}</span>
                  </li>
                ))}
              </ul>
            )}
            {profile?.id && (
              <Button
                variant="outline"
                className="gap-2 border-border"
                onClick={() => setRuleFormOpen(true)}
              >
                <Plus className="h-4 w-4" />
                Create rule
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Notification channels (in-app, email, push) and preferences per event type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/dashboard/notifications">
              <Button variant="outline" className="transition-transform hover:scale-[1.02]">
                Notification preferences
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <FileText className="h-5 w-5" />
              Audit Logs & Data
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Export data and configure retention policies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/dashboard/data-management">
              <Button variant="outline" className="gap-2 transition-transform hover:scale-[1.02]">
                <Download className="h-4 w-4" />
                Data export & retention
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Dialog open={ruleFormOpen} onOpenChange={setRuleFormOpen}>
        <DialogContent className="sm:max-w-md border-border bg-card p-0 gap-0">
          {profile?.id && (
            <RuleCreationForm
              userId={profile.id}
              onSubmit={handleCreateRule}
              onCancel={() => setRuleFormOpen(false)}
              isSubmitting={createRule.isPending}
              className="border-0 shadow-none rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>
    </AnimatedPage>
  )
}
