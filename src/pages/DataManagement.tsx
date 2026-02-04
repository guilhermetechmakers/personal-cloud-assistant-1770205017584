/**
 * Data Management: Export data and retention settings.
 * Header, Export Data Panel, Retention Settings Panel, confirmation modals.
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AnimatedPage } from '@/components/layout/AnimatedPage'
import { ExportDataForm, RetentionPolicyForm } from '@/components/data-management'
import { useExportsList, useCreateExport } from '@/hooks/useExports'
import {
  useRetentionPoliciesList,
  useCreateRetentionPolicy,
  useDeleteRetentionPolicy,
} from '@/hooks/useRetentionPolicies'
import {
  Database,
  ChevronRight,
  Download,
  Trash2,
  ExternalLink,
  FileText,
  HelpCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { RetentionPolicy } from '@/types/export'

export function DataManagement() {
  const { data: exportsList = [], isLoading: exportsLoading } = useExportsList()
  const { data: policies = [], isLoading: policiesLoading } = useRetentionPoliciesList()
  const createExport = useCreateExport()
  const createPolicy = useCreateRetentionPolicy()
  const deletePolicy = useDeleteRetentionPolicy()

  const [exportConfirmOpen, setExportConfirmOpen] = useState(false)
  const [policyFormOpen, setPolicyFormOpen] = useState(false)
  const [policyToDelete, setPolicyToDelete] = useState<RetentionPolicy | null>(null)

  const handleExportSubmit = (payload: {
    data_type: 'runs' | 'reports' | 'audit_logs'
    format: 'csv' | 'pdf' | 'json'
    date_from: string
    date_to: string
  }) => {
    createExport.mutate(payload, {
      onSuccess: () => setExportConfirmOpen(false),
    })
  }

  const handlePolicySubmit = (payload: {
    data_type: 'runs' | 'reports' | 'audit_logs' | 'screenshots'
    retention_period_days: number
    action_on_expiry: 'purge' | 'archive'
  }) => {
    createPolicy.mutate(payload, {
      onSuccess: () => setPolicyFormOpen(false),
    })
  }

  const handleDeletePolicy = () => {
    if (!policyToDelete) return
    deletePolicy.mutate(policyToDelete.id, {
      onSuccess: () => setPolicyToDelete(null),
    })
  }

  const formatStatus = (status: string) => {
    const map: Record<string, string> = {
      pending: 'Pending',
      processing: 'Processing',
      completed: 'Completed',
      failed: 'Failed',
    }
    return map[status] ?? status
  }

  return (
    <AnimatedPage>
      <div className="space-y-8">
        {/* Header & breadcrumbs */}
        <div>
          <nav className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/dashboard" className="hover:text-foreground">Dashboard</Link>
            <ChevronRight className="h-4 w-4" />
            <Link to="/dashboard/settings" className="hover:text-foreground">Settings</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">Data Export & Retention</span>
          </nav>
          <h1 className="text-2xl font-bold text-foreground">Data Export & Retention</h1>
          <p className="text-muted-foreground">
            Export runs and reports, and configure data retention policies.
          </p>
        </div>

        {/* Export Data Panel */}
        <div className="grid gap-6 lg:grid-cols-2">
          <ExportDataForm
            onSubmit={handleExportSubmit}
            isSubmitting={createExport.isPending}
          />
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Download className="h-5 w-5" />
                Recent exports
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Request an export above; download links appear here when ready.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {exportsLoading ? (
                <p className="text-sm text-muted-foreground">Loading…</p>
              ) : exportsList.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No exports yet. Request an export to get started.
                </p>
              ) : (
                <ul className="space-y-2">
                  {exportsList.slice(0, 5).map((exp) => (
                    <li
                      key={exp.id}
                      className={cn(
                        'flex items-center justify-between rounded-lg border border-border bg-muted/20 px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted/30'
                      )}
                    >
                      <span className="font-medium">
                        {exp.data_type} · {exp.format}
                      </span>
                      <span className="text-muted-foreground">{formatStatus(exp.status)}</span>
                      {exp.status === 'completed' && exp.download_link && (
                        <a
                          href={exp.download_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              )}
              <Button
                variant="outline"
                size="sm"
                className="mt-4 transition-transform hover:scale-[1.02]"
                onClick={() => setExportConfirmOpen(true)}
              >
                Request new export
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Retention Settings Panel */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Database className="h-5 w-5" />
              Retention settings
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Current retention policies. Retention jobs run automatically based on these rules.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {policiesLoading ? (
              <p className="text-sm text-muted-foreground">Loading policies…</p>
            ) : policies.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No retention policies yet. Add a policy to define how long data is kept and what happens when it expires.
              </p>
            ) : (
              <ul className="space-y-2">
                {policies.map((policy) => (
                  <li
                    key={policy.id}
                    className={cn(
                      'flex items-center justify-between rounded-lg border border-border bg-muted/20 px-3 py-2 text-sm text-foreground'
                    )}
                  >
                    <span className="font-medium">
                      {policy.data_type} · {policy.retention_period_days} days · {policy.action_on_expiry}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => setPolicyToDelete(policy)}
                      aria-label="Delete policy"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
            <Button
              variant="outline"
              className="transition-transform hover:scale-[1.02]"
              onClick={() => setPolicyFormOpen(true)}
            >
              Add retention policy
            </Button>
          </CardContent>
        </Card>

        {/* Footer: support & compliance */}
        <div className="flex flex-wrap items-center gap-4 border-t border-border pt-6 text-sm text-muted-foreground">
          <Link to="/help" className="flex items-center gap-2 hover:text-foreground">
            <HelpCircle className="h-4 w-4" />
            Help & docs
          </Link>
          <Link to="/legal" className="flex items-center gap-2 hover:text-foreground">
            <FileText className="h-4 w-4" />
            Privacy & compliance
          </Link>
        </div>
      </div>

      {/* Export request modal (from Recent exports card) */}
      <Dialog open={exportConfirmOpen} onOpenChange={setExportConfirmOpen}>
        <DialogContent className="border-border bg-card sm:max-w-md p-0 gap-0">
          <ExportDataForm
            onSubmit={handleExportSubmit}
            onCancel={() => setExportConfirmOpen(false)}
            isSubmitting={createExport.isPending}
            className="border-0 shadow-none"
          />
        </DialogContent>
      </Dialog>

      {/* Add retention policy modal */}
      <Dialog open={policyFormOpen} onOpenChange={setPolicyFormOpen}>
        <DialogContent className="border-border bg-card sm:max-w-md p-0 gap-0">
          <RetentionPolicyForm
            onSubmit={handlePolicySubmit}
            onCancel={() => setPolicyFormOpen(false)}
            isSubmitting={createPolicy.isPending}
            className="border-0 shadow-none"
          />
        </DialogContent>
      </Dialog>

      {/* Delete policy confirmation */}
      <Dialog open={!!policyToDelete} onOpenChange={(open) => !open && setPolicyToDelete(null)}>
        <DialogContent className="border-border bg-card sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete retention policy</DialogTitle>
            <DialogDescription>
              This will remove the retention rule. Existing data will not be changed; only future retention job behavior is affected.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPolicyToDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeletePolicy}
              disabled={deletePolicy.isPending}
            >
              {deletePolicy.isPending ? 'Deleting…' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AnimatedPage>
  )
}
