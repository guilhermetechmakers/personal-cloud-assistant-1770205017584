import { Link, useNavigate } from 'react-router-dom'
import { Plus, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { NotificationCenter } from '@/components/notifications'
import { SearchBar } from '@/components/search'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/hooks/useAuth'
import { signOut } from '@/lib/auth'

export function Navbar() {
  const navigate = useNavigate()
  const { user, isLoading } = useAuth()
  const email = user?.email ?? ''
  const displayName = ((user?.user_metadata?.full_name ?? user?.user_metadata?.name) ?? email) || 'Account'
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined
  const initials = displayName
    .split(/\s+/)
    .map((s: string) => s[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?'

  const handleLogout = async () => {
    await signOut()
    navigate('/', { replace: true })
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background px-6">
      <div className="flex flex-1 items-center gap-4">
        <SearchBar />
      </div>
      <div className="flex items-center gap-2">
        <NotificationCenter />
        <Button asChild size="sm">
          <Link to="/dashboard/skills/studio">
            <Plus className="mr-2 h-4 w-4" />
            New Skill
          </Link>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full" disabled={isLoading}>
              <Avatar className="h-9 w-9">
                <AvatarImage src={avatarUrl} alt={displayName} />
                <AvatarFallback className="bg-primary/20 text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">Account</p>
                <p className="text-xs text-muted-foreground truncate">{email || 'Signed in'}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/dashboard/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/dashboard/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
