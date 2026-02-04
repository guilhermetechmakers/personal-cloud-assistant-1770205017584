/**
 * React Query hooks for Web Agent Runs & Recorder.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  listWebAgentRuns,
  getWebAgentRun,
  createWebAgentRun,
  updateWebAgentRun,
  listWebAgentRunSteps,
  createWebAgentRunStep,
  updateWebAgentRunStep,
  getWebAgentStepApproval,
  upsertWebAgentStepApproval,
  listWebAgentProfiles,
  createWebAgentProfile,
  updateWebAgentProfile,
  deleteWebAgentProfile,
} from '@/lib/webAgent'
import type {
  WebAgentRunInsert,
  WebAgentRunUpdate,
  WebAgentRunStepInsert,
  WebAgentRunStepUpdate,
  WebAgentStepApprovalInsert,
  WebAgentStepApprovalUpdate,
  WebAgentProfileInsert,
  WebAgentProfileUpdate,
} from '@/types/webAgent'

export const webAgentKeys = {
  all: ['webAgent'] as const,
  runs: (filters?: { status?: string }) =>
    [...webAgentKeys.all, 'runs', filters] as const,
  run: (runId: string) => [...webAgentKeys.all, 'run', runId] as const,
  steps: (runId: string) => [...webAgentKeys.all, 'steps', runId] as const,
  stepApproval: (stepId: string) =>
    [...webAgentKeys.all, 'stepApproval', stepId] as const,
  profiles: () => [...webAgentKeys.all, 'profiles'] as const,
}

export function useWebAgentRunsList(options?: {
  status?: string
  limit?: number
}) {
  return useQuery({
    queryKey: webAgentKeys.runs(options),
    queryFn: () => listWebAgentRuns(options),
    staleTime: 1000 * 60,
  })
}

export function useWebAgentRun(runId: string | null) {
  return useQuery({
    queryKey: webAgentKeys.run(runId ?? ''),
    queryFn: () => (runId ? getWebAgentRun(runId) : Promise.resolve(null)),
    enabled: !!runId,
    refetchInterval: (query) => {
      const run = query.state.data as { status?: string } | null | undefined
      return run?.status === 'running' || run?.status === 'paused' ? 3000 : false
    },
  })
}

export function useWebAgentRunSteps(runId: string | null) {
  return useQuery({
    queryKey: webAgentKeys.steps(runId ?? ''),
    queryFn: () =>
      runId ? listWebAgentRunSteps(runId) : Promise.resolve([]),
    enabled: !!runId,
    staleTime: 1000 * 30,
  })
}

export function useWebAgentStepApproval(stepId: string | null) {
  return useQuery({
    queryKey: webAgentKeys.stepApproval(stepId ?? ''),
    queryFn: () =>
      stepId ? getWebAgentStepApproval(stepId) : Promise.resolve(null),
    enabled: !!stepId,
  })
}

export function useWebAgentProfiles() {
  return useQuery({
    queryKey: webAgentKeys.profiles(),
    queryFn: listWebAgentProfiles,
    staleTime: 1000 * 60 * 2,
  })
}

export function useCreateWebAgentRun() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: Omit<WebAgentRunInsert, 'user_id'>) =>
      createWebAgentRun(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: webAgentKeys.runs() })
      if (data) {
        queryClient.invalidateQueries({
          queryKey: webAgentKeys.run(data.id),
        })
        toast.success('Run started')
      }
    },
    onError: () => {
      toast.error('Failed to start run')
    },
  })
}

export function useUpdateWebAgentRun(runId: string | null) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: { id: string; updates: WebAgentRunUpdate }) =>
      updateWebAgentRun(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: webAgentKeys.runs() })
      if (data) {
        queryClient.invalidateQueries({
          queryKey: webAgentKeys.run(data.id),
        })
        queryClient.invalidateQueries({
          queryKey: webAgentKeys.steps(data.id),
        })
      }
      if (runId) {
        queryClient.invalidateQueries({
          queryKey: webAgentKeys.run(runId),
        })
        queryClient.invalidateQueries({
          queryKey: webAgentKeys.steps(runId),
        })
      }
      toast.success('Run updated')
    },
    onError: () => {
      toast.error('Failed to update run')
    },
  })
}

export function useCreateWebAgentRunStep(runId: string | null) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: WebAgentRunStepInsert) =>
      createWebAgentRunStep(payload),
    onSuccess: () => {
      if (runId) {
        queryClient.invalidateQueries({
          queryKey: webAgentKeys.steps(runId),
        })
        queryClient.invalidateQueries({
          queryKey: webAgentKeys.run(runId),
        })
      }
    },
    onError: () => {
      toast.error('Failed to add step')
    },
  })
}

export function useUpdateWebAgentRunStep(runId: string | null) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      stepId,
      updates,
    }: { stepId: string; updates: WebAgentRunStepUpdate }) =>
      updateWebAgentRunStep(stepId, updates),
    onSuccess: () => {
      if (runId) {
        queryClient.invalidateQueries({
          queryKey: webAgentKeys.steps(runId),
        })
        queryClient.invalidateQueries({
          queryKey: webAgentKeys.run(runId),
        })
      }
    },
    onError: () => {
      toast.error('Failed to update step')
    },
  })
}

export function useUpsertWebAgentStepApproval(runId: string | null) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      stepId,
      payload,
    }: {
      stepId: string
      payload: WebAgentStepApprovalInsert | WebAgentStepApprovalUpdate
    }) => upsertWebAgentStepApproval(stepId, payload),
    onSuccess: (_, { stepId }) => {
      queryClient.invalidateQueries({
        queryKey: webAgentKeys.stepApproval(stepId),
      })
      if (runId) {
        queryClient.invalidateQueries({
          queryKey: webAgentKeys.steps(runId),
        })
        queryClient.invalidateQueries({
          queryKey: webAgentKeys.run(runId),
        })
      }
      toast.success('Approval recorded')
    },
    onError: () => {
      toast.error('Failed to submit approval')
    },
  })
}

export function useCreateWebAgentProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: Omit<WebAgentProfileInsert, 'user_id'>) =>
      createWebAgentProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: webAgentKeys.profiles() })
      toast.success('Profile created')
    },
    onError: () => {
      toast.error('Failed to create profile')
    },
  })
}

export function useUpdateWebAgentProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      profileId,
      updates,
    }: { profileId: string; updates: WebAgentProfileUpdate }) =>
      updateWebAgentProfile(profileId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: webAgentKeys.profiles() })
      toast.success('Profile updated')
    },
    onError: () => {
      toast.error('Failed to update profile')
    },
  })
}

export function useDeleteWebAgentProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteWebAgentProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: webAgentKeys.profiles() })
      toast.success('Profile deleted')
    },
    onError: () => {
      toast.error('Failed to delete profile')
    },
  })
}
