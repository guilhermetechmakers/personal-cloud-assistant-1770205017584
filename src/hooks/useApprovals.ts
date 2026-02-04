/**
 * React Query hooks for Approvals & Trust Controls: audit logs, rules, decision, undo.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  listApprovalAuditLogs,
  listApprovalRules,
  submitApprovalDecision,
  undoApproval,
  createApprovalRule,
} from '@/lib/approvals'
import type { ApprovalDecisionPayload, ApprovalRuleInsert } from '@/types/approval'
import { runDetailsKeys } from '@/hooks/useRunDetails'

export const approvalKeys = {
  auditLogs: (approvalId: string) => ['approvals', 'auditLogs', approvalId] as const,
  rules: ['approvals', 'rules'] as const,
}

export function useApprovalAuditLogs(approvalId: string | null) {
  return useQuery({
    queryKey: approvalKeys.auditLogs(approvalId ?? ''),
    queryFn: () =>
      approvalId ? listApprovalAuditLogs(approvalId) : Promise.resolve([]),
    enabled: !!approvalId,
    staleTime: 1000 * 60,
  })
}

export function useApprovalRules() {
  return useQuery({
    queryKey: approvalKeys.rules,
    queryFn: listApprovalRules,
    staleTime: 1000 * 60,
  })
}

export function useSubmitApprovalDecision(runId: string | null) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      approvalId,
      payload,
    }: {
      approvalId: string
      payload: ApprovalDecisionPayload
    }) => submitApprovalDecision(approvalId, payload),
    onSuccess: (_, { approvalId }) => {
      queryClient.invalidateQueries({
        queryKey: approvalKeys.auditLogs(approvalId),
      })
      queryClient.invalidateQueries({
        queryKey: approvalKeys.rules,
      })
      if (runId) {
        queryClient.invalidateQueries({
          queryKey: runDetailsKeys.detail(runId),
        })
        queryClient.invalidateQueries({
          queryKey: runDetailsKeys.approvals(runId),
        })
      }
      toast.success('Approval decision submitted')
    },
    onError: () => {
      toast.error('Failed to submit approval decision')
    },
  })
}

export function useUndoApproval(runId: string | null) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      approvalId,
      comments,
    }: {
      approvalId: string
      comments?: string
    }) => undoApproval(approvalId, comments),
    onSuccess: (_, { approvalId }) => {
      queryClient.invalidateQueries({
        queryKey: approvalKeys.auditLogs(approvalId),
      })
      if (runId) {
        queryClient.invalidateQueries({
          queryKey: runDetailsKeys.detail(runId),
        })
        queryClient.invalidateQueries({
          queryKey: runDetailsKeys.approvals(runId),
        })
      }
      toast.success('Approval undone')
    },
    onError: () => {
      toast.error('Failed to undo approval')
    },
  })
}

export function useCreateApprovalRule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: ApprovalRuleInsert) => createApprovalRule(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: approvalKeys.rules,
      })
      toast.success('Approval rule created')
    },
    onError: () => {
      toast.error('Failed to create approval rule')
    },
  })
}
