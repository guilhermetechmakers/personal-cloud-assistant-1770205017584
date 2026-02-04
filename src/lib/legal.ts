/**
 * Legal documents and inquiries data layer.
 * Uses Supabase when configured; falls back to static content for development.
 */

import { supabase } from '@/lib/supabase'
import type { LegalDocument, LegalDocumentType, LegalInquiryInsert } from '@/types/legal'

/** Fetch all legal documents (public read). */
export async function fetchLegalDocuments(): Promise<LegalDocument[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('legal_documents')
    .select('*')
    .order('type', { ascending: true })
  if (error) return []
  return (data ?? []) as LegalDocument[]
}

/** Fetch a single legal document by type. */
export async function fetchLegalDocumentByType(
  type: LegalDocumentType
): Promise<LegalDocument | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('legal_documents')
    .select('*')
    .eq('type', type)
    .single()
  if (error || !data) return null
  return data as LegalDocument
}

/** Submit a legal inquiry. Optionally link to current user. */
export async function submitLegalInquiry(
  payload: LegalInquiryInsert
): Promise<{ id: string } | null> {
  if (!supabase) return null
  const { data: { user } } = await supabase.auth.getUser()
  const row = {
    email: payload.email.trim(),
    message: payload.message.trim(),
    user_id: user?.id ?? null,
    status: 'pending' as const,
  }
  const { data, error } = await supabase
    .from('legal_inquiries')
    .insert(row)
    .select('id')
    .single()
  if (error) throw new Error(error.message)
  return data ? { id: (data as { id: string }).id } : null
}
