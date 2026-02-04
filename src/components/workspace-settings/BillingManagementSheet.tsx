/**
 * Billing Management Sheet: plan details, payment method, upgrade/downgrade, invoice history.
 */

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { CreditCard } from 'lucide-react'
import type { WorkspaceBilling, WorkspacePlan } from '@/types/workspace'
import { cn } from '@/lib/utils'

const billingFormSchema = z.object({
  plan: z.enum(['free', 'pro', 'teams']),
  payment_method_id: z.string().optional(),
})

export type BillingFormValues = z.infer<typeof billingFormSchema>

export interface BillingManagementSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  billing: WorkspaceBilling | null | undefined
  isLoading?: boolean
  onSave: (values: BillingFormValues) => void
  isSubmitting?: boolean
  className?: string
}

const PLAN_OPTIONS: { value: WorkspacePlan; label: string; description: string }[] = [
  { value: 'free', label: 'Free', description: 'Up to 5 skills, 20 runs/month' },
  { value: 'pro', label: 'Pro', description: 'Up to 20 skills, 200 runs/month' },
  { value: 'teams', label: 'Teams', description: 'Unlimited skills, custom runs' },
]

export function BillingManagementSheet({
  open,
  onOpenChange,
  billing,
  isLoading,
  onSave,
  isSubmitting = false,
  className,
}: BillingManagementSheetProps) {
  const form = useForm<BillingFormValues>({
    resolver: zodResolver(billingFormSchema),
    defaultValues: {
      plan: billing?.plan ?? 'pro',
      payment_method_id: billing?.payment_method_id ?? undefined,
    },
  })

  const currentPlan = billing?.plan ?? 'free'

  useEffect(() => {
    if (open && billing) {
      form.reset({
        plan: billing.plan,
        payment_method_id: billing.payment_method_id ?? undefined,
      })
    }
  }, [open, billing, form])

  const handleSubmit = form.handleSubmit((values) => {
    onSave(values)
    onOpenChange(false)
  })

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className={cn('border-border bg-card w-full sm:max-w-lg flex flex-col', className)}
      >
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-foreground">
            <CreditCard className="h-5 w-5 text-primary" aria-hidden />
            Billing & Subscription
          </SheetTitle>
          <SheetDescription className="text-muted-foreground">
            Manage plan, payment method, and view invoice history.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto py-6">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full bg-muted rounded-md" />
              <Skeleton className="h-24 w-full bg-muted rounded-md" />
              <Skeleton className="h-10 w-full bg-muted rounded-md" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-foreground">Current plan</Label>
                <div className="rounded-lg border border-border bg-muted/20 p-3 text-sm text-foreground capitalize">
                  {currentPlan}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="billing-plan" className="text-foreground">
                  Change plan
                </Label>
                <select
                  id="billing-plan"
                  className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={form.watch('plan')}
                  onChange={(e) =>
                    form.setValue('plan', e.target.value as WorkspacePlan)
                  }
                >
                  {PLAN_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label} — {o.description}
                    </option>
                  ))}
                </select>
              </div>
              <Separator className="bg-border" />
              <div className="space-y-2">
                <Label htmlFor="payment-method" className="text-foreground">
                  Payment method
                </Label>
                <Input
                  id="payment-method"
                  placeholder="Card ending in •••• (managed by Stripe)"
                  className="border-border bg-background"
                  readOnly
                  aria-describedby="payment-method-hint"
                />
                <p id="payment-method-hint" className="text-xs text-muted-foreground">
                  Update payment method at checkout or via Stripe Customer Portal.
                </p>
              </div>
              <Separator className="bg-border" />
              <p className="text-sm text-muted-foreground">
                Invoice history and receipts are available from the checkout page after upgrading.
              </p>
              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="border-border"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 transition-transform hover:scale-[1.02]"
                >
                  {isSubmitting ? 'Saving…' : 'Save changes'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
