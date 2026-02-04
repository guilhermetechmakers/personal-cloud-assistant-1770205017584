import { getPasswordStrength, type PasswordStrengthLevel } from '@/lib/password-strength'
import { cn } from '@/lib/utils'

interface PasswordStrengthIndicatorProps {
  password: string
  className?: string
  id?: string
}

const levelBarClass: Record<PasswordStrengthLevel, string> = {
  empty: 'bg-muted',
  weak: 'bg-destructive',
  fair: 'bg-warning',
  good: 'bg-success',
  strong: 'bg-success',
}

export function PasswordStrengthIndicator({ password, className, id }: PasswordStrengthIndicatorProps) {
  const { score, level, label } = getPasswordStrength(password)
  if (!password) return null
  return (
    <div id={id} className={cn('space-y-1.5', className)}>
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={score}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Password strength"
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300 ease-out',
            levelBarClass[level],
          )}
          style={{ width: `${score}%` }}
        />
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground">Password strength</span>
        <span
          className={cn(
            'text-xs font-medium',
            level === 'weak' && 'text-destructive',
            level === 'fair' && 'text-warning',
            (level === 'good' || level === 'strong') && 'text-success',
          )}
        >
          {label}
        </span>
      </div>
    </div>
  )
}
