/**
 * Web Agent Runs & Recorder: start/monitor runs, timeline, approval checkpoints, profile management.
 */

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AnimatedPage } from '@/components/layout/AnimatedPage'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Bot,
  Play,
  Pause,
  Square,
  RotateCcw,
  User,
  ChevronDown,
  ChevronRight,
  Image as ImageIcon,
  FileText,
  CheckCircle,
  AlertCircle,
  Clock,
} from 'lucide-react'
import {
  useWebAgentRunsList,
  useWebAgentRun,
  useWebAgentRunSteps,
  useCreateWebAgentRun,
  useUpdateWebAgentRun,
  useUpsertWebAgentStepApproval,
  useWebAgentProfiles,
  useCreateWebAgentProfile,
  useUpdateWebAgentProfile,
  useDeleteWebAgentProfile,
} from '@/hooks/useWebAgentRuns'
import { getScriptPreviewForRun } from '@/lib/webAgent'
import {
  StartRunModal,
  WebAgentApprovalDialog,
  ProfileManagementModal,
  RunSummaryDialog,
} from '@/components/web-agent'
import type {
  WebAgentRunStep,
  WebAgentProfile,
  WebAgentProfileType,
} from '@/types/webAgent'
import { cn } from '@/lib/utils'

const RUN_STATUS_STYLES: Record<string, string> = {
  pending: 'bg-muted text-muted-foreground',
  running: 'bg-primary/20 text-primary',
  paused: 'bg-warning/20 text-warning',
  completed: 'bg-success/20 text-success',
  failed: 'bg-destructive/20 text-destructive',
  cancelled: 'bg-muted text-muted-foreground',
  awaiting_approval: 'bg-warning/20 text-warning',
}

