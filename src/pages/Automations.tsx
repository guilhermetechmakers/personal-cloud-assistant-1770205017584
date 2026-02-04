import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { AnimatedPage } from '@/components/layout/AnimatedPage'
import {
  useAutomationsList,
  useCreateAutomation,
  useUpdateAutomation,
  useDeleteAutomation,
  useSetAutomationEnabled,
  useLastRun,
} from '@/hooks/useAutomations'
import type { Automation } from '@/types/automation'
import type { AutomationTriggerType } from '@/types/automation'
import {
  Zap,
  Plus,
  Trash2,
  Pencil,
  ChevronRight,
  Filter,
  CalendarDays,
  FileText,
} from 'lucide-react'
import { format, addDays, startOfWeek } from 'date-fns'

const automationFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(120),
  skill_id: z.string().min(1, 'Skill is required'),
  skill_name: z.string().optional(),
  trigger_type: z.enum(['manual', 'schedule', 'event']),
  schedule_config: z.record(z.unknown()).optional(),
  timezone: z.string().min(1, 'Timezone is required'),
})

type AutomationFormValues = z.infer<typeof automationFormSchema>

const SKILL_OPTIONS: { id: string; name: string }[] = [
  { id: 'inbox-zero', name: 'Inbox Zero' },
  { id: 'meeting-master', name: 'Meeting Master' },
  { id: 'travel-concierge', name: 'Travel Concierge' },
]

const TRIGGER_OPTIONS: { value: AutomationTriggerType; label: string }[] = [
  { value: 'manual', label: 'Manual' },
  { value: 'schedule', label: 'Schedule' },
  { value: 'event', label: 'Event' },
]

const TIMEZONE_OPTIONS = [
  'UTC',
  'America/New_York',
  'America/Los_Angeles',
  'America/Chicago',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
  'Australia/Sydney',
]

function formatNextRun(nextRunAt: string | null, triggerType: string): string {
  if (triggerType === 'manual') return 'On demand'
  if (triggerType === 'event') return 'On event'
  if (!nextRunAt) return '—'
  try {
    const d = new Date(nextRunAt)
    return format(d, 'MMM d, HH:mm')
  } catch {
    return nextRunAt
  }
}

interface CreateAutomationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function CreateAutomationModal({ open, onOpenChange }: CreateAutomationModalProps) {
  const createMutation = useCreateAutomation()
  const defaultValues: AutomationFormValues = {
    name: '',
    skill_id: '',
    skill_name: '',
    trigger_type: 'schedule',
    schedule_config: { cron: '0 8 * * *' },
    timezone: 'UTC',
  }
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<AutomationFormValues>({
    resolver: zodResolver(automationFormSchema),
    defaultValues,
  })

