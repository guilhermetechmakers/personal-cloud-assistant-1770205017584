/**
 * Integrations (Connector Service) page.
 * List of connectors with status; details panel with scopes, last sync, health, audit and webhooks.
 */

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Plus,
  Mail,
  Calendar,
  MessageSquare,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Pencil,
  Trash2,
  Activity,
  Webhook,
  Loader2,
} from 'lucide-react'
import { AnimatedPage } from '@/components/layout/AnimatedPage'
import {
  AddConnectorModal,
  ConnectorErrorDialog,
  EditConnectorForm,
} from '@/components/connectors'
import {
  useConnectorsList,
  useConnector,
  useConnectorAuditLogs,
  useWebhookEvents,
  useDeleteConnector,
  useCheckConnectorHealth,
} from '@/hooks/useConnectors'
import type { Connector } from '@/types/connector'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'

const PROVIDER_ICONS: Record<string, typeof Mail> = {
  gmail: Mail,
  google_calendar: Calendar,
  slack: MessageSquare,
}

function ProviderIcon({ provider }: { provider: string }) {
  const Icon = PROVIDER_ICONS[provider] ?? Activity
  return <Icon className="h-5 w-5 text-primary" aria-hidden />
}

function StatusBadge({ status }: { status: Connector['status'] }) {
  const config = {
    active: { label: 'Active', className: 'bg-success/15 text-success', Icon: CheckCircle2 },
    disconnected: { label: 'Disconnected', className: 'bg-muted text-muted-foreground', Icon: Activity },
    error: { label: 'Error', className: 'bg-destructive/15 text-destructive', Icon: AlertCircle },
    expired: { label: 'Expired', className: 'bg-warning/15 text-warning', Icon: AlertCircle },
  }
  const { label, className, Icon } = config[status] ?? config.disconnected
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
        className
      )}
      role="status"
    >
      <Icon className="h-3 w-3" aria-hidden />
      {label}
    </span>
  )
}

