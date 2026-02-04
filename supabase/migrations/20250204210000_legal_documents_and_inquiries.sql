-- =====================================================
-- Migration: legal_documents and legal_inquiries tables
-- Created: 2025-02-04T21:00:00Z
-- Tables: legal_documents, legal_inquiries
-- Purpose: Legal policy content and legal inquiry submissions for Privacy/Terms/Cookie page
-- =====================================================

-- Enable UUID extension (idempotent)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: legal_documents
-- Purpose: Store Privacy Policy, Terms of Service, Cookie Policy content and PDF links; public read
-- =====================================================
CREATE TABLE IF NOT EXISTS legal_documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  type TEXT NOT NULL UNIQUE CHECK (type IN ('privacy_policy', 'terms_of_service', 'cookie_policy')),
  content TEXT NOT NULL DEFAULT '',
  last_updated TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  pdf_link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Helper function for updated_at (idempotent)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Performance indexes
CREATE INDEX IF NOT EXISTS legal_documents_type_idx ON legal_documents(type);
CREATE INDEX IF NOT EXISTS legal_documents_last_updated_idx ON legal_documents(last_updated DESC);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_legal_documents_updated_at ON legal_documents;
CREATE TRIGGER update_legal_documents_updated_at
  BEFORE UPDATE ON legal_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE legal_documents ENABLE ROW LEVEL SECURITY;

-- RLS: Public read for all; write only via service role (no insert/update policy for anon/authenticated)
CREATE POLICY "legal_documents_select_public"
  ON legal_documents FOR SELECT
  USING (true);

COMMENT ON TABLE legal_documents IS 'Legal policy documents (Privacy, Terms, Cookie); public read, admin write via backend';
COMMENT ON COLUMN legal_documents.type IS 'One of: privacy_policy, terms_of_service, cookie_policy';
COMMENT ON COLUMN legal_documents.pdf_link IS 'Optional URL or storage path for downloadable PDF';

-- =====================================================
-- TABLE: legal_inquiries
-- Purpose: Store legal inquiry submissions; users can submit, optionally linked to auth user
-- =====================================================
CREATE TABLE IF NOT EXISTS legal_inquiries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'acknowledged', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT legal_inquiries_message_not_empty CHECK (length(trim(message)) > 0),
  CONSTRAINT legal_inquiries_email_not_empty CHECK (length(trim(email)) > 0)
);

CREATE INDEX IF NOT EXISTS legal_inquiries_user_id_idx ON legal_inquiries(user_id);
CREATE INDEX IF NOT EXISTS legal_inquiries_status_idx ON legal_inquiries(status);
CREATE INDEX IF NOT EXISTS legal_inquiries_created_at_idx ON legal_inquiries(created_at DESC);

DROP TRIGGER IF EXISTS update_legal_inquiries_updated_at ON legal_inquiries;
CREATE TRIGGER update_legal_inquiries_updated_at
  BEFORE UPDATE ON legal_inquiries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE legal_inquiries ENABLE ROW LEVEL SECURITY;

-- RLS: Anyone can insert (submit inquiry); users can select only their own rows
CREATE POLICY "legal_inquiries_insert_public"
  ON legal_inquiries FOR INSERT
  WITH CHECK (true);

CREATE POLICY "legal_inquiries_select_own"
  ON legal_inquiries FOR SELECT
  USING (auth.uid() = user_id);

COMMENT ON TABLE legal_inquiries IS 'Legal inquiries from users; optional user_id when logged in';
COMMENT ON COLUMN legal_inquiries.user_id IS 'Set when user is authenticated; null for anonymous submissions';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS legal_inquiries CASCADE;
-- DROP TABLE IF EXISTS legal_documents CASCADE;