  const onSubmit = (values: AutomationFormValues) => {
    const skill = SKILL_OPTIONS.find((s) => s.id === values.skill_id)
    createMutation.mutate(
      {
        name: values.name,
        skill_id: values.skill_id,
        skill_name: skill?.name ?? values.skill_name ?? null,
        trigger_type: values.trigger_type,
        schedule_config: values.schedule_config ?? {},
        timezone: values.timezone,
      },
      {
        onSuccess: (data) => {
          if (data) {
            reset(defaultValues)
            onOpenChange(false)
          }
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-card sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Create Automation</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Choose a skill, trigger type, schedule, and timezone.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="create-name" className="text-foreground">
              Name
            </Label>
            <Input
              id="create-name"
              placeholder="e.g. Daily Digest"
              className="border-border bg-card"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label className="text-foreground">Skill</Label>
            <Controller
              name="skill_id"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="border-border bg-card">
                    <SelectValue placeholder="Select skill" />
                  </SelectTrigger>
                  <SelectContent>
                    {SKILL_OPTIONS.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.skill_id && (
              <p className="text-sm text-destructive">{errors.skill_id.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label className="text-foreground">Trigger type</Label>
            <Controller
              name="trigger_type"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(v) =>
                    field.onChange(v as AutomationTriggerType)
                  }
                >
                  <SelectTrigger className="border-border bg-card">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TRIGGER_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="create-timezone" className="text-foreground">
              Timezone
            </Label>
            <Controller
              name="timezone"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="border-border bg-card">
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEZONE_OPTIONS.map((tz) => (
                      <SelectItem key={tz} value={tz}>
                        {tz}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.timezone && (
              <p className="text-sm text-destructive">
                {errors.timezone.message}
              </p>
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
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
              disabled={createMutation.isPending}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {createMutation.isPending ? 'Creating…' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

interface EditAutomationModalProps {
  automation: Automation | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function EditAutomationModal({
  automation,
  open,
  onOpenChange,
}: EditAutomationModalProps) {
  const updateMutation = useUpdateAutomation()
  const defaultValues: AutomationFormValues = {
    name: automation?.name ?? '',
    skill_id: automation?.skill_id ?? '',
    skill_name: automation?.skill_name ?? undefined,
    trigger_type: automation?.trigger_type ?? 'schedule',
    schedule_config: automation?.schedule_config ?? {},
    timezone: automation?.timezone ?? 'UTC',
  }
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<AutomationFormValues>({
    resolver: zodResolver(automationFormSchema),
    defaultValues,
    values: open ? defaultValues : undefined,
  })

  const onSubmit = (values: AutomationFormValues) => {
    if (!automation) return
    const skill = SKILL_OPTIONS.find((s) => s.id === values.skill_id)
    updateMutation.mutate(
      {
        id: automation.id,
        updates: {
          name: values.name,
          skill_id: values.skill_id,
          skill_name: skill?.name ?? values.skill_name ?? null,
          trigger_type: values.trigger_type,
          schedule_config: values.schedule_config ?? {},
          timezone: values.timezone,
        },
      },
      {
        onSuccess: (data) => {
          if (data) {
            onOpenChange(false)
          }
        },
      }
    )
  }

  if (!automation) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-card sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Edit Automation</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Update schedule, triggers, and timezone.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name" className="text-foreground">
              Name
            </Label>
            <Input
              id="edit-name"
              placeholder="e.g. Daily Digest"
              className="border-border bg-card"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label className="text-foreground">Skill</Label>
            <Controller
              name="skill_id"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="border-border bg-card">
                    <SelectValue placeholder="Select skill" />
                  </SelectTrigger>
                  <SelectContent>
                    {SKILL_OPTIONS.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-foreground">Trigger type</Label>
            <Controller
              name="trigger_type"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(v) =>
                    field.onChange(v as AutomationTriggerType)
                  }
                >
                  <SelectTrigger className="border-border bg-card">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TRIGGER_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-foreground">Timezone</Label>
            <Controller
              name="timezone"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="border-border bg-card">
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEZONE_OPTIONS.map((tz) => (
                      <SelectItem key={tz} value={tz}>
                        {tz}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
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
              disabled={updateMutation.isPending}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {updateMutation.isPending ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

interface BulkActionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  action: 'enable' | 'disable' | 'delete' | null
  selectedIds: string[]
  onConfirm: () => void
  isPending: boolean
}

function BulkActionsDialog({
  open,
  onOpenChange,
  action,
  selectedIds,
  onConfirm,
  isPending,
}: BulkActionsDialogProps) {
  const label =
    action === 'enable'
      ? 'Enable'
      : action === 'disable'
        ? 'Disable'
        : 'Delete'
  const message =
    action === 'delete'
      ? `Permanently delete ${selectedIds.length} automation(s)? This cannot be undone.`
      : `${label} ${selectedIds.length} automation(s)?`
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-card sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-foreground">Bulk action</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {message}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-border"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isPending}
            variant={action === 'delete' ? 'destructive' : 'default'}
            className={
              action !== 'delete'
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : ''
            }
          >
            {isPending ? 'Processing…' : label}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function AutomationListSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <Skeleton
          key={i}
          className="h-14 w-full rounded-lg border border-border"
        />
      ))}
    </div>
  )
}

function RunCalendarView({ automations }: { automations: Automation[] }) {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
  const days = Array.from({ length: 14 }, (_, i) => addDays(weekStart, i))
  const runsByDay = useMemo(() => {
    const map = new Map<string, Automation[]>()
    automations
      .filter((a) => a.enabled && a.next_run_at)
      .forEach((a) => {
        const d = new Date(a.next_run_at!)
        const key = format(d, 'yyyy-MM-dd')
        if (!map.has(key)) map.set(key, [])
        map.get(key)!.push(a)
      })
    return map
  }, [automations])

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-7">
      {days.map((day) => {
        const key = format(day, 'yyyy-MM-dd')
        const runs = runsByDay.get(key) ?? []
        return (
          <div
            key={key}
            className="rounded-lg border border-border bg-card/50 p-2 transition-colors hover:bg-card/80"
          >
            <p className="text-xs font-medium text-muted-foreground">
              {format(day, 'EEE d')}
            </p>
            <div className="mt-1 space-y-0.5">
              {runs.slice(0, 2).map((a) => (
                <div
                  key={a.id}
                  className="truncate rounded bg-primary/10 px-1 py-0.5 text-xs text-primary"
                  title={a.name}
                >
                  {a.name}
                </div>
              ))}
              {runs.length > 2 && (
                <p className="text-xs text-muted-foreground">
                  +{runs.length - 2} more
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function AuditSnapshotCard({ automationId }: { automationId: string }) {
  const { data: lastRun, isLoading } = useLastRun(automationId)
  if (isLoading) return <Skeleton className="h-10 w-full rounded-lg" />
  if (!lastRun)
    return (
      <p className="text-sm text-muted-foreground">No runs yet</p>
    )
  return (
    <Link
      to={`/dashboard/runs/${lastRun.id}`}
      className="flex items-center gap-2 rounded-lg border border-border bg-card/50 p-2 text-sm text-foreground transition-colors hover:bg-card/80 hover:text-primary"
    >
      <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
      <span>
        Last run: {format(new Date(lastRun.run_time), 'MMM d, HH:mm')} —{' '}
        <span className="capitalize">{lastRun.status}</span>
      </span>
      <ChevronRight className="h-4 w-4 shrink-0" />
    </Link>
  )
}

export function Automations() {
  const [createOpen, setCreateOpen] = useState(false)
  const [editAutomation, setEditAutomation] = useState<Automation | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkAction, setBulkAction] = useState<
    'enable' | 'disable' | 'delete' | null
  >(null)
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false)
  const [filterStatus, setFilterStatus] = useState<'all' | 'enabled' | 'disabled'>(
    'all'
  )
  const [filterTrigger, setFilterTrigger] = useState<string>('all')
  const [filterSkill, setFilterSkill] = useState<string>('all')

  const { data: automations = [], isLoading } = useAutomationsList()
  const deleteMutation = useDeleteAutomation()
  const setEnabledMutation = useSetAutomationEnabled()

  const filtered = useMemo(() => {
    let list = automations
    if (filterStatus === 'enabled') list = list.filter((a) => a.enabled)
    if (filterStatus === 'disabled') list = list.filter((a) => !a.enabled)
    if (filterTrigger !== 'all') list = list.filter((a) => a.trigger_type === filterTrigger)
    if (filterSkill !== 'all') list = list.filter((a) => a.skill_id === filterSkill)
    return list
  }, [automations, filterStatus, filterTrigger, filterSkill])

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) setSelectedIds(new Set())
    else setSelectedIds(new Set(filtered.map((a) => a.id)))
  }

  const openBulk = (action: 'enable' | 'disable' | 'delete') => {
    setBulkAction(action)
    setBulkDialogOpen(true)
  }

  const confirmBulk = async () => {
    if (!bulkAction || selectedIds.size === 0) return
    const ids = Array.from(selectedIds)
    try {
      if (bulkAction === 'delete') {
        await Promise.all(ids.map((id) => deleteMutation.mutateAsync(id)))
      } else {
        const enabled = bulkAction === 'enable'
        await Promise.all(
          ids.map((id) =>
            setEnabledMutation.mutateAsync({ id, enabled })
          )
        )
      }
      setSelectedIds(new Set())
      setBulkDialogOpen(false)
      setBulkAction(null)
    } catch {
      // Toasts handled by mutation onError
    }
  }

  const lastRunAutomationId =
    automations.find((a) => a.enabled && a.next_run_at)?.id ??
    automations[0]?.id

  return (
    <AnimatedPage>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Automations & Scheduler
            </h1>
            <p className="text-muted-foreground">
              Manage scheduled runs and automation rules
            </p>
          </div>
          <Button
            onClick={() => setCreateOpen(true)}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Create Automation
          </Button>
        </div>

        <div className="flex flex-wrap gap-4 rounded-lg border border-border bg-card/50 p-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Filters</span>
          </div>
          <Select
            value={filterStatus}
            onValueChange={(v) =>
              setFilterStatus(v as 'all' | 'enabled' | 'disabled')
            }
          >
            <SelectTrigger className="w-[130px] border-border bg-card">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="enabled">Enabled</SelectItem>
              <SelectItem value="disabled">Disabled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterTrigger} onValueChange={setFilterTrigger}>
            <SelectTrigger className="w-[130px] border-border bg-card">
              <SelectValue placeholder="Trigger" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All triggers</SelectItem>
              {TRIGGER_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterSkill} onValueChange={setFilterSkill}>
            <SelectTrigger className="w-[160px] border-border bg-card">
              <SelectValue placeholder="Skill" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All skills</SelectItem>
              {SKILL_OPTIONS.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedIds.size > 0 && (
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card p-3">
            <span className="text-sm text-muted-foreground">
              {selectedIds.size} selected
            </span>
            <Button
              variant="outline"
              size="sm"
              className="border-border"
              onClick={() => openBulk('enable')}
            >
              Enable
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-border"
              onClick={() => openBulk('disable')}
            >
              Disable
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-destructive text-destructive hover:bg-destructive/10"
              onClick={() => openBulk('delete')}
            >
              Delete
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedIds(new Set())}
            >
              Clear
            </Button>
          </div>
        )}

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Automation List</CardTitle>
            <CardDescription className="text-muted-foreground">
              Name, trigger, next run time, status toggle. Edit or view details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <AutomationListSkeleton />
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Zap className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <p className="text-muted-foreground">
                  No automations yet. Create one to schedule skill runs.
                </p>
                <Button
                  onClick={() => setCreateOpen(true)}
                  className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Create Automation
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="w-10 border-border">
                        <Checkbox
                          checked={
                            filtered.length > 0 &&
                            selectedIds.size === filtered.length
                          }
                          onCheckedChange={toggleSelectAll}
                          aria-label="Select all"
                        />
                      </TableHead>
                      <TableHead className="border-border text-muted-foreground">
                        Name
                      </TableHead>
                      <TableHead className="border-border text-muted-foreground">
                        Trigger
                      </TableHead>
                      <TableHead className="border-border text-muted-foreground">
                        Next run
                      </TableHead>
                      <TableHead className="border-border text-muted-foreground">
                        Status
                      </TableHead>
                      <TableHead className="w-[120px] border-border text-right text-muted-foreground">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((a) => (
                      <TableRow
                        key={a.id}
                        className="border-border transition-colors hover:bg-muted/30"
                      >
                        <TableCell className="border-border">
                          <Checkbox
                            checked={selectedIds.has(a.id)}
                            onCheckedChange={() => toggleSelect(a.id)}
                            aria-label={`Select ${a.name}`}
                          />
                        </TableCell>
                        <TableCell className="border-border">
                          <div className="flex items-center gap-2">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                              <Zap className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">
                                {a.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {a.skill_name ?? a.skill_id}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="border-border capitalize text-muted-foreground">
                          {a.trigger_type}
                        </TableCell>
                        <TableCell className="border-border text-muted-foreground">
                          {formatNextRun(a.next_run_at, a.trigger_type)}
                        </TableCell>
                        <TableCell className="border-border">
                          <Switch
                            checked={a.enabled}
                            onCheckedChange={(checked) =>
                              setEnabledMutation.mutate({ id: a.id, enabled: checked })
                            }
                            aria-label={`Toggle ${a.name}`}
                          />
                        </TableCell>
                        <TableCell className="border-border text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Edit"
                              onClick={() => {
                                setEditAutomation(a)
                                setEditOpen(true)
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Link to={`/dashboard/runs?automation=${a.id}`}>
                              <Button variant="ghost" size="sm">
                                Details
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Delete"
                              onClick={() => deleteMutation.mutate(a.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <CalendarDays className="h-5 w-5" />
              Run Calendar View
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Upcoming runs by day (next 2 weeks)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {automations.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No automations. Create one to see scheduled runs here.
              </p>
            ) : (
              <RunCalendarView automations={automations} />
            )}
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <FileText className="h-5 w-5" />
              Audit Snapshot
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Last run result with link to full details
            </CardDescription>
          </CardHeader>
          <CardContent>
            {lastRunAutomationId ? (
              <AuditSnapshotCard automationId={lastRunAutomationId} />
            ) : (
              <p className="text-sm text-muted-foreground">
                No runs yet. Enable an automation to see last run here.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <CreateAutomationModal open={createOpen} onOpenChange={setCreateOpen} />
      <EditAutomationModal
        automation={editAutomation}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
      <BulkActionsDialog
        open={bulkDialogOpen}
        onOpenChange={setBulkDialogOpen}
        action={bulkAction}
        selectedIds={Array.from(selectedIds)}
        onConfirm={confirmBulk}
        isPending={
          deleteMutation.isPending || setEnabledMutation.isPending
        }
      />
    </AnimatedPage>
  )
}
