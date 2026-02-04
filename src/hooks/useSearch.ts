/**
 * React Query hooks for Search & Filter: saved searches and search execution.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  listUserSearches,
  getUserSearch,
  createUserSearch,
  updateUserSearch,
  deleteUserSearch,
  performSearch,
} from '@/lib/search'
import type {
  UserSearchInsert,
  UserSearchUpdate,
  SearchParameters,
} from '@/types/search'

export const searchKeys = {
  saved: ['search', 'saved'] as const,
  savedList: () => [...searchKeys.saved, 'list'] as const,
  savedDetail: (id: string) => [...searchKeys.saved, 'detail', id] as const,
  results: (params: SearchParameters) =>
    ['search', 'results', JSON.stringify(params)] as const,
}

export function useSavedSearchesList() {
  return useQuery({
    queryKey: searchKeys.savedList(),
    queryFn: listUserSearches,
    staleTime: 1000 * 60 * 2,
  })
}

export function useSavedSearch(id: string | null) {
  return useQuery({
    queryKey: searchKeys.savedDetail(id ?? ''),
    queryFn: () => (id ? getUserSearch(id) : Promise.resolve(null)),
    enabled: !!id,
  })
}

export function useSearch(params: SearchParameters | null) {
  return useQuery({
    queryKey: searchKeys.results(params ?? {}),
    queryFn: () => (params ? performSearch(params) : Promise.resolve({ items: [], total: 0, page: 1, limit: 20 })),
    enabled: !!params && (!!(params.query?.trim()) || !!((params.types?.length ?? 0) > 0)),
    staleTime: 1000 * 30,
  })
}

export function useCreateSavedSearch() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: Omit<UserSearchInsert, 'user_id'>) =>
      createUserSearch(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: searchKeys.savedList() })
      toast.success('Search saved')
    },
    onError: () => {
      toast.error('Failed to save search')
    },
  })
}

export function useUpdateSavedSearch() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: { id: string; updates: UserSearchUpdate }) =>
      updateUserSearch(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: searchKeys.savedList() })
      if (data) {
        queryClient.invalidateQueries({
          queryKey: searchKeys.savedDetail(data.id),
        })
      }
      toast.success('Saved search updated')
    },
    onError: () => {
      toast.error('Failed to update saved search')
    },
  })
}

export function useDeleteSavedSearch() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteUserSearch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: searchKeys.savedList() })
      toast.success('Saved search deleted')
    },
    onError: () => {
      toast.error('Failed to delete saved search')
    },
  })
}
