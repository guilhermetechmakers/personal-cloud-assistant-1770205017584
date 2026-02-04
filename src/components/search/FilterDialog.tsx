import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
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
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useId } from 'react'
import type { SearchDomainType } from '@/types/search'

const DOMAIN_OPTIONS: { value: SearchDomainType; label: string }[] = [
  { value: 'skill', label: 'Skills' },
  { value: 'run', label: 'Runs' },
  { value: 'inbox', label: 'Inbox' },
  { value: 'pack', label: 'Packs' },
]

const schema = z.object({
  types: z.array(z.enum(['inbox', 'run', 'skill', 'pack'])).min(1, 'Select at least one type'),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  status: z.string().optional(),
})

export type FilterFormValues = z.infer<typeof schema>

export interface FilterDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialValues?: Partial<FilterFormValues>
  onApply: (values: FilterFormValues) => void
}

export function FilterDialog({
  open,
  onOpenChange,
  initialValues,
  onApply,
}: FilterDialogProps) {
  const typesId = useId()
  const statusId = useId()

  const form = useForm<FilterFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      types: initialValues?.types ?? ['skill', 'run'],
      dateFrom: initialValues?.dateFrom ?? '',
      dateTo: initialValues?.dateTo ?? '',
      status: initialValues?.status ?? '',
    },
  })

  const onSubmit = form.handleSubmit((values) => {
    onApply(values)
    onOpenChange(false)
  })

  const types = form.watch('types')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Filters</DialogTitle>
          <DialogDescription>
            Refine results by type, date range, and status.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label id={typesId}>Search in</Label>
            <div className="flex flex-wrap gap-3 pt-1" role="group" aria-labelledby={typesId}>
              {DOMAIN_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Checkbox
                    checked={types.includes(opt.value)}
                    onCheckedChange={(checked) => {
                      const next = checked
                        ? [...types, opt.value]
                        : types.filter((t) => t !== opt.value)
                      form.setValue('types', next.length ? next : ['skill'], { shouldValidate: true })
                    }}
                    aria-label={opt.label}
                  />
                  <span className="text-sm text-foreground">{opt.label}</span>
                </label>
              ))}
            </div>
            {form.formState.errors.types && (
              <p className="text-sm text-destructive">
                {form.formState.errors.types.message}
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateFrom">From date</Label>
              <input
                id="dateFrom"
                type="date"
                className="flex h-10 w-full rounded-md border border-border bg-card px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                {...form.register('dateFrom')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateTo">To date</Label>
              <input
                id="dateTo"
                type="date"
                className="flex h-10 w-full rounded-md border border-border bg-card px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                {...form.register('dateTo')}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label id={statusId}>Status</Label>
            <Select
              value={form.watch('status') || 'all'}
              onValueChange={(v) => form.setValue('status', v === 'all' ? '' : v)}
            >
              <SelectTrigger id={statusId}>
                <SelectValue placeholder="Any status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="running">Running</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Apply filters</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
