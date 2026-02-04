/**
 * React Query hooks for retention policies.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  listRetentionPolicies,
  getRetentionPolicy,
  createRetentionPolicy,
  updateRetentionPolicy,
  deleteRetentionPolicy,
} from '@/lib/retentionPolicies'
import type {
  RetentionPolicyInsert,
  RetentionPolicyUpdate,
} from '@/types/export'

export const retentionPolicyKeys = {
  all: ['retention_policies'] as const,
  list: () => [...retentionPolicyKeys.all, 'list'] as const,
  detail: (id: string) => [...retentionPolicyKeys.all, 'detail', id] as const,
}

export function useRetentionPoliciesList() {
  return useQuery({
    queryKey: retentionPolicyKeys.list(),
    queryFn: listRetentionPolicies,
    staleTime: 1000 * 60 * 2,
  })
}

export function useRetentionPolicy(id: string | null) {
  return useQuery({
    queryKey: retentionPolicyKeys.detail(id ?? ''),
    queryFn: () => (id ? getRetentionPolicy(id) : Promise.resolve(null)),
    enabled: !!id,
  })
}

export function useCreateRetentionPolicy() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: Omit<RetentionPolicyInsert, 'created_by'>) =>
      createRetentionPolicy(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: retentionPolicyKeys.list() })
      if (data) {
        queryClient.invalidateQueries({
          queryKey: retentionPolicyKeys.detail(data.id),
        })
        toast.success('Retention policy created')
      }
    },
    onError: () => {
      toast.error('Failed to create retention policy')
    },
  })
}

export function useUpdateRetentionPolicy() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string
      updates: RetentionPolicyUpdate
    }) => updateRetentionPolicy(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: retentionPolicyKeys.list() })
      if (data) {
        queryClient.invalidateQueries({
          queryKey: retentionPolicyKeys.detail(data.id),
        })
        toast.success('Retention policy updated')
      }
    },
    onError: () => {
      toast.error('Failed to update retention policy')
    },
  })
}

export function useDeleteRetentionPolicy() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteRetentionPolicy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: retentionPolicyKeys.list() })
      toast.success('Retention policy deleted')
    },
    onError: () => {
      toast.error('Failed to delete retention policy')
    },
  })
}
