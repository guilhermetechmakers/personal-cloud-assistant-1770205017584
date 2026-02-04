/**
 * Block Configuration Dialog: edit block parameters, connectors, templates.
 */

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
import type { SkillBlockRow, SkillBlockType } from '@/types/skill'

export interface BlockConfigDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  block: SkillBlockRow | null
  onSave: (config: Record<string, unknown>) => void
  isSubmitting?: boolean
}

const blockTypeLabels: Record<SkillBlockType, string> = {
  Fetch: 'Fetch data from a connector',
  Transform: 'Transform or map data',
  Search: 'Search (e.g. web, index)',
  WebAgent: 'Browser automation step',
  CreateOutput: 'Create output (e.g. draft)',
  Deliver: 'Deliver (e.g. send email)',
  Guard: 'Guard / approval checkpoint',
}

export function BlockConfigDialog({
  open,
  onOpenChange,
  block,
  onSave,
  isSubmitting = false,
}: BlockConfigDialogProps) {
  const configStr =
    block?.config && Object.keys(block.config).length > 0
      ? JSON.stringify(block.config, null, 2)
      : '{}'

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const textarea = form.querySelector('textarea')
    const raw = textarea?.value?.trim() ?? '{}'
    try {
      const config = JSON.parse(raw) as Record<string, unknown>
      onSave(config)
      onOpenChange(false)
    } catch {
      // invalid JSON - could show inline error
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {block?.block_type ?? 'Block'} — Properties
          </DialogTitle>
          <DialogDescription>
            {block
              ? blockTypeLabels[block.block_type as SkillBlockType]
              : 'Configure parameters, connectors, and templates.'}
          </DialogDescription>
        </DialogHeader>
        <form key={block?.id} onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="block-config">Config (JSON)</Label>
            <textarea
              id="block-config"
              key={block?.id}
              defaultValue={configStr}
              rows={8}
              className="flex w-full rounded-md border border-border bg-card px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50"
              placeholder='{"key": "value"}'
              spellCheck={false}
            />
            <p className="text-xs text-muted-foreground">
              Parameters, connector refs, and template options as JSON.
            </p>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
