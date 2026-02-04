import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { AnimatedPage } from '@/components/layout/AnimatedPage'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  useProfileView,
  useUpdateProfile,
  useUpdatePreferences,
  useSessions,
  useRevokeOtherSessions,
  useSetTwoFaEnabled,
} from '@/hooks/useProfile'
import type { ProfileView, AssistantTone, Verbosity, DefaultApprovalLevel } from '@/types/profile'
import {
  User,
  Shield,
  CreditCard,
  Plug,
  LogOut,
  HelpCircle,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

const editProfileSchema = z.object({
  full_name: z.string().min(0).optional(),
  display_name: z.string().min(0).optional(),
  timezone: z.string().min(0).optional(),
  locale: z.string().min(0).optional(),
})

type EditProfileForm = z.infer<typeof editProfileSchema>

const TONE_OPTIONS: { value: AssistantTone; label: string }[] = [
  { value: 'professional', label: 'Professional' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'concise', label: 'Concise' },
  { value: 'detailed', label: 'Detailed' },
]

const VERBOSITY_OPTIONS: { value: Verbosity; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]

const APPROVAL_OPTIONS: { value: DefaultApprovalLevel; label: string }[] = [
  { value: 'draft_only', label: 'Draft only' },
  { value: 'requires_approval', label: 'Requires approval' },
  { value: 'always_allow', label: 'Always allow' },
]

function ProfileSummaryCard({ profile, onEdit }: { profile: ProfileView; onEdit: () => void }) {
  const displayName = profile.display_name || profile.full_name || 'User'
  const initials = displayName
    .split(/\s+/)
    .map((s) => s[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <Card className="border-border bg-card transition-shadow duration-200 hover:shadow-card">
      <CardHeader>
        <CardTitle className="text-foreground">Profile Summary</CardTitle>
        <CardDescription className="text-muted-foreground">
          Name, avatar, email, workspace role
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center gap-6">
        <Avatar className="h-20 w-20 rounded-lg border-2 border-border">
          <AvatarImage src={profile.avatar_url ?? undefined} alt={displayName} />
          <AvatarFallback className="bg-primary/20 text-primary text-2xl">
            {initials || <User className="h-10 w-10" />}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-1">
          <p className="font-medium text-foreground">{displayName}</p>
          <p className="text-sm text-muted-foreground">{profile.email}</p>
          <p className="text-xs capitalize text-muted-foreground">
            Workspace: {profile.workspace_role}
          </p>
        </div>
        <Button variant="outline" onClick={onEdit} className="transition-transform hover:scale-[1.02]">
          Edit Profile
        </Button>
      </CardContent>
    </Card>
  )
}

function EditProfileDialog({
  open,
  onOpenChange,
  profile,
  onSave,
  isSubmitting,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  profile: ProfileView
  onSave: (data: EditProfileForm) => void
  isSubmitting: boolean
}) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<EditProfileForm>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      full_name: profile.full_name ?? '',
      display_name: profile.display_name ?? '',
      timezone: profile.timezone,
      locale: profile.locale,
    },
  })

  const onSubmit = (data: EditProfileForm) => {
    onSave(data)
    onOpenChange(false)
  }

  const onOpen = (isOpen: boolean) => {
    if (isOpen) {
      reset({
        full_name: profile.full_name ?? '',
        display_name: profile.display_name ?? '',
        timezone: profile.timezone,
        locale: profile.locale,
      })
    }
    onOpenChange(isOpen)
  }

  return (
    <Dialog open={open} onOpenChange={onOpen}>
      <DialogContent showClose className="border-border bg-card">
        <DialogHeader>
          <DialogTitle className="text-foreground">Edit Profile</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Update your name, display name, timezone, and locale.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-full_name">Full name</Label>
              <Input
                id="edit-full_name"
                {...register('full_name')}
                className="border-border bg-background"
                placeholder="Full name"
              />
              {errors.full_name && (
                <p className="text-sm text-destructive">{errors.full_name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-display_name">Display name</Label>
              <Input
                id="edit-display_name"
                {...register('display_name')}
                className="border-border bg-background"
                placeholder="Display name"
              />
              {errors.display_name && (
                <p className="text-sm text-destructive">{errors.display_name.message}</p>
              )}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-timezone">Timezone</Label>
              <Input
                id="edit-timezone"
                {...register('timezone')}
                className="border-border bg-background"
                placeholder="e.g. America/New_York"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-locale">Locale</Label>
              <Input
                id="edit-locale"
                {...register('locale')}
                className="border-border bg-background"
                placeholder="e.g. en-US"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : 'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function PreferencesPanel({
  profile,
  onPreferenceChange,
  isSaving,
}: {
  profile: ProfileView
  onPreferenceChange: (updates: {
    assistant_tone?: AssistantTone
    verbosity?: Verbosity
    default_approval_level?: DefaultApprovalLevel
  }) => void
  isSaving: boolean
}) {
  return (
    <Card className="border-border bg-card transition-shadow duration-200 hover:shadow-card">
      <CardHeader>
        <CardTitle className="text-foreground">Preferences</CardTitle>
        <CardDescription className="text-muted-foreground">
          Assistant tone, verbosity, default approval level. Changes save automatically.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label className="text-foreground">Assistant tone</Label>
          <Select
            value={profile.assistant_tone}
            onValueChange={(v) => onPreferenceChange({ assistant_tone: v as AssistantTone })}
            disabled={isSaving}
          >
            <SelectTrigger className="border-border bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TONE_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-foreground">Verbosity</Label>
          <Select
            value={profile.verbosity}
            onValueChange={(v) => onPreferenceChange({ verbosity: v as Verbosity })}
            disabled={isSaving}
          >
            <SelectTrigger className="border-border bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {VERBOSITY_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-foreground">Default approval level</Label>
          <Select
            value={profile.default_approval_level}
            onValueChange={(v) =>
              onPreferenceChange({ default_approval_level: v as DefaultApprovalLevel })
            }
            disabled={isSaving}
          >
            <SelectTrigger className="border-border bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {APPROVAL_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}

function SecuritySection({
  profile,
  sessions,
  on2FAToggle,
  onRevokeOthers,
  is2FALoading,
  isRevokeLoading,
}: {
  profile: ProfileView
  sessions: { id: string; device?: string; is_current?: boolean }[]
  on2FAToggle: (enabled: boolean) => void
  onRevokeOthers: () => void
  is2FALoading: boolean
  isRevokeLoading: boolean
}) {
  return (
    <Card className="border-border bg-card transition-shadow duration-200 hover:shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Shield className="h-5 w-5 text-muted-foreground" />
          Security
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Two-factor authentication and session management
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-foreground">Two-factor authentication</p>
            <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
          </div>
          <Switch
            checked={profile.two_fa_enabled}
            onCheckedChange={on2FAToggle}
            disabled={is2FALoading}
            aria-label="Toggle two-factor authentication"
          />
        </div>
        <Separator className="bg-border" />
        <div>
          <p className="mb-2 font-medium text-foreground">Active sessions</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {sessions.map((s) => (
              <li key={s.id} className="flex items-center justify-between">
                <span>
                  {s.device ?? 'Session'}
                  {s.is_current && (
                    <span className="ml-2 text-xs text-primary">(current)</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
          <Button
            variant="outline"
            size="sm"
            className="mt-3 transition-transform hover:scale-[1.02]"
            onClick={onRevokeOthers}
            disabled={isRevokeLoading}
          >
            Revoke other sessions
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function DeleteAccountCard({ disabled }: { disabled?: boolean }) {
  const [open, setOpen] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const DELETE_CONFIRM = 'DELETE'

  const canDelete = confirmText === DELETE_CONFIRM

  const handleClose = () => {
    setConfirmText('')
    setOpen(false)
  }

  const handleDeleteRequest = () => {
    if (!canDelete) return
    toast.info('Account deletion must be completed with support. Contact support with your account email.')
    handleClose()
  }

  return (
    <Card className="border-border border-destructive/50 bg-card">
      <CardHeader>
        <CardTitle className="text-destructive">Delete Account</CardTitle>
        <CardDescription className="text-muted-foreground">
          Permanently delete your account and data. This action cannot be undone.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Dialog open={open} onOpenChange={setOpen}>
          <Button
            variant="destructive"
            onClick={() => setOpen(true)}
            disabled={disabled}
            className="transition-transform hover:scale-[1.02]"
          >
            Delete account
          </Button>
          <DialogContent showClose className="border-border bg-card">
            <DialogHeader>
              <DialogTitle className="text-destructive">Delete account?</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                This action cannot be undone. All your data will be permanently removed. Type{' '}
                <strong>DELETE</strong> below to confirm.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Label htmlFor="delete-confirm" className="text-foreground">
                Type DELETE to confirm
              </Label>
              <Input
                id="delete-confirm"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="DELETE"
                className="border-border bg-background font-mono"
                aria-label="Confirmation text"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button variant="destructive" disabled={!canDelete} onClick={handleDeleteRequest}>
                Delete my account
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}

export function Profile() {
  const navigate = useNavigate()
  const [editOpen, setEditOpen] = useState(false)
  const { data: profile, isLoading, error } = useProfileView()

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut()
    }
    localStorage.removeItem('auth_token')
    navigate('/login', { replace: true })
  }
  const updateProfileMutation = useUpdateProfile()
  const updatePreferencesMutation = useUpdatePreferences()
  const { data: sessions = [] } = useSessions()
  const revokeSessionsMutation = useRevokeOtherSessions()
  const set2FAMutation = useSetTwoFaEnabled()

  const handleSaveProfile = (data: EditProfileForm) => {
    if (!profile) return
    updateProfileMutation.mutate({
      userId: profile.id,
      updates: {
        full_name: data.full_name || null,
        display_name: data.display_name || null,
        timezone: data.timezone || undefined,
        locale: data.locale || undefined,
      },
    })
  }

  const handlePreferenceChange = (updates: {
    assistant_tone?: AssistantTone
    verbosity?: Verbosity
    default_approval_level?: DefaultApprovalLevel
  }) => {
    if (!profile) return
    updatePreferencesMutation.mutate({ userId: profile.id, updates })
  }

  const handle2FAToggle = (enabled: boolean) => {
    if (!profile) return
    set2FAMutation.mutate({ userId: profile.id, enabled })
  }

  if (isLoading) {
    return (
      <AnimatedPage>
        <div className="mx-auto max-w-3xl space-y-8">
          <div>
            <Skeleton className="mb-2 h-8 w-48 bg-card" />
            <Skeleton className="h-4 w-72 bg-card" />
          </div>
          <Skeleton className="h-40 rounded-lg bg-card" />
          <Skeleton className="h-64 rounded-lg bg-card" />
        </div>
      </AnimatedPage>
    )
  }

  if (error || !profile) {
    return (
      <AnimatedPage>
        <div className="mx-auto max-w-3xl space-y-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">User Profile</h1>
            <p className="text-muted-foreground">
              Account and personalization center
            </p>
          </div>
          <Card className="border-border bg-card">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <User className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="mb-2 font-medium text-foreground">Sign in to view your profile</p>
              <p className="mb-4 text-sm text-muted-foreground">
                Manage your account, preferences, and security settings.
              </p>
              <div className="flex gap-3">
                <Button asChild>
                  <Link to="/login">Log in</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/">Go home</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AnimatedPage>
    )
  }

  return (
    <AnimatedPage>
      <div className="mx-auto max-w-3xl space-y-8">
        <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">User Profile</h1>
            <p className="text-muted-foreground">
              Account and personalization center
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/help">
                <HelpCircle className="mr-2 h-4 w-4" />
                Help
              </Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </Button>
          </div>
        </header>

        <ProfileSummaryCard profile={profile} onEdit={() => setEditOpen(true)} />

        <EditProfileDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          profile={profile}
          onSave={handleSaveProfile}
          isSubmitting={updateProfileMutation.isPending}
        />

        <PreferencesPanel
          profile={profile}
          onPreferenceChange={handlePreferenceChange}
          isSaving={updatePreferencesMutation.isPending}
        />

        <SecuritySection
          profile={profile}
          sessions={sessions}
          on2FAToggle={handle2FAToggle}
          onRevokeOthers={() => revokeSessionsMutation.mutate()}
          is2FALoading={set2FAMutation.isPending}
          isRevokeLoading={revokeSessionsMutation.isPending}
        />

        <Card className="border-border bg-card transition-shadow duration-200 hover:shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Plug className="h-5 w-5 text-muted-foreground" />
              Connected Accounts
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Quick links to manage connectors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild className="transition-transform hover:scale-[1.02]">
              <Link to="/dashboard/settings">Manage connectors</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border bg-card transition-shadow duration-200 hover:shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              Billing & Plan
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Manage subscription and payment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild className="transition-transform hover:scale-[1.02]">
              <Link to="/checkout">View plan & billing</Link>
            </Button>
          </CardContent>
        </Card>

        <DeleteAccountCard disabled={updateProfileMutation.isPending} />
      </div>
    </AnimatedPage>
  )
}
