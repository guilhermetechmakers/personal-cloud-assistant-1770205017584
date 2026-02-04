/**
 * Share Link Dialog: generate shareable link with access control.
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Copy, Check } from 'lucide-react'

export interface ShareLinkDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  shareUrl: string | null
  onGenerate: () => void
  isGenerating?: boolean
}

export function ShareLinkDialog({
  open,
  onOpenChange,
  shareUrl,
  onGenerate,
  isGenerating = false,
}: ShareLinkDialogProps) {
  const [copied, setCopied] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleCopy = async () => {
    if (!shareUrl) return
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      inputRef.current?.select()
    }
  }

  React.useEffect(() => {
    if (open && !shareUrl) onGenerate()
  }, [open, shareUrl, onGenerate])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share run</DialogTitle>
          <DialogDescription>
            Share a link with access control. Recipients can view this run
            details page.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="share-url">Link</Label>
            <div className="flex gap-2">
              <Input
                id="share-url"
                ref={inputRef}
                readOnly
                value={shareUrl ?? (isGenerating ? 'Generating…' : '')}
                className="font-mono text-sm"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleCopy}
                disabled={!shareUrl || isGenerating}
                aria-label="Copy link"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-success" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {!shareUrl && (
            <Button onClick={onGenerate} disabled={isGenerating}>
              {isGenerating ? 'Generating…' : 'Generate link'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
