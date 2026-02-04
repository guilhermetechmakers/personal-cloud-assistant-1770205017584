/**
 * React Query hooks for workspace settings.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  getCurrentWorkspace,
  updateWorkspace,
  getWorkspaceMembers,
  inviteWorkspaceMember,
  updateWorkspaceMemberRole,
  removeWorkspaceMember,
  getWorkspaceBilling,
  updateWorkspaceBilling,
  getWorkspaceSecurityPolicy,
  updateWorkspaceSecurityPolicy,
  getWorkspaceAuditLogs,
} from '@/lib/workspace'
import type {
  WorkspaceUpdate,
  WorkspaceMemberUpdate,
  WorkspaceBillingUpdate,
  WorkspaceSecurityPolicyUpdate,
} from '@/types/workspace'

export const workspaceKeys = {
  current: ['workspace', 'current'] as const,
  members: (workspaceId: string) => ['workspace', workspaceId, 'members'] as const,
  billing: (workspaceId: string) => ['workspace', workspaceId, 'billing'] as const,
  securityPolicy: (workspaceId: string) => ['workspace', workspaceId, 'securityPolicy'] as const,
  auditLogs: (workspaceId: string, page?: number) =>
    ['workspace', workspaceId, 'auditLogs', page ?? 0] as const,
}

export function useCurrentWorkspace() {
  return useQuery({
    queryKey: workspaceKeys.current,
    queryFn: getCurrentWorkspace,
    staleTime: 1000 * 60 * 2,
  })
}

export function useUpdateWorkspace() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ workspaceId, updates }: { workspaceId: string; updates: WorkspaceUpdate }) =>
      updateWorkspace(workspaceId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workspaceKeys.current })
      toast.success('Workspace updated')
    },
    onError: () => {
      toast.error('Failed to update workspace')
    },
  })
}

export function useWorkspaceMembers(workspaceId: string | undefined) {
  return useQuery({
    queryKey: workspaceKeys.members(workspaceId ?? ''),
    queryFn: () => getWorkspaceMembers(workspaceId!),
    enabled: !!workspaceId,
  })
}

export function useInviteWorkspaceMember(workspaceId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { email: string; role: 'admin' | 'member' | 'viewer' }) =>
      inviteWorkspaceMember(workspaceId!, payload),
    onSuccess: () => {
      if (workspaceId) queryClient.invalidateQueries({ queryKey: workspaceKeys.members(workspaceId) })
      toast.success('Invitation sent')
    },
    onError: () => {
      toast.error('Failed to send invitation')
    },
  })
}

export function useUpdateWorkspaceMemberRole(workspaceId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      memberId,
      updates,
    }: {
      memberId: string
      updates: WorkspaceMemberUpdate
    }) => updateWorkspaceMemberRole(workspaceId!, memberId, updates),
    onSuccess: () => {
      if (workspaceId) {
        queryClient.invalidateQueries({ queryKey: workspaceKeys.members(workspaceId) })
      }
      toast.success('Role updated')
    },
    onError: () => {
      toast.error('Failed to update role')
    },
  })
}

export function useRemoveWorkspaceMember(workspaceId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (memberId: string) => removeWorkspaceMember(workspaceId!, memberId),
    onSuccess: () => {
      if (workspaceId) queryClient.invalidateQueries({ queryKey: workspaceKeys.members(workspaceId) })
      toast.success('Member removed')
    },
    onError: () => {
      toast.error('Failed to remove member')
    },
  })
}

export function useWorkspaceBilling(workspaceId: string | undefined) {
  return useQuery({
    queryKey: workspaceKeys.billing(workspaceId ?? ''),
    queryFn: () => getWorkspaceBilling(workspaceId!),
    enabled: !!workspaceId,
  })
}

export function useUpdateWorkspaceBilling(workspaceId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (updates: WorkspaceBillingUpdate) =>
      updateWorkspaceBilling(workspaceId!, updates),
    onSuccess: () => {
      if (workspaceId) queryClient.invalidateQueries({ queryKey: workspaceKeys.billing(workspaceId) })
      toast.success('Billing updated')
    },
    onError: () => {
      toast.error('Failed to update billing')
    },
  })
}

export function useWorkspaceSecurityPolicy(workspaceId: string | undefined) {
  return useQuery({
    queryKey: workspaceKeys.securityPolicy(workspaceId ?? ''),
    queryFn: () => getWorkspaceSecurityPolicy(workspaceId!),
    enabled: !!workspaceId,
  })
}

export function useUpdateWorkspaceSecurityPolicy(workspaceId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (updates: WorkspaceSecurityPolicyUpdate) =>
      updateWorkspaceSecurityPolicy(workspaceId!, updates),
    onSuccess: () => {
      if (workspaceId) {
        queryClient.invalidateQueries({
          queryKey: workspaceKeys.securityPolicy(workspaceId),
        })
      }
      toast.success('Security policy updated')
    },
    onError: () => {
      toast.error('Failed to update security policy')
    },
  })
}

export function useWorkspaceAuditLogs(
  workspaceId: string | undefined,
  options?: { limit?: number; offset?: number }
) {
  return useQuery({
    queryKey: workspaceKeys.auditLogs(workspaceId ?? '', options?.offset ?? 0),
    queryFn: () =>
      getWorkspaceAuditLogs(workspaceId!, {
        limit: options?.limit ?? 50,
        offset: options?.offset ?? 0,
      }),
    enabled: !!workspaceId,
  })
}
