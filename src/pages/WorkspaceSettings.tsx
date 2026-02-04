import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { AnimatedPage } from '@/components/layout/AnimatedPage'
import {
  Building2,
  Users,
  CreditCard,
  Shield,
  FileText,
  Download,
  ShieldCheck,
  Plus,
  Bell,
  Pencil,
  MoreHorizontal,
  ChevronRight,
  UserCog,
  LogOut,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useProfileView } from '@/hooks/useProfile'
import { useApprovalRules, useCreateApprovalRule } from '@/hooks/useApprovals'
import { RuleCreationForm } from '@/components/approvals'
import type { ApprovalRuleInsert } from '@/types/approval'
import {
  useCurrentWorkspace,
  useUpdateWorkspace,
  useWorkspaceMembers,
  useInviteWorkspaceMember,
  useUpdateWorkspaceMemberRole,
  useRemoveWorkspaceMember,
  useWorkspaceBilling,
  useUpdateWorkspaceBilling,
  useWorkspaceSecurityPolicy,
  useUpdateWorkspaceSecurityPolicy,
} from '@/hooks/useWorkspaceSettings'
import {
  InviteUserForm,
  EditRoleDialog,
  BillingManagementSheet,
  SecurityPolicyForm,
} from '@/components/workspace-settings'
import type { InviteUserFormValues } from '@/components/workspace-settings'
import type { BillingFormValues } from '@/components/workspace-settings'
import type { WorkspaceMember } from '@/types/workspace'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent } from '@/components/ui/dialog'

const SECTION_IDS = ['overview', 'team', 'billing', 'security', 'approval-rules', 'notifications', 'audit'] as const

function SectionNav({ activeId }: { activeId: string }) {
  return (
    <nav
      className="sticky top-0 z-10 -mx-2 flex flex-wrap gap-1 rounded-lg border border-border bg-card/80 p-2 backdrop-blur sm:gap-2"
      aria-label="Workspace settings sections"
    >
      {[
        { id: 'overview', label: 'Overview', icon: Building2 },
        { id: 'team', label: 'Team', icon: Users },
        { id: 'billing', label: 'Billing', icon: CreditCard },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'approval-rules', label: 'Approval rules', icon: ShieldCheck },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'audit', label: 'Audit & Data', icon: FileText },
      ].map(({ id, label, icon: Icon }) => (
        <a
          key={id}
          href={`#${id}`}
          className={cn(
            'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
            activeId === id
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
          )}
        >
          <Icon className="h-4 w-4" aria-hidden />
          {label}
        </a>
      ))}
    </nav>
  )
}

