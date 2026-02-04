/**
 * React Query hooks for legal documents and inquiry submission.
 */

import { useQuery, useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { fetchLegalDocuments, submitLegalInquiry } from '@/lib/legal'
import type { LegalInquiryInsert } from '@/types/legal'

export const legalKeys = {
  documents: ['legal', 'documents'] as const,
}

export function useLegalDocuments() {
  return useQuery({
    queryKey: legalKeys.documents,
    queryFn: fetchLegalDocuments,
    staleTime: 1000 * 60 * 10,
  })
}

export function useSubmitLegalInquiry() {
  return useMutation({
    mutationFn: (payload: LegalInquiryInsert) => submitLegalInquiry(payload),
    onSuccess: () => {
      toast.success('Inquiry sent', {
        description: "We've received your message. Our legal team will respond as soon as possible.",
      })
    },
    onError: (err: Error) => {
      toast.error('Failed to send inquiry', { description: err.message })
    },
  })
}
