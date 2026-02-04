/**
 * Run Details / History: view single run with timeline, approvals, artifacts, export/share.
 */

import { useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AnimatedPage } from '@/components/layout/AnimatedPage'
import {
  ArrowLeft,
  Clock,
  User,
  CheckCircle,
  FileOutput,
  Download,
  Share2,
  ChevronDown,
  ChevronRight,
  Pencil,
  AlertCircle,
  ExternalLink,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  useRunDetails,
  useUpdateRunApproval,
  useExportRun,
  useShareLink,
} from '@/hooks/useRunDetails'
import {
  ApprovalEditModal,
  ExportModal,
  ShareLinkDialog,
} from '@/components/run-details'
import type {
  RunStep,
  RunApproval,
  RunArtifact,
  RunApprovalUpdate,
} from '@/types/run'
import type { ExportFormat } from '@/components/run-details'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

const statusColors: Record<string, string> = {
  pending: 'bg-warning/20 text-warning',
  running: 'bg-primary/20 text-primary',
  completed: 'bg-success/20 text-success',
  failed: 'bg-destructive/20 text-destructive',
  cancelled: 'bg-muted text-muted-foreground',
}

function StepCard({
  step,
  isExpanded,
  onToggle,
}: {
  step: RunStep
  isExpanded: boolean
  onToggle: () => void
}) {
  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-card transition-all duration-200',
        'hover:border-border/80 hover:shadow-card'
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 p-4 text-left"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-3">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          )}
          <span className="font-medium text-foreground capitalize">
            {step.step_type}
          </span>
          <span
            className={cn(
              'rounded px-2 py-0.5 text-xs font-medium',
              statusColors[step.status] ?? 'bg-muted text-muted-foreground'
            )}
          >
            {step.status}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          Step {step.step_index + 1}
        </span>
      </button>
      {isExpanded && (
        <div className="border-t border-border px-4 pb-4 pt-2">
          <div className="space-y-4 pl-7">
            {step.logs && (
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Logs
                </p>
                <pre className="max-h-40 overflow-auto rounded bg-muted/50 p-3 text-xs text-foreground">
                  {step.logs}
                </pre>
              </div>
            )}
            {step.input_data && Object.keys(step.input_data).length > 0 && (
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Input
                </p>
                <pre className="max-h-32 overflow-auto rounded bg-muted/50 p-3 text-xs text-foreground">
                  {JSON.stringify(step.input_data, null, 2)}
                </pre>
              </div>
            )}
            {step.output_data && Object.keys(step.output_data).length > 0 && (
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Output
                </p>
                <pre className="max-h-32 overflow-auto rounded bg-muted/50 p-3 text-xs text-foreground">
                  {JSON.stringify(step.output_data, null, 2)}
                </pre>
              </div>
            )}
            {Array.isArray(step.artifact_links) &&
              step.artifact_links.length > 0 && (
                <div>
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Artifacts
                  </p>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    {step.artifact_links.map((link, i) => (
                      <li key={i}>
                        {typeof link === 'string' ? (
                          <a
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {link}
                          </a>
                        ) : (
                          String(link)
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
          </div>
        </div>
      )}
    </div>
  )
}

export function RunDetails() {
  const { id } = useParams<{ id: string }>()
  const runId = id ?? ''
  const { data, isLoading, isError } = useRunDetails(runId)
  const updateApproval = useUpdateRunApproval(runId)
  const exportRun = useExportRun()
  const shareLink = useShareLink()

  const [expandedStepId, setExpandedStepId] = useState<string | null>(null)
  const [approvalEditOpen, setApprovalEditOpen] = useState(false)
  const [approvalEditing, setApprovalEditing] = useState<RunApproval | null>(
    null
  )
  const [exportOpen, setExportOpen] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [shareUrl, setShareUrl] = useState<string | null>(null)

  const handleEditApproval = (approval: RunApproval) => {
    setApprovalEditing(approval)
    setApprovalEditOpen(true)
  }

  const handleSaveApproval = useCallback(
    (updates: RunApprovalUpdate) => {
      if (!approvalEditing) return
      updateApproval.mutate(
        {
          approvalId: approvalEditing.id,
          updates,
        },
        {
          onSettled: () => {
            setApprovalEditing(null)
            setApprovalEditOpen(false)
          },
        }
      )
    },
    [approvalEditing, updateApproval]
  )

  const handleExport = useCallback(
    (format: ExportFormat) => {
      exportRun.mutate(
        { runId, format },
        {
          onSuccess: (result) => {
            if (result?.json) {
              const blob = new Blob([result.json], {
                type: 'application/json',
              })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = `run-${runId.slice(0, 8)}-${formatDate(new Date())}.json`
              a.click()
              URL.revokeObjectURL(url)
              toast.success('Export downloaded')
            }
            if (result?.error) toast.error(result.error)
          },
        }
      )
    },
    [runId, exportRun]
  )

  const handleGenerateShare = useCallback(() => {
    shareLink.mutate(
      { runId, options: {} },
      {
        onSuccess: (result) => {
          if (result?.url) setShareUrl(result.url)
          if (result?.error) toast.error(result.error)
        },
      }
    )
  }, [runId, shareLink])

  function formatDate(d: Date) {
    return format(d, 'yyyy-MM-dd-HHmm')
  }

  if (!runId) {
    return (
      <AnimatedPage>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertCircle className="mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="text-lg font-semibold text-foreground">Run not found</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            No run ID provided.
          </p>
          <Link to="/dashboard">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </AnimatedPage>
    )
  }

  if (isLoading) {
    return (
      <AnimatedPage>
        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-md" />
            <div className="space-y-2">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <Skeleton className="h-32 w-full rounded-lg" />
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              <Skeleton className="h-10 w-40" />
              <Skeleton className="h-48 w-full rounded-lg" />
            </div>
            <Skeleton className="h-64 rounded-lg" />
          </div>
        </div>
      </AnimatedPage>
    )
  }

  if (isError || !data) {
    return (
      <AnimatedPage>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertCircle className="mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="text-lg font-semibold text-foreground">
            Run not found
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            This run may have been removed or you don&apos;t have access.
          </p>
          <Link to="/dashboard">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </AnimatedPage>
    )
  }

  const { run, steps, approvals, artifacts } = data

  return (
    <AnimatedPage>
      <div className="space-y-8">
        {/* Breadcrumb & back */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" aria-label="Back to Dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <nav className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link to="/dashboard" className="hover:text-foreground">
                  Dashboard
                </Link>
                <span>/</span>
                <span className="text-foreground">Run {run.id.slice(0, 8)}</span>
              </nav>
              <h1 className="mt-1 text-2xl font-bold text-foreground">
                Run Details
              </h1>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setExportOpen(true)}
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => {
                setShareUrl(null)
                setShareOpen(true)
              }}
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </div>
        </div>

        {/* Run Header */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-foreground">
              {run.skill_name ?? 'Automation run'}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Run ID: {run.id}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-6 text-sm">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                Started:{' '}
                {run.run_time
                  ? format(new Date(run.run_time), 'PPp')
                  : '—'}
              </span>
              <span className="flex items-center gap-2 text-muted-foreground">
                <User className="h-4 w-4" />
                Initiator: {run.initiator}
              </span>
              <span
                className={cn(
                  'rounded px-2 py-0.5 text-xs font-medium capitalize',
                  statusColors[run.status] ?? 'bg-muted text-muted-foreground'
                )}
              >
                {run.status}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Main + Sidebar */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Steps Timeline + Artifacts */}
          <div className="space-y-6 lg:col-span-2">
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
                {steps.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                    <CheckCircle className="mb-4 h-12 w-12 opacity-50" />
                    <p className="text-sm">No steps recorded for this run.</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-3">
                      {steps.map((step) => (
                        <StepCard
                          key={step.id}
                          step={step}
                          isExpanded={expandedStepId === step.id}
                          onToggle={() =>
                            setExpandedStepId((prev) =>
                              prev === step.id ? null : step.id
                            )
                          }
                        />
                      ))}
                    </div>
                  </ScrollArea>
                )}
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
                {artifacts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                    <FileOutput className="mb-3 h-10 w-10 opacity-50" />
                    <p className="text-sm">No artifacts for this run.</p>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {artifacts.map((a: RunArtifact) => (
                      <li key={a.id}>
                        <a
                          href={a.download_link ?? '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted/50"
                        >
                          <ExternalLink className="h-4 w-4 shrink-0" />
                          {a.label ?? a.file_type}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Approval Details */}
          <div className="lg:col-span-1">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">
                  Approval Details
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Decision, actor, rollback options
                </CardDescription>
              </CardHeader>
              <CardContent>
                {approvals.length === 0 ? (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    No approvals for this run.
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {approvals.map((approval: RunApproval) => (
                      <li
                        key={approval.id}
                        className="rounded-lg border border-border bg-muted/20 p-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {approval.requested_action}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              Decision:{' '}
                              <span
                                className={cn(
                                  approval.decision === 'approved' && 'text-success',
                                  approval.decision === 'rejected' && 'text-destructive',
                                  approval.decision === 'pending' && 'text-warning'
                                )}
                              >
                                {approval.decision}
                              </span>
                              {approval.actor && ` · ${approval.actor}`}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0"
                            onClick={() => handleEditApproval(approval)}
                            aria-label="Edit approval"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <ApprovalEditModal
        open={approvalEditOpen}
        onOpenChange={setApprovalEditOpen}
        approval={approvalEditing}
        onSave={handleSaveApproval}
        isSubmitting={updateApproval.isPending}
      />
      <ExportModal
        open={exportOpen}
        onOpenChange={setExportOpen}
        runId={runId}
        onExport={handleExport}
        isExporting={exportRun.isPending}
      />
      <ShareLinkDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        shareUrl={shareUrl}
        onGenerate={handleGenerateShare}
        isGenerating={shareLink.isPending}
      />
    </AnimatedPage>
  )
}
