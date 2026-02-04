/**
 * Types for legal documents and inquiries.
 * Matches supabase/migrations/20250204210000_legal_documents_and_inquiries.sql
 */

export type LegalDocumentType = 'privacy_policy' | 'terms_of_service' | 'cookie_policy'

export interface LegalDocument {
  id: string
  type: LegalDocumentType
  content: string
  last_updated: string
  pdf_link: string | null
  created_at: string
  updated_at: string
}

export interface LegalDocumentInsert {
  id?: string
  type: LegalDocumentType
  content?: string
  last_updated?: string
  pdf_link?: string | null
}

export interface LegalDocumentUpdate {
  content?: string
  last_updated?: string
  pdf_link?: string | null
}

export type LegalInquiryStatus = 'pending' | 'acknowledged' | 'closed'

export interface LegalInquiry {
  id: string
  user_id: string | null
  email: string
  message: string
  status: LegalInquiryStatus
  created_at: string
  updated_at: string
}

export interface LegalInquiryInsert {
  user_id?: string | null
  email: string
  message: string
  status?: LegalInquiryStatus
}

export type LegalDocumentRow = LegalDocument
export type LegalInquiryRow = LegalInquiry
