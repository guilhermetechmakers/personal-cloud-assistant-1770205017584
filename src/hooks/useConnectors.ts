/**
 * React Query hooks for connectors, connector audit logs, and webhook events.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  listConnectors,
  getConnector,
  createConnector,
  updateConnector,
  deleteConnector,
  getOAuthAuthorizeUrl,
  checkConnectorHealth,
} from '@/lib/connectors'
import {
  listConnectorAuditLogs,
  createConnectorAuditLog,
} from '@/lib/connectorAudit'
import { listWebhookEvents } from '@/lib/webhookEvents'
import type { ConnectorInsert, ConnectorUpdate } from '@/types/connector'

export const connectorKeys = {
  all: ['connectors'] as const,
  list: () => [...connectorKeys.all, 'list'] as const,
  detail: (id: string) => [...connectorKeys.all, 'detail', id] as const,
  auditLogs: (connectorId: string) =>
    [...connectorKeys.all, 'audit', connectorId] as const,
  webhookEvents: (connectorId: string) =>
    [...connectorKeys.all, 'webhooks', connectorId] as const,
}

export function useConnectorsList() {
  return useQuery({
    queryKey: connectorKeys.list(),
    queryFn: listConnectors,
    staleTime: 1000 * 60 * 2,
  })
}

export function useConnector(id: string | null) {
  return useQuery({
    queryKey: connectorKeys.detail(id ?? ''),
    queryFn: () => (id ? getConnector(id) : Promise.resolve(null)),
    enabled: !!id,
  })
}

export function useConnectorAuditLogs(connectorId: string | null) {
  return useQuery({
    queryKey: connectorKeys.auditLogs(connectorId ?? ''),
    queryFn: () =>
      connectorId ? listConnectorAuditLogs(connectorId) : Promise.resolve([]),
    enabled: !!connectorId,
  })
}

export function useWebhookEvents(connectorId: string | null) {
  return useQuery({
    queryKey: connectorKeys.webhookEvents(connectorId ?? ''),
    queryFn: () =>
      connectorId ? listWebhookEvents(connectorId) : Promise.resolve([]),
    enabled: !!connectorId,
  })
}

export function useCreateConnector() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: Omit<ConnectorInsert, 'user_id'>) =>
      createConnector(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: connectorKeys.list() })
      if (data) {
        queryClient.invalidateQueries({
          queryKey: connectorKeys.detail(data.id),
        })
        toast.success('Connector added')
      }
    },
    onError: () => {
      toast.error('Failed to add connector')
    },
  })
}

export function useUpdateConnector() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: ConnectorUpdate }) =>
      updateConnector(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: connectorKeys.list() })
      if (data) {
        queryClient.invalidateQueries({
          queryKey: connectorKeys.detail(data.id),
        })
        toast.success('Connector updated')
      }
    },
    onError: () => {
      toast.error('Failed to update connector')
    },
  })
}

export function useDeleteConnector() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteConnector,
    onSuccess: (ok) => {
      queryClient.invalidateQueries({ queryKey: connectorKeys.list() })
      if (ok) toast.success('Connector disconnected')
    },
    onError: () => {
      toast.error('Failed to disconnect connector')
    },
  })
}

export function useOAuthAuthorizeUrl() {
  return useMutation({
    mutationFn: (provider: string) => getOAuthAuthorizeUrl(provider),
  })
}

export function useCheckConnectorHealth() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: checkConnectorHealth,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: connectorKeys.list() })
      queryClient.invalidateQueries({
        queryKey: connectorKeys.detail(id),
      })
    },
  })
}

export function useCreateConnectorAuditLog() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: {
      connector_id: string
      action: string
      details?: Record<string, unknown>
    }) => createConnectorAuditLog(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: connectorKeys.auditLogs(variables.connector_id),
      })
    },
  })
}
