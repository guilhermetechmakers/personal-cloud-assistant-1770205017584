import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { useNotificationPreferences, useSaveNotificationPreferences } from '@/hooks/useNotifications'
import type { NotificationChannel, NotificationEventType } from '@/types/notification'
import { Bell, Mail, Smartphone } from 'lucide-react'
import { useEffect } from 'react'

const CHANNELS: { value: NotificationChannel; label: string; icon: typeof Bell }[] = [
  { value: 'in_app', label: 'In-app', icon: Bell },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'push', label: 'Push', icon: Smartphone },
]

const EVENT_TYPES: { value: NotificationEventType; label: string }[] = [
  { value: 'approval', label: 'Approvals' },
  { value: 'billing', label: 'Billing' },
  { value: 'run_failure', label: 'Run failures' },
  { value: 'digest', label: 'Digest' },
  { value: 'run_success', label: 'Run success' },
  { value: 'system', label: 'System' },
]

const schema = z.object({
  prefs: z.array(
    z.object({
      channel: z.enum(['in_app', 'email', 'push']),
      event_type: z.string(),
      is_active: z.boolean(),
    })
  ),
})

type FormValues = z.infer<typeof schema>

function buildDefaultPrefs(): FormValues['prefs'] {
  const prefs: FormValues['prefs'] = []
  for (const channel of CHANNELS) {
    for (const event of EVENT_TYPES) {
      prefs.push({
        channel: channel.value,
        event_type: event.value,
        is_active: channel.value === 'in_app',
      })
    }
  }
  return prefs
}

function getPrefKey(channel: NotificationChannel, eventType: NotificationEventType): string {
  return `${channel}:${eventType}`
}

export function NotificationPreferencesForm() {
  const { data: existingPrefs = [], isLoading } = useNotificationPreferences()
  const save = useSaveNotificationPreferences()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { prefs: buildDefaultPrefs() },
  })

  useEffect(() => {
    if (existingPrefs.length === 0) return
    const prefsMap = new Map(
      existingPrefs.map((p) => [getPrefKey(p.channel, p.event_type as NotificationEventType), p])
    )
    const prefs: FormValues['prefs'] = []
    for (const channel of CHANNELS) {
      for (const event of EVENT_TYPES) {
        const key = getPrefKey(channel.value, event.value)
        const existing = prefsMap.get(key)
        prefs.push({
          channel: channel.value,
          event_type: event.value,
          is_active: existing?.is_active ?? channel.value === 'in_app',
        })
      }
    }
    form.reset({ prefs })
  }, [existingPrefs, form])

  const prefs = form.watch('prefs')

  const setActive = (channel: NotificationChannel, eventType: NotificationEventType, isActive: boolean) => {
    const next = prefs.map((p) =>
      p.channel === channel && p.event_type === eventType ? { ...p, is_active: isActive } : p
    )
    form.setValue('prefs', next)
  }

  const getActive = (channel: NotificationChannel, eventType: NotificationEventType) =>
    prefs.find((p) => p.channel === channel && p.event_type === eventType)?.is_active ?? false

  const onSubmit = (values: FormValues) => {
    save.mutate(
      values.prefs.map((p) => ({
        channel: p.channel,
        event_type: p.event_type as NotificationEventType,
        is_active: p.is_active,
      }))
    )
  }

  if (isLoading) {
    return (
      <Card className="border-border bg-card">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-32 w-full rounded-md" />
          <Skeleton className="h-10 w-24" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border bg-card transition-shadow duration-200 hover:shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Bell className="h-5 w-5" />
          Notification preferences
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Choose which channels (in-app, email, push) to use for each event type
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-2 text-left font-medium text-foreground">Event type</th>
                  {CHANNELS.map((ch) => {
                    const Icon = ch.icon
                    return (
                      <th key={ch.value} className="pb-2 text-center font-medium text-foreground">
                        <span className="flex items-center justify-center gap-1.5">
                          <Icon className="h-4 w-4" />
                          {ch.label}
                        </span>
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                {EVENT_TYPES.map((event) => (
                  <tr key={event.value} className="border-b border-border last:border-0">
                    <td className="py-3">{event.label}</td>
                    {CHANNELS.map((ch) => (
                      <td key={ch.value} className="py-3 text-center">
                        <Switch
                          checked={getActive(ch.value, event.value)}
                          onCheckedChange={(checked) => setActive(ch.value, event.value, checked)}
                          className="data-[state=checked]:bg-primary"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button
            type="submit"
            className="transition-transform hover:scale-[1.02]"
            disabled={save.isPending}
          >
            {save.isPending ? 'Saving...' : 'Save preferences'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