export function WorkspaceSettings() {
  const { data: profile } = useProfileView()
  const { data: workspace, isLoading: workspaceLoading } = useCurrentWorkspace()
  const updateWorkspaceMutation = useUpdateWorkspace()
  const { data: members = [], isLoading: membersLoading } = useWorkspaceMembers(workspace?.id)
  const inviteMemberMutation = useInviteWorkspaceMember(workspace?.id)
  const updateRoleMutation = useUpdateWorkspaceMemberRole(workspace?.id)
  const removeMemberMutation = useRemoveWorkspaceMember(workspace?.id)
  const { data: billing, isLoading: billingLoading } = useWorkspaceBilling(workspace?.id)
  const updateBillingMutation = useUpdateWorkspaceBilling(workspace?.id)
  const { data: securityPolicy, isLoading: policyLoading } = useWorkspaceSecurityPolicy(workspace?.id)
  const updatePolicyMutation = useUpdateWorkspaceSecurityPolicy(workspace?.id)
  const { data: rules = [], isLoading: rulesLoading } = useApprovalRules()
  const createRule = useCreateApprovalRule()

  const [ruleFormOpen, setRuleFormOpen] = useState(false)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [editRoleMember, setEditRoleMember] = useState<WorkspaceMember | null>(null)
  const [billingSheetOpen, setBillingSheetOpen] = useState(false)
  const [securityPolicyOpen, setSecurityPolicyOpen] = useState(false)
  const [workspaceName, setWorkspaceName] = useState(workspace?.name ?? '')
  const [activeSection, setActiveSection] = useState<string>(SECTION_IDS[0])

  const sectionRefs = useRef<Record<string, HTMLElement | null>>({})

  useEffect(() => {
    if (workspace) setWorkspaceName(workspace.name)
  }, [workspace?.name])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActiveSection(e.target.id)
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0 }
    )
    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [workspaceLoading])

  const handleCreateRule = (payload: ApprovalRuleInsert) => {
    createRule.mutate(payload, { onSuccess: () => setRuleFormOpen(false) })
  }

  const handleInviteSubmit = (values: InviteUserFormValues) => {
    if (!workspace?.id) return
    inviteMemberMutation.mutate(values, {
      onSuccess: () => setInviteOpen(false),
    })
  }

  const handleEditRoleSubmit = (memberId: string, values: { role: 'admin' | 'member' | 'viewer' }) => {
    updateRoleMutation.mutate({ memberId, updates: { role: values.role } }, {
      onSuccess: () => setEditRoleMember(null),
    })
  }

  const handleBillingSave = (values: BillingFormValues) => {
    updateBillingMutation.mutate(
      { plan: values.plan, payment_method_id: values.payment_method_id ?? null },
      { onSuccess: () => setBillingSheetOpen(false) }
    )
  }

  const handleSecurityPolicySubmit = (values: {
    default_action_level: 'draft_only' | 'requires_approval' | 'always_allow'
    allowed_auto_run_types: string[]
    connectors_whitelist: string[]
  }) => {
    updatePolicyMutation.mutate(values, { onSuccess: () => setSecurityPolicyOpen(false) })
  }

  const handleWorkspaceNameBlur = () => {
    if (!workspace?.id || workspaceName === workspace.name) return
    if (workspaceName.trim()) {
      updateWorkspaceMutation.mutate({
        workspaceId: workspace.id,
        updates: { name: workspaceName.trim() },
      })
    } else {
      setWorkspaceName(workspace.name)
    }
  }

  const usage = workspace?.usage_stats
  const usageText = usage
    ? `${usage.skills_used ?? 0}/${usage.skills_limit ?? 10} skills, ${usage.runs_this_month ?? 0}/${usage.runs_limit ?? 50} runs this month`
    : '—'

  return (
    <AnimatedPage>
      <div className="space-y-8">
        <header>
          <h1 className="text-2xl font-bold text-foreground">Workspace Settings</h1>
          <p className="text-muted-foreground">
            Admin-level workspace configuration and security policies
          </p>
        </header>

        <SectionNav activeId={activeSection} />

        {workspaceLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-40 rounded-lg bg-card" />
            <Skeleton className="h-32 rounded-lg bg-card" />
          </div>
        ) : (
          <>
            <section id="overview" ref={(el) => { sectionRefs.current['overview'] = el }} className="scroll-mt-24">
              <Card className="border-border bg-card transition-shadow duration-200 hover:shadow-card">
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
                      value={workspaceName}
                      onChange={(e) => setWorkspaceName(e.target.value)}
                      onBlur={handleWorkspaceNameBlur}
                      className="border-border bg-background max-w-md"
                      disabled={updateWorkspaceMutation.isPending}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Plan: <span className="capitalize text-foreground">{workspace?.plan ?? '—'}</span>
                    {' • '}
                    Usage: {usageText}
                  </p>
                </CardContent>
              </Card>
            </section>

            <section id="team" ref={(el) => { sectionRefs.current['team'] = el }} className="scroll-mt-24">
              <Card className="border-border bg-card transition-shadow duration-200 hover:shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <Users className="h-5 w-5" />
                    Team Management
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Invite users, roles, permissions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {membersLoading ? (
                    <Skeleton className="h-24 w-full rounded-lg bg-muted" />
                  ) : members.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No members yet. Invite someone to get started.</p>
                  ) : (
                    <ul className="space-y-2">
                      {members.map((member) => (
                        <li
                          key={member.id}
                          className={cn(
                            'flex items-center justify-between rounded-lg border border-border bg-muted/20 px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted/30'
                          )}
                        >
                          <div className="flex flex-col gap-0.5">
                            <span className="font-medium">
                              {member.full_name || member.email || member.user_id.slice(0, 8)}
                            </span>
                            {member.email && (
                              <span className="text-xs text-muted-foreground">{member.email}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="rounded-full bg-muted px-2 py-0.5 text-xs capitalize text-muted-foreground">
                              {member.role}
                            </span>
                            {member.role !== 'owner' && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    aria-label="Member options"
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="border-border bg-card">
                                  <DropdownMenuItem
                                    onClick={() => setEditRoleMember(member)}
                                    className="text-foreground"
                                  >
                                    <UserCog className="mr-2 h-4 w-4" />
                                    Edit role
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      removeMemberMutation.mutate(member.id, {
                                        onSuccess: () => setEditRoleMember(null),
                                      })
                                    }
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Remove
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                  <Button
                    variant="outline"
                    className="gap-2 border-border transition-transform hover:scale-[1.02]"
                    onClick={() => setInviteOpen(true)}
                  >
                    <Plus className="h-4 w-4" />
                    Invite member
                  </Button>
                </CardContent>
              </Card>
            </section>

            <section id="billing" ref={(el) => { sectionRefs.current['billing'] = el }} className="scroll-mt-24">
              <Card className="border-border bg-card transition-shadow duration-200 hover:shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <CreditCard className="h-5 w-5" />
                    Billing & Subscription
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Plan details, payment method, upgrade/downgrade
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Current plan: <span className="capitalize font-medium text-foreground">{billing?.plan ?? workspace?.plan ?? '—'}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Update payment method and view invoices in the billing sheet.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="border-border transition-transform hover:scale-[1.02]"
                      onClick={() => setBillingSheetOpen(true)}
                    >
                      Manage billing
                    </Button>
                    <Button variant="outline" asChild className="gap-2 border-border transition-transform hover:scale-[1.02]">
                      <Link to="/checkout">
                        Upgrade plan
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </section>

            <section id="security" ref={(el) => { sectionRefs.current['security'] = el }} className="scroll-mt-24">
              <Card className="border-border bg-card transition-shadow duration-200 hover:shadow-card">
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
                    Default approval level:{' '}
                    <span className="capitalize text-foreground">
                      {securityPolicy?.default_action_level?.replace('_', ' ') ?? 'Requires approval'}
                    </span>{' '}
                    for irreversible actions
                  </p>
                  <Button
                    variant="outline"
                    className="border-border transition-transform hover:scale-[1.02]"
                    onClick={() => setSecurityPolicyOpen(true)}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit policies
                  </Button>
                </CardContent>
              </Card>
            </section>

            <section id="approval-rules" ref={(el) => { sectionRefs.current['approval-rules'] = el }} className="scroll-mt-24">
              <Card className="border-border bg-card transition-shadow duration-200 hover:shadow-card">
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
                      className="gap-2 border-border transition-transform hover:scale-[1.02]"
                      onClick={() => setRuleFormOpen(true)}
                    >
                      <Plus className="h-4 w-4" />
                      Create rule
                    </Button>
                  )}
                </CardContent>
              </Card>
            </section>

            <section id="notifications" ref={(el) => { sectionRefs.current['notifications'] = el }} className="scroll-mt-24">
              <Card className="border-border bg-card transition-shadow duration-200 hover:shadow-card">
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
            </section>

            <section id="audit" ref={(el) => { sectionRefs.current['audit'] = el }} className="scroll-mt-24">
              <Card className="border-border bg-card transition-shadow duration-200 hover:shadow-card">
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
                    <Button variant="outline" className="gap-2 border-border transition-transform hover:scale-[1.02]">
                      <Download className="h-4 w-4" />
                      Data export & retention
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </section>
          </>
        )}

        <InviteUserForm
          open={inviteOpen}
          onOpenChange={setInviteOpen}
          onSubmit={handleInviteSubmit}
          isSubmitting={inviteMemberMutation.isPending}
        />

        <EditRoleDialog
          open={!!editRoleMember}
          onOpenChange={(open) => !open && setEditRoleMember(null)}
          member={editRoleMember}
          onSubmit={handleEditRoleSubmit}
          isSubmitting={updateRoleMutation.isPending}
        />

        <BillingManagementSheet
          open={billingSheetOpen}
          onOpenChange={setBillingSheetOpen}
          billing={billing}
          isLoading={billingLoading}
          onSave={handleBillingSave}
          isSubmitting={updateBillingMutation.isPending}
        />

        <SecurityPolicyForm
          open={securityPolicyOpen}
          onOpenChange={setSecurityPolicyOpen}
          policy={securityPolicy}
          isLoading={policyLoading}
          onSubmit={handleSecurityPolicySubmit}
          isSubmitting={updatePolicyMutation.isPending}
        />

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
      </div>
    </AnimatedPage>
  )
}
