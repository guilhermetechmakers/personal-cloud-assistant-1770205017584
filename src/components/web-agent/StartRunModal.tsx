/**
 * Start Run Modal: select profile type (ephemeral/persistent) and confirm run initiation.
 */

import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { WebAgentProfileType } from '@/types/webAgent'
import type { WebAgentProfile } from '@/types/webAgent'

export interface StartRunModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  profiles: WebAgentProfile[]
  onStart: (profileType: WebAgentProfileType, profileId?: string) => void
  isStarting?: boolean
}

const PROFILE_TYPE_OPTIONS: { value: WebAgentProfileType; label: string }[] = [
  { value: 'ephemeral', label: 'Ephemeral (no persistence)' },
  { value: 'persistent', label: 'Persistent (saved profile)' },
]

export function StartRunModal({
  open,
  onOpenChange,
  profiles,
  onStart,
  isStarting = false,
}: StartRunModalProps) {
  const [profileType, setProfileType] = React.useState<WebAgentProfileType>('ephemeral')
  const [selectedProfileId, setSelectedProfileId] = React.useState<string>('')

  React.useEffect(() => {
    if (open) {
      setProfileType('ephemeral')
      setSelectedProfileId(profiles.find((p) => p.profile_type === 'persistent')?.id ?? '')
    }
  }, [open, profiles])

  const persistentProfiles = profiles.filter((p) => p.profile_type === 'persistent')

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (profileType === 'persistent' && selectedProfileId) {
      onStart('persistent', selectedProfileId)
    } else {
      onStart('ephemeral')
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-border bg-card">
        <DialogHeader>
          <DialogTitle className="text-foreground">Start Web Agent Run</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Choose a profile type. Ephemeral runs leave no saved state; persistent uses
            an existing profile.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="profile-type" className="text-foreground">
              Profile type
            </Label>
            <Select
              value={profileType}
              onValueChange={(v) => setProfileType(v as WebAgentProfileType)}
            >
              <SelectTrigger
                id="profile-type"
                className="border-border bg-background text-foreground"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROFILE_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {profileType === 'persistent' && (
            <div className="space-y-2">
              <Label htmlFor="profile" className="text-foreground">
                Profile
              </Label>
              <Select
                value={selectedProfileId || (persistentProfiles[0]?.id ?? '')}
                onValueChange={setSelectedProfileId}
              >
                <SelectTrigger
                  id="profile"
                  className="border-border bg-background text-foreground"
                >
                  <SelectValue placeholder="Select profile" />
                </SelectTrigger>
                <SelectContent>
                  {persistentProfiles.length === 0 ? (
                    <SelectItem value="_none" disabled>
                      No persistent profiles. Create one in Profile Management.
                    </SelectItem>
                  ) : (
                    persistentProfiles.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-border"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isStarting ||
                (profileType === 'persistent' && persistentProfiles.length === 0)
              }
              className="bg-primary text-primary-foreground hover:bg-primary/90 transition-transform hover:scale-[1.02]"
            >
              {isStarting ? 'Starting…' : 'Start run'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
