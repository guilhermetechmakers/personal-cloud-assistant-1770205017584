/**
 * React Query hooks for automations and automation runs.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  listAutomations,
  getAutomation,
  createAutomation,
  updateAutomation,
  deleteAutomation,
  setAutomationEnabled,
  listAutomationRuns,
  getLastRunForAutomation,
} from '@/lib/automations'
import type { AutomationInsert, AutomationUpdate } from '@/types/automation'

export const automationKeys = {
  all: ['automations'] as const,
  list: () => [...automationKeys.all, 'list'] as const,
  detail: (id: string) => [...automationKeys.all, 'detail', id] as const,
  runs: (automationId: string) =>
    [...automationKeys.all, 'runs', automationId] as const,
  lastRun: (automationId: string) =>
    [...automationKeys.all, 'lastRun', automationId] as const,
}

export function useAutomationsList() {
  return useQuery({
    queryKey: automationKeys.list(),
    queryFn: listAutomations,
    staleTime: 1000 * 60 * 2,
  })
}

export function useAutomation(id: string | null) {
  return useQuery({
    queryKey: automationKeys.detail(id ?? ''),
    queryFn: () => (id ? getAutomation(id) : Promise.resolve(null)),
    enabled: !!id,
  })
}

export function useAutomationRuns(automationId: string | null) {
  return useQuery({
    queryKey: automationKeys.runs(automationId ?? ''),
    queryFn: () =>
      automationId ? listAutomationRuns(automationId) : Promise.resolve([]),
    enabled: !!automationId,
  })
}

export function useLastRun(automationId: string | null) {
  return useQuery({
    queryKey: automationKeys.lastRun(automationId ?? ''),
    queryFn: () =>
      automationId ? getLastRunForAutomation(automationId) : Promise.resolve(null),
    enabled: !!automationId,
  })
}

export function useCreateAutomation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: Omit<AutomationInsert, 'user_id'>) =>
      createAutomation(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: automationKeys.list() })
      if (data) toast.success('Automation created')
    },
    onError: () => {
      toast.error('Failed to create automation')
    },
  })
}

export function useUpdateAutomation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: AutomationUpdate }) =>
      updateAutomation(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: automationKeys.list() })
      if (data) {
        queryClient.invalidateQueries({
          queryKey: automationKeys.detail(data.id),
        })
        toast.success('Automation updated')
      }
    },
    onError: () => {
      toast.error('Failed to update automation')
    },
  })
}

export function useDeleteAutomation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteAutomation,
    onSuccess: (ok) => {
      queryClient.invalidateQueries({ queryKey: automationKeys.list() })
      if (ok) toast.success('Automation deleted')
    },
    onError: () => {
      toast.error('Failed to delete automation')
    },
  })
}

export function useSetAutomationEnabled() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      setAutomationEnabled(id, enabled),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: automationKeys.list() })
      if (data) {
        queryClient.invalidateQueries({
          queryKey: automationKeys.detail(data.id),
        })
        toast.success(data.enabled ? 'Automation enabled' : 'Automation disabled')
      }
    },
    onError: () => {
      toast.error('Failed to update automation status')
    },
  })
}
