/**
 * React Query hooks for run details, steps, approvals, artifacts.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  getRunDetails,
  getRunDetailsHeader,
  listRunSteps,
  listRunApprovals,
  listRunArtifacts,
  updateRunApproval,
  exportRun,
  createShareLink,
} from '@/lib/runs'
import type { RunApprovalUpdate } from '@/types/run'

export const runDetailsKeys = {
  all: ['runDetails'] as const,
  detail: (runId: string) => [...runDetailsKeys.all, runId] as const,
  header: (runId: string) => [...runDetailsKeys.all, 'header', runId] as const,
  steps: (runId: string) => [...runDetailsKeys.all, 'steps', runId] as const,
  approvals: (runId: string) =>
    [...runDetailsKeys.all, 'approvals', runId] as const,
  artifacts: (runId: string) =>
    [...runDetailsKeys.all, 'artifacts', runId] as const,
}

export function useRunDetails(runId: string | null) {
  return useQuery({
    queryKey: runDetailsKeys.detail(runId ?? ''),
    queryFn: () => (runId ? getRunDetails(runId) : Promise.resolve(null)),
    enabled: !!runId,
    staleTime: 1000 * 60,
  })
}

export function useRunDetailsHeader(runId: string | null) {
  return useQuery({
    queryKey: runDetailsKeys.header(runId ?? ''),
    queryFn: () =>
      runId ? getRunDetailsHeader(runId) : Promise.resolve(null),
    enabled: !!runId,
  })
}

export function useRunSteps(runId: string | null) {
  return useQuery({
    queryKey: runDetailsKeys.steps(runId ?? ''),
    queryFn: () => (runId ? listRunSteps(runId) : Promise.resolve([])),
    enabled: !!runId,
  })
}

export function useRunApprovals(runId: string | null) {
  return useQuery({
    queryKey: runDetailsKeys.approvals(runId ?? ''),
    queryFn: () => (runId ? listRunApprovals(runId) : Promise.resolve([])),
    enabled: !!runId,
  })
}

export function useRunArtifacts(runId: string | null) {
  return useQuery({
    queryKey: runDetailsKeys.artifacts(runId ?? ''),
    queryFn: () => (runId ? listRunArtifacts(runId) : Promise.resolve([])),
    enabled: !!runId,
  })
}

export function useUpdateRunApproval(runId: string | null) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      approvalId,
      updates,
    }: {
      approvalId: string
      updates: RunApprovalUpdate
    }) => updateRunApproval(approvalId, updates),
    onSuccess: () => {
      if (runId) {
        queryClient.invalidateQueries({
          queryKey: runDetailsKeys.detail(runId),
        })
        queryClient.invalidateQueries({
          queryKey: runDetailsKeys.approvals(runId),
        })
      }
      toast.success('Approval updated')
    },
    onError: () => {
      toast.error('Failed to update approval')
    },
  })
}

export function useExportRun() {
  return useMutation({
    mutationFn: ({
      runId,
      format,
    }: {
      runId: string
      format: 'pdf' | 'json'
    }) => exportRun(runId, format),
    onError: () => {
      toast.error('Export failed')
    },
  })
}

export function useShareLink() {
  return useMutation({
    mutationFn: ({
      runId,
      options,
    }: {
      runId: string
      options?: { expiresIn?: string; allowView?: boolean }
    }) => createShareLink(runId, options ?? {}),
    onError: () => {
      toast.error('Failed to create share link')
    },
  })
}