export function WebAgentRuns() {
  const [startModalOpen, setStartModalOpen] = useState(false)
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false)
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [summaryDialogOpen, setSummaryDialogOpen] = useState(false)
  const [editingProfile, setEditingProfile] = useState<WebAgentProfile | null>(null)
  const [selectedStepForApproval, setSelectedStepForApproval] = useState<WebAgentRunStep | null>(null)
  const [expandedStepIds, setExpandedStepIds] = useState<Set<string>>(new Set())

  const { data: runs = [], isLoading: runsLoading } = useWebAgentRunsList({ limit: 50 })
  const { data: profiles = [], isLoading: profilesLoading } = useWebAgentProfiles()

  const activeRun = useMemo(
    () => runs.find((r) => r.status === 'running' || r.status === 'paused') ?? runs[0] ?? null,
    [runs]
  )
  const selectedRunId = activeRun?.id ?? null

  const { data: run, isLoading: runLoading } = useWebAgentRun(selectedRunId)
  const { data: steps = [], isLoading: stepsLoading } = useWebAgentRunSteps(selectedRunId)

  const createRun = useCreateWebAgentRun()
  const updateRun = useUpdateWebAgentRun(selectedRunId)
  const upsertApproval = useUpsertWebAgentStepApproval(selectedRunId)
  const createProfile = useCreateWebAgentProfile()
  const updateProfile = useUpdateWebAgentProfile()
  const deleteProfile = useDeleteWebAgentProfile()

  const scriptPreview = useMemo(() => getScriptPreviewForRun(run ?? null), [run])

  const handleStartRun = (profileType: WebAgentProfileType, profileId?: string) => {
    createRun.mutate(
      {
        profile_type: profileType,
        profile_id: profileId || null,
        status: 'running',
        start_time: new Date().toISOString(),
        script_preview: [
          { label: 'Navigate to target', type: 'navigate', order: 0 },
          { label: 'Fill form', type: 'fill', order: 1 },
          { label: 'Submit', type: 'submit', order: 2 },
        ],
      },
      {
        onSuccess: (data) => {
          setStartModalOpen(false)
          if (data) setSummaryDialogOpen(false)
        },
      }
    )
  }

  const handlePause = () => {
    if (!selectedRunId) return
    updateRun.mutate({
      id: selectedRunId,
      updates: { status: 'paused' },
    })
  }

  const handleCancel = () => {
    if (!selectedRunId) return
    updateRun.mutate({
      id: selectedRunId,
      updates: {
        status: 'cancelled',
        end_time: new Date().toISOString(),
      },
    })
    setSummaryDialogOpen(true)
  }

  const handleRetry = () => {
    if (!selectedRunId) return
    updateRun.mutate({
      id: selectedRunId,
      updates: { status: 'running' },
    })
  }

  const openApprovalForStep = (step: WebAgentRunStep) => {
    setSelectedStepForApproval(step)
    setApprovalDialogOpen(true)
  }

  const handleApprovalSubmit = (
    payload: Record<string, unknown>,
    decisionNote?: string
  ) => {
    if (!selectedStepForApproval) return
    upsertApproval.mutate(
      {
        stepId: selectedStepForApproval.id,
        payload: {
          status: 'approved',
          payload,
          decision_note: decisionNote ?? null,
        },
      },
      {
        onSuccess: () => {
          setApprovalDialogOpen(false)
          setSelectedStepForApproval(null)
        },
      }
    )
  }

  const handleApprovalReject = (decisionNote?: string) => {
    if (!selectedStepForApproval) return
    upsertApproval.mutate(
      {
        stepId: selectedStepForApproval.id,
        payload: {
          status: 'rejected',
          decision_note: decisionNote ?? null,
        },
      },
      {
        onSuccess: () => {
          setApprovalDialogOpen(false)
          setSelectedStepForApproval(null)
        },
      }
    )
  }

  const toggleStepExpanded = (stepId: string) => {
    setExpandedStepIds((prev) => {
      const next = new Set(prev)
      if (next.has(stepId)) next.delete(stepId)
      else next.add(stepId)
      return next
    })
  }

  const handleProfileCreate = (values: {
    name: string
    profile_type: WebAgentProfileType
  }) => {
    createProfile.mutate(values, {
      onSuccess: () => {
        setProfileModalOpen(false)
        setEditingProfile(null)
      },
    })
  }

  const handleProfileUpdate = (
    profileId: string,
    values: { name: string; profile_type: WebAgentProfileType }
  ) => {
    updateProfile.mutate(
      { profileId, updates: values },
      {
        onSuccess: () => {
          setProfileModalOpen(false)
          setEditingProfile(null)
        },
      }
    )
  }

  const handleProfileDelete = (profileId: string) => {
    deleteProfile.mutate(profileId)
    setProfileModalOpen(false)
    setEditingProfile(null)
  }

  const isRunActive =
    run?.status === 'running' || run?.status === 'paused'
  const hasRun = !!run

  return (
    <AnimatedPage>
      <div className="space-y-8 animate-fade-in-up">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Web Agent Runs</h1>
            <p className="text-muted-foreground">
              Start and monitor browser automation with approval checkpoints
            </p>
          </div>
          <Button
            onClick={() => setStartModalOpen(true)}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-transform hover:scale-[1.02]"
          >
            <Play className="h-4 w-4" />
            Start run
          </Button>
        </div>

        <Card className="border-border bg-card transition-all duration-200 hover:border-border/80">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Recorder / Script Preview
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              High-level action list for the current run
            </CardDescription>
          </CardHeader>
          <CardContent>
            {runLoading ? (
              <Skeleton className="h-20 w-full rounded-lg bg-muted/50" />
            ) : scriptPreview.length > 0 ? (
              <ul className="space-y-2">
                {scriptPreview.map((action, i) => (
                  <li
                    key={action.id ?? i}
                    className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-foreground"
                  >
                    <span className="text-muted-foreground">{i + 1}.</span>
                    {action.label}
                    {action.type && (
                      <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                        {action.type}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                No script loaded. Start a run to see the action list.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-border bg-card transition-all duration-200 hover:border-border/80">
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-foreground">Run Timeline</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Chronological steps with screenshots and logs
                </CardDescription>
              </div>
              {hasRun && (
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!isRunActive}
                    onClick={handlePause}
                    className="border-border"
                  >
                    <Pause className="mr-2 h-4 w-4" />
                    Pause
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!isRunActive}
                    onClick={handleCancel}
                    className="border-border"
                  >
                    <Square className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isRunActive}
                    onClick={handleRetry}
                    className="border-border"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Retry
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {runsLoading || (selectedRunId && stepsLoading) ? (
              <div className="space-y-3">
                <Skeleton className="h-14 w-full rounded-lg" />
                <Skeleton className="h-14 w-full rounded-lg" />
                <Skeleton className="h-14 w-full rounded-lg" />
              </div>
            ) : run && steps.length > 0 ? (
              <ScrollArea className="h-[400px] pr-4">
                <ul className="space-y-2">
                  {steps.map((step) => (
                    <TimelineStepItem
                      key={step.id}
                      step={step}
                      isExpanded={expandedStepIds.has(step.id)}
                      onToggle={() => toggleStepExpanded(step.id)}
                      onApprove={() => openApprovalForStep(step)}
                    />
                  ))}
                </ul>
              </ScrollArea>
            ) : run && steps.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Clock className="mb-4 h-12 w-12 opacity-50" />
                <p className="text-sm">Run in progress. Steps will appear here.</p>
                <p className="mt-1 text-xs">
                  Run ID: {run.id.slice(0, 8)}… • {run.status}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Bot className="mb-4 h-12 w-12 opacity-50" />
                <p className="text-sm">No runs yet</p>
                <p className="mt-1 text-xs">Start a run to see the timeline</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 border-border"
                  onClick={() => setStartModalOpen(true)}
                >
                  <Play className="mr-2 h-4 w-4" />
                  Start run
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border bg-card transition-all duration-200 hover:border-border/80">
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
            {profilesLoading ? (
              <Skeleton className="h-10 w-32 rounded-lg" />
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingProfile(null)
                    setProfileModalOpen(true)
                  }}
                  className="border-border"
                >
                  Add profile
                </Button>
                {profiles.map((p) => (
                  <Button
                    key={p.id}
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingProfile(p)
                      setProfileModalOpen(true)
                    }}
                    className="text-foreground hover:bg-muted/50"
                  >
                    {p.name}
                    <span className="ml-1 rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                      {p.profile_type}
                    </span>
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <StartRunModal
        open={startModalOpen}
        onOpenChange={setStartModalOpen}
        profiles={profiles}
        onStart={handleStartRun}
        isStarting={createRun.isPending}
      />

      <WebAgentApprovalDialog
        open={approvalDialogOpen}
        onOpenChange={setApprovalDialogOpen}
        step={selectedStepForApproval}
        approval={null}
        onApprove={handleApprovalSubmit}
        onReject={handleApprovalReject}
        isSubmitting={upsertApproval.isPending}
      />

      <ProfileManagementModal
        open={profileModalOpen}
        onOpenChange={setProfileModalOpen}
        profiles={profiles}
        editingProfile={editingProfile}
        onCreate={handleProfileCreate}
        onUpdate={handleProfileUpdate}
        onDelete={handleProfileDelete}
        isSubmitting={createProfile.isPending || updateProfile.isPending}
      />

      <RunSummaryDialog
        open={summaryDialogOpen}
        onOpenChange={setSummaryDialogOpen}
        run={run ?? null}
        steps={steps}
        onClose={() => setSummaryDialogOpen(false)}
      />
    </AnimatedPage>
  )
}

interface TimelineStepItemProps {
  step: WebAgentRunStep
  isExpanded: boolean
  onToggle: () => void
  onApprove: () => void
}

function TimelineStepItem({
  step,
  isExpanded,
  onToggle,
  onApprove,
}: TimelineStepItemProps) {
  const needsApproval =
    step.requires_approval && step.status === 'awaiting_approval'
  const statusStyle = RUN_STATUS_STYLES[step.status] ?? 'bg-muted text-muted-foreground'

  return (
    <li
      className={cn(
        'rounded-lg border transition-all duration-200',
        'border-border bg-card hover:border-border/80',
        needsApproval && 'border-warning/50 ring-1 ring-warning/20'
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-3 p-4 text-left"
        aria-expanded={isExpanded}
      >
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
        <span className="min-w-0 flex-1 font-medium text-foreground">
          {step.description || `Step ${step.step_index + 1}`}
        </span>
        <span
          className={cn(
            'shrink-0 rounded px-2 py-0.5 text-xs font-medium',
            statusStyle
          )}
        >
          {step.status}
        </span>
        {needsApproval && (
          <AlertCircle className="h-4 w-4 shrink-0 text-warning" aria-hidden />
        )}
      </button>
      {isExpanded && (
        <div className="border-t border-border px-4 pb-4 pt-2">
          <div className="space-y-3 pl-7">
            {step.screenshot_url && (
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Screenshot
                </p>
                <a
                  href={step.screenshot_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  <ImageIcon className="h-4 w-4" />
                  View
                </a>
              </div>
            )}
            {step.logs && (
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Logs
                </p>
                <pre className="max-h-32 overflow-auto rounded bg-muted/50 p-3 text-xs text-foreground">
                  {step.logs}
                </pre>
              </div>
            )}
            {needsApproval && (
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onApprove()
                }}
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <CheckCircle className="h-4 w-4" />
                Review & approve
              </Button>
            )}
          </div>
        </div>
      )}
    </li>
  )
}
