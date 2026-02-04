/**
 * Export Modal: select format (PDF/JSON) and confirm export.
 */

import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { FileJson, FileText } from 'lucide-react'

export type ExportFormat = 'pdf' | 'json'

export interface ExportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  runId: string
  onExport: (format: ExportFormat) => void
  isExporting?: boolean
}

export function ExportModal({
  open,
  onOpenChange,
  runId,
  onExport,
  isExporting = false,
}: ExportModalProps) {
  const [format, setFormat] = React.useState<ExportFormat>('json')

  const handleExport = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    onExport(format)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export run</DialogTitle>
          <DialogDescription>
            Export run {runId.slice(0, 8)}… as PDF or JSON for sharing or backup.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleExport} className="space-y-4">
          <div className="space-y-2">
            <Label>Format</Label>
            <div className="flex gap-4">
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-muted/50 has-[:checked]:border-primary has-[:checked]:ring-2 has-[:checked]:ring-primary/20">
                <input
                  type="radio"
                  name="format"
                  value="json"
                  checked={format === 'json'}
                  onChange={() => setFormat('json')}
                  className="h-4 w-4 border-input text-primary focus:ring-primary"
                />
                <FileJson className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">JSON</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-muted/50 has-[:checked]:border-primary has-[:checked]:ring-2 has-[:checked]:ring-primary/20">
                <input
                  type="radio"
                  name="format"
                  value="pdf"
                  checked={format === 'pdf'}
                  onChange={() => setFormat('pdf')}
                  className="h-4 w-4 border-input text-primary focus:ring-primary"
                />
                <FileText className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">PDF</span>
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isExporting}>
              {isExporting ? 'Exporting…' : 'Export'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
