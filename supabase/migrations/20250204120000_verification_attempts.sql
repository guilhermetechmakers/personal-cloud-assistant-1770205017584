-- =====================================================
-- Migration: verification_attempts table
-- Created: 2025-02-04T12:00:00Z
-- Tables: verification_attempts
-- Purpose: Track email verification resend attempts for cooldown and audit
-- =====================================================

-- Enable UUID extension (idempotent)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: verification_attempts
-- Purpose: Record each verification email resend attempt per user for cooldown and audit
-- =====================================================
CREATE TABLE IF NOT EXISTS verification_attempts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- attempt_time: when the resend was requested
  attempt_time TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- status: pending (sent), resent (triggered), verified (user confirmed)
  status TEXT DEFAULT 'pending' NOT NULL
    CHECK (status IN ('pending', 'resent', 'verified')),

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS verification_attempts_user_id_idx ON verification_attempts(user_id);
CREATE INDEX IF NOT EXISTS verification_attempts_attempt_time_idx ON verification_attempts(attempt_time DESC);
CREATE INDEX IF NOT EXISTS verification_attempts_user_time_idx ON verification_attempts(user_id, attempt_time DESC);

-- Enable Row Level Security
ALTER TABLE verification_attempts ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own attempts
CREATE POLICY "verification_attempts_select_own"
  ON verification_attempts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "verification_attempts_insert_own"
  ON verification_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- No UPDATE/DELETE needed for audit table; only insert on resend

-- Documentation
COMMENT ON TABLE verification_attempts IS 'Tracks email verification resend attempts for cooldown and audit trail';
COMMENT ON COLUMN verification_attempts.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN verification_attempts.user_id IS 'User who requested resend (references auth.users)';
COMMENT ON COLUMN verification_attempts.status IS 'pending = sent, resent = triggered, verified = user confirmed';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS verification_attempts CASCADE;
