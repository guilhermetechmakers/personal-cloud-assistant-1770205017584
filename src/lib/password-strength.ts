/**
 * Password strength calculation and labels for UI.
 * Design: weak (red), fair (yellow), good (green), strong (green).
 */

export type PasswordStrengthLevel = 'empty' | 'weak' | 'fair' | 'good' | 'strong'

export interface PasswordStrength {
  score: number
  level: PasswordStrengthLevel
  label: string
}

const LEVELS: { min: number; level: PasswordStrengthLevel; label: string }[] = [
  { min: 0, level: 'empty', label: '' },
  { min: 1, level: 'weak', label: 'Weak' },
  { min: 25, level: 'fair', label: 'Fair' },
  { min: 50, level: 'good', label: 'Good' },
  { min: 75, level: 'strong', label: 'Strong' },
]

/**
 * Computes a 0–100 score and level from password string.
 * Criteria: length ≥8, mixed case, digit, special character.
 */
export function getPasswordStrength(value: string): PasswordStrength {
  if (!value) {
    return { score: 0, level: 'empty', label: '' }
  }
  let score = 0
  if (value.length >= 8) score += 25
  if (value.length >= 12) score += 10
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score += 25
  if (/\d/.test(value)) score += 20
  if (/[^a-zA-Z0-9]/.test(value)) score += 20
  score = Math.min(100, score)

  const levelConfig = [...LEVELS].reverse().find((l) => score >= l.min)
  const level = levelConfig?.level ?? 'empty'
  const label = levelConfig?.label ?? ''
  return { score, level, label }
}
