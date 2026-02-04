/**
 * React Query hooks for exports.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { listExports, getExport, createExport } from '@/lib/exports'
import type { ExportDataType, ExportFormat } from '@/types/export'

export const exportKeys = {
  all: ['exports'] as const,
  list: () => [...exportKeys.all, 'list'] as const,
  detail: (id: string) => [...exportKeys.all, 'detail', id] as const,
}

export function useExportsList() {
  return useQuery({
    queryKey: exportKeys.list(),
    queryFn: listExports,
    staleTime: 1000 * 60 * 2,
  })
}

export function useExport(id: string | null) {
  return useQuery({
    queryKey: exportKeys.detail(id ?? ''),
    queryFn: () => (id ? getExport(id) : Promise.resolve(null)),
    enabled: !!id,
  })
}

export function useCreateExport() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: {
      data_type: ExportDataType
      format: ExportFormat
      date_from: string
      date_to: string
    }) => createExport(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: exportKeys.list() })
      if (data) {
        queryClient.invalidateQueries({ queryKey: exportKeys.detail(data.id) })
        toast.success('Export requested. You will receive a download link when ready.')
      }
    },
    onError: () => {
      toast.error('Failed to request export')
    },
  })
}
