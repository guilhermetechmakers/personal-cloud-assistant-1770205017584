/**
 * React Query hooks for skills and Skill Studio.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  listSkills,
  getSkill,
  createSkill,
  updateSkill,
  deleteSkill,
  publishSkill,
  listSkillBlocks,
  createSkillBlock,
  updateSkillBlock,
  deleteSkillBlock,
  reorderSkillBlocks,
  listSkillVersionHistory,
  createSkillVersionSnapshot,
  listSkillTests,
  createSkillTest,
} from '@/lib/skills'
import type {
  SkillInsert,
  SkillUpdate,
  SkillBlockInsert,
  SkillBlockUpdate,
  SkillTestInsert,
} from '@/types/skill'

export const skillKeys = {
  all: ['skills'] as const,
  list: () => [...skillKeys.all, 'list'] as const,
  detail: (id: string) => [...skillKeys.all, 'detail', id] as const,
  blocks: (skillId: string) => [...skillKeys.all, 'blocks', skillId] as const,
  versionHistory: (skillId: string) =>
    [...skillKeys.all, 'versionHistory', skillId] as const,
  tests: (skillId: string) => [...skillKeys.all, 'tests', skillId] as const,
}

export function useSkillsList() {
  return useQuery({
    queryKey: skillKeys.list(),
    queryFn: listSkills,
    staleTime: 1000 * 60 * 2,
  })
}

export function useSkill(id: string | null) {
  return useQuery({
    queryKey: skillKeys.detail(id ?? ''),
    queryFn: () => (id ? getSkill(id) : Promise.resolve(null)),
    enabled: !!id,
  })
}

export function useSkillBlocks(skillId: string | null) {
  return useQuery({
    queryKey: skillKeys.blocks(skillId ?? ''),
    queryFn: () =>
      skillId ? listSkillBlocks(skillId) : Promise.resolve([]),
    enabled: !!skillId,
  })
}

export function useSkillVersionHistory(skillId: string | null) {
  return useQuery({
    queryKey: skillKeys.versionHistory(skillId ?? ''),
    queryFn: () =>
      skillId ? listSkillVersionHistory(skillId) : Promise.resolve([]),
    enabled: !!skillId,
  })
}

export function useSkillTests(skillId: string | null) {
  return useQuery({
    queryKey: skillKeys.tests(skillId ?? ''),
    queryFn: () =>
      skillId ? listSkillTests(skillId) : Promise.resolve([]),
    enabled: !!skillId,
  })
}

export function useCreateSkill() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: Omit<SkillInsert, 'user_id'>) => createSkill(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: skillKeys.list() })
      if (data) {
        queryClient.invalidateQueries({
          queryKey: skillKeys.detail(data.id),
        })
        toast.success('Skill created')
      }
    },
    onError: () => {
      toast.error('Failed to create skill')
    },
  })
}

export function useUpdateSkill() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: SkillUpdate }) =>
      updateSkill(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: skillKeys.list() })
      if (data) {
        queryClient.invalidateQueries({
          queryKey: skillKeys.detail(data.id),
        })
        toast.success('Skill saved')
      }
    },
    onError: () => {
      toast.error('Failed to save skill')
    },
  })
}

export function useDeleteSkill() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteSkill,
    onSuccess: (ok) => {
      queryClient.invalidateQueries({ queryKey: skillKeys.list() })
      if (ok) toast.success('Skill deleted')
    },
    onError: () => {
      toast.error('Failed to delete skill')
    },
  })
}

export function usePublishSkill() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: publishSkill,
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({
          queryKey: skillKeys.detail(data.id),
        })
        queryClient.invalidateQueries({ queryKey: skillKeys.list() })
        toast.success('Skill published')
      }
    },
    onError: () => {
      toast.error('Failed to publish skill')
    },
  })
}

export function useCreateSkillBlock() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: SkillBlockInsert) => createSkillBlock(payload),
    onSuccess: (data) => {
      if (data?.skill_id) {
        queryClient.invalidateQueries({
          queryKey: skillKeys.blocks(data.skill_id),
        })
        queryClient.invalidateQueries({
          queryKey: skillKeys.detail(data.skill_id),
        })
        toast.success('Block added')
      }
    },
    onError: () => {
      toast.error('Failed to add block')
    },
  })
}

export function useUpdateSkillBlock() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string
      skillId: string
      updates: SkillBlockUpdate
    }) => updateSkillBlock(id, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: skillKeys.blocks(variables.skillId),
      })
      queryClient.invalidateQueries({
        queryKey: skillKeys.detail(variables.skillId),
      })
      toast.success('Block updated')
    },
    onError: () => {
      toast.error('Failed to update block')
    },
  })
}

export function useDeleteSkillBlock() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id }: { id: string; skillId: string }) =>
      deleteSkillBlock(id),
    onSuccess: (_, { skillId }) => {
      queryClient.invalidateQueries({ queryKey: skillKeys.blocks(skillId) })
      queryClient.invalidateQueries({ queryKey: skillKeys.detail(skillId) })
      toast.success('Block removed')
    },
    onError: () => {
      toast.error('Failed to remove block')
    },
  })
}

export function useReorderSkillBlocks() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      skillId,
      blockIds,
    }: {
      skillId: string
      blockIds: string[]
    }) => reorderSkillBlocks(skillId, blockIds),
    onSuccess: (_, { skillId }) => {
      queryClient.invalidateQueries({ queryKey: skillKeys.blocks(skillId) })
    },
    onError: () => {
      toast.error('Failed to reorder blocks')
    },
  })
}

export function useCreateSkillVersionSnapshot() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      skillId,
      version,
      snapshot,
    }: {
      skillId: string
      version: number
      snapshot: Record<string, unknown>
    }) => createSkillVersionSnapshot(skillId, version, snapshot),
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({
          queryKey: skillKeys.versionHistory(data.skill_id),
        })
        toast.success('Snapshot saved')
      }
    },
    onError: () => {
      toast.error('Failed to save snapshot')
    },
  })
}

export function useCreateSkillTest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: SkillTestInsert) => createSkillTest(payload),
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({
          queryKey: skillKeys.tests(data.skill_id),
        })
      }
    },
  })
}
