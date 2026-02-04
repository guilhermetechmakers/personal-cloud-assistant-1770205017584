import { Link } from 'react-router-dom'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

export interface FeatureDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  icon?: LucideIcon
  linkToDetails?: string | null
}

export function FeatureDetailModal({
  open,
  onOpenChange,
  title,
  description,
  icon: Icon,
  linkToDetails,
}: FeatureDetailModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="border-border bg-card sm:max-w-md"
        showClose
      >
        <DialogHeader>
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 text-primary" aria-hidden />
              </div>
            )}
            <DialogTitle className="text-foreground">{title}</DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>
        {linkToDetails && (
          <div className="mt-4 flex justify-end">
            <Button
              asChild
              variant="default"
              className={cn(
                'transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]'
              )}
            >
              <Link to={linkToDetails} onClick={() => onOpenChange(false)}>
                Learn more
              </Link>
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
