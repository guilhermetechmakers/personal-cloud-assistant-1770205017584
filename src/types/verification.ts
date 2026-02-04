/**
 * Database types for verification_attempts table
 * Generated: 2025-02-04
 */

export type VerificationAttemptStatus = 'pending' | 'resent' | 'verified'

export interface VerificationAttempt {
  id: string
  user_id: string
  attempt_time: string
  status: VerificationAttemptStatus
  created_at: string
}

export interface VerificationAttemptInsert {
  id?: string
  user_id: string
  attempt_time?: string
  status?: VerificationAttemptStatus
}

export type VerificationAttemptRow = VerificationAttempt