function ConnectorListCard({
  connector,
  isSelected,
  onSelect,
}: {
  connector: Connector
  isSelected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'w-full rounded-lg border p-3 text-left transition-all duration-200',
        'border-border bg-card hover:border-primary/30 hover:bg-card/90',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        isSelected && 'border-primary/50 bg-primary/5 ring-1 ring-primary/20'
      )}
      aria-pressed={isSelected}
      aria-label={`View ${connector.provider} details`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <ProviderIcon provider={connector.provider} />
          </span>
          <div>
            <p className="font-medium text-foreground capitalize">
              {connector.provider.replace(/_/g, ' ')}
            </p>
            <p className="text-xs text-muted-foreground">
              Added {formatDistanceToNow(new Date(connector.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={connector.status} />
          <ChevronRight
            className={cn('h-4 w-4 text-muted-foreground', isSelected && 'text-primary')}
            aria-hidden
          />
        </div>
      </div>
    </button>
  )
}

function DetailsPanel({
  connectorId,
  onEdit,
  onError: _onError,
  onDisconnect,
}: {
  connectorId: string
  onEdit: () => void
  onError: () => void
  onDisconnect: (id: string) => void
}) {
  const { data: connector, isLoading } = useConnector(connectorId)
  const { data: auditLogs = [] } = useConnectorAuditLogs(connectorId)
  const { data: webhookEvents = [] } = useWebhookEvents(connectorId)
  const deleteMutation = useDeleteConnector()
  const healthMutation = useCheckConnectorHealth()

  if (isLoading || !connector) {
    return (
      <Card className="border-border bg-card">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <ProviderIcon provider={connector.provider} />
          </span>
          <div>
            <CardTitle className="text-foreground capitalize">
              {connector.provider.replace(/_/g, ' ')}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Scopes, health, and recent activity
            </CardDescription>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={connector.status} />
          <Button
            variant="outline"
            size="sm"
            disabled={healthMutation.isPending}
            onClick={() => healthMutation.mutate(connector.id)}
            className="transition-transform hover:scale-[1.02] active:scale-[0.98]"
            aria-label="Check connection health"
          >
            {healthMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <RefreshCw className="h-4 w-4" aria-hidden />
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="transition-transform hover:scale-[1.02] active:scale-[0.98]"
            aria-label="Edit connector"
          >
            <Pencil className="h-4 w-4" aria-hidden />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive transition-transform hover:scale-[1.02] active:scale-[0.98]"
            disabled={deleteMutation.isPending}
            onClick={() => {
              if (window.confirm(`Disconnect ${connector.provider}?`)) onDisconnect(connector.id)
            }}
            aria-label="Disconnect"
          >
            {deleteMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Trash2 className="h-4 w-4" aria-hidden />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="text-sm font-medium text-foreground mb-2">Scopes</h4>
          <p className="text-sm text-muted-foreground">
            {Array.isArray(connector.scopes) && connector.scopes.length > 0
              ? connector.scopes.join(', ')
              : 'No scopes configured'}
          </p>
        </div>
        <Separator className="bg-border" />
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <h4 className="text-sm font-medium text-foreground mb-1">Last sync</h4>
            <p className="text-sm text-muted-foreground">
              {connector.last_sync_at
                ? formatDistanceToNow(new Date(connector.last_sync_at), { addSuffix: true })
                : 'Never'}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-foreground mb-1">Health check</h4>
            <p className="text-sm text-muted-foreground">
              {connector.last_health_at
                ? formatDistanceToNow(new Date(connector.last_health_at), { addSuffix: true })
                : 'Not checked'}
            </p>
          </div>
        </div>
        <Separator className="bg-border" />
        <div>
          <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
            <Activity className="h-4 w-4 text-muted-foreground" aria-hidden />
            Recent audit log
          </h4>
          <ScrollArea className="h-32 rounded-md border border-border">
            <ul className="p-2 space-y-1 text-sm">
              {auditLogs.slice(0, 5).map((log) => (
                <li key={log.id} className="text-muted-foreground">
                  <span className="font-medium text-foreground">{log.action}</span>
                  {' — '}
                  {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                </li>
              ))}
              {auditLogs.length === 0 && (
                <li className="text-muted-foreground">No audit entries yet</li>
              )}
            </ul>
          </ScrollArea>
        </div>
        <div>
          <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
            <Webhook className="h-4 w-4 text-muted-foreground" aria-hidden />
            Recent webhook events
          </h4>
          <ScrollArea className="h-32 rounded-md border border-border">
            <ul className="p-2 space-y-1 text-sm">
              {webhookEvents.slice(0, 5).map((ev) => (
                <li key={ev.id} className="text-muted-foreground">
                  <span className="font-medium text-foreground">{ev.event_type}</span>
                  {' — '}
                  {formatDistanceToNow(new Date(ev.received_at), { addSuffix: true })}
                </li>
              ))}
              {webhookEvents.length === 0 && (
                <li className="text-muted-foreground">No webhook events yet</li>
              )}
            </ul>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  )
}

export function Integrations() {
  const { data: connectors = [], isLoading } = useConnectorsList()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [errorConnector, setErrorConnector] = useState<Connector | null>(null)
  const [editConnector, setEditConnector] = useState<Connector | null>(null)
  const deleteMutation = useDeleteConnector()

  const selectedConnector = selectedId
    ? connectors.find((c) => c.id === selectedId) ?? null
    : null
  const alreadyConnected = connectors.map((c) => c.provider)

  const handleDisconnect = (id: string) => {
    deleteMutation.mutate(id, {
      onSuccess: (ok) => {
        if (ok && selectedId === id) setSelectedId(null)
      },
    })
  }

  const handleOpenEdit = () => {
    if (selectedConnector) setEditConnector(selectedConnector)
  }

  return (
    <AnimatedPage className="p-6 md:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Integrations</h1>
          <p className="text-muted-foreground mt-1">
            Connect Gmail, Calendar, Slack, and more. Manage OAuth and token health here.
          </p>
        </div>
        <Button
          onClick={() => setAddOpen(true)}
          className="inline-flex items-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98]"
          aria-label="Add integration"
        >
          <Plus className="h-4 w-4" aria-hidden />
          Add integration
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <Card className="border-border bg-card lg:max-h-[calc(100vh-12rem)]">
          <CardHeader>
            <CardTitle className="text-foreground">Connectors</CardTitle>
            <CardDescription className="text-muted-foreground">
              Active and available integrations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-lg" />
                ))}
              </div>
            ) : connectors.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-6 text-center">
                <Activity className="mx-auto h-10 w-10 text-muted-foreground" aria-hidden />
                <p className="mt-2 text-sm font-medium text-foreground">No connectors yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Add an integration to connect your accounts.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => setAddOpen(true)}
                >
                  Add integration
                </Button>
              </div>
            ) : (
              <ScrollArea className="h-[400px] lg:h-[calc(100vh-18rem)]">
                <ul className="space-y-2 pr-2">
                  {connectors.map((connector) => (
                    <li key={connector.id}>
                      <ConnectorListCard
                        connector={connector}
                        isSelected={selectedId === connector.id}
                        onSelect={() => {
                          setSelectedId(connector.id)
                          if (connector.status === 'error') setErrorConnector(connector)
                        }}
                      />
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        <div className="min-w-0">
          {selectedId ? (
            <DetailsPanel
              connectorId={selectedId}
              onEdit={handleOpenEdit}
              onError={() => selectedConnector && setErrorConnector(selectedConnector)}
              onDisconnect={handleDisconnect}
            />
          ) : (
            <Card className="border-border bg-card border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <ChevronRight className="h-12 w-12 text-muted-foreground rotate-[-90deg] sm:rotate-0" aria-hidden />
                <p className="mt-4 text-sm font-medium text-foreground">Select a connector</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Choose one from the list to view details and manage it.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <AddConnectorModal
        open={addOpen}
        onOpenChange={setAddOpen}
        alreadyConnected={alreadyConnected}
      />

      {errorConnector && (
        <ConnectorErrorDialog
          open={!!errorConnector}
          onOpenChange={(open) => !open && setErrorConnector(null)}
          connectorName={errorConnector.provider.replace(/_/g, ' ')}
          message="The connection failed or the token expired. Reconnect to authorize again."
          onReconnect={() => {
            setAddOpen(true)
            setErrorConnector(null)
          }}
        />
      )}

      {editConnector && (
        <EditConnectorForm
          open={!!editConnector}
          onOpenChange={(open) => !open && setEditConnector(null)}
          connector={editConnector}
          onSuccess={() => setEditConnector(null)}
        />
      )}
    </AnimatedPage>
  )
}
