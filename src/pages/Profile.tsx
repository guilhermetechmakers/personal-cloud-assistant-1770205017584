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
import { AnimatedPage } from '@/components/layout/AnimatedPage'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { User, Shield, CreditCard, Plug } from 'lucide-react'
import { useState } from 'react'

const profileSchema = z.object({
  full_name: z.string().optional(),
  display_name: z.string().optional(),
  timezone: z.string().optional(),
  locale: z.string().optional(),
})

type ProfileForm = z.infer<typeof profileSchema>

export function Profile() {
  const [open, setOpen] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
  })

  const onSubmit = (data: ProfileForm) => {
    console.log(data)
  }

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
          <CardHeader>
            <CardTitle className="text-foreground">Profile Summary</CardTitle>
            <CardDescription className="text-muted-foreground">
              Name, avatar, email, workspace role
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src="" alt="User" />
              <AvatarFallback className="bg-primary/20 text-primary text-2xl">
                <User className="h-10 w-10" />
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-foreground">User Name</p>
              <p className="text-sm text-muted-foreground">user@example.com</p>
              <p className="text-xs text-muted-foreground">Workspace: Admin</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Edit Profile</CardTitle>
            <CardDescription className="text-muted-foreground">
              Name, display name, timezone, locale
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full name</Label>
                  <Input
                    id="full_name"
                    {...register('full_name')}
                    className="border-border bg-card"
                    placeholder="Full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="display_name">Display name</Label>
                  <Input
                    id="display_name"
                    {...register('display_name')}
                    className="border-border bg-card"
                    placeholder="Display name"
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Input
                    id="timezone"
                    {...register('timezone')}
                    className="border-border bg-card"
                    placeholder="e.g. America/New_York"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="locale">Locale</Label>
                  <Input
                    id="locale"
                    {...register('locale')}
                    className="border-border bg-card"
                    placeholder="e.g. en-US"
                  />
                </div>
              </div>
              <Button type="submit" disabled={isSubmitting}>
                Save changes
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Preferences</CardTitle>
            <CardDescription className="text-muted-foreground">
              Assistant tone, verbosity, default approval level
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">2FA</p>
                <p className="text-sm text-muted-foreground">Two-factor authentication</p>
              </div>
              <Switch />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <p className="font-medium text-foreground">Default approval level</p>
              <span className="text-sm text-muted-foreground">Requires approval</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Shield className="h-5 w-5" />
              Security
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Sessions list with revoke buttons
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Current session • This device
            </p>
            <Button variant="outline" size="sm" className="mt-2">
              Revoke other sessions
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Plug className="h-5 w-5" />
              Connected Accounts
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Quick links to manage connectors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/dashboard/settings">
              <Button variant="outline">Manage connectors</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <CreditCard className="h-5 w-5" />
              Billing & Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Link to="/checkout">
              <Button variant="outline">View plan & billing</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-border bg-card border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Delete Account</CardTitle>
            <CardDescription className="text-muted-foreground">
              Permanently delete your account and data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive">Delete account</Button>
              </DialogTrigger>
              <DialogContent showClose>
                <DialogHeader>
                  <DialogTitle>Delete account?</DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. All your data will be permanently removed.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="destructive">Delete</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    </AnimatedPage>
  )
}
