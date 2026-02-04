/**
 * Version Revert Dialog: confirm reverting to a previous skill snapshot.
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
import type { SkillVersionHistoryRow } from '@/types/skill'

export interface VersionRevertDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  versionSnapshot: SkillVersionHistoryRow | null
  onConfirm: () => void
  isSubmitting?: boolean
}

export function VersionRevertDialog({
  open,
  onOpenChange,
  versionSnapshot,
  onConfirm,
  isSubmitting = false,
}: VersionRevertDialogProps) {
  const handleConfirm = () => {
    onConfirm()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Revert to version {versionSnapshot?.version ?? '?'}</DialogTitle>
          <DialogDescription>
            This will replace the current skill definition with the snapshot from{' '}
            {versionSnapshot?.created_at
              ? new Date(versionSnapshot.created_at).toLocaleString()
              : 'this version'}
            . Your current draft will be overwritten. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={isSubmitting || !versionSnapshot}
          >
            {isSubmitting ? 'Reverting…' : 'Revert'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
