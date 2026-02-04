import { Link, useLocation } from 'react-router-dom'
import {
  Inbox,
  Sparkles,
  Zap,
  Bot,
  Bell,
  Settings,
  User,
  ChevronDown,
  Database,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useState } from 'react'

const navItems = [
  { to: '/dashboard', label: 'Inbox', icon: Inbox },
  { to: '/dashboard/skills', label: 'Skills', icon: Sparkles },
  { to: '/dashboard/automations', label: 'Automations', icon: Zap },
  { to: '/dashboard/web-agent', label: 'Web Agent Runs', icon: Bot },
  { to: '/dashboard/notifications', label: 'Notifications', icon: Bell },
]

export function Sidebar() {
  const location = useLocation()
  const [workspaceOpen, setWorkspaceOpen] = useState(true)
  const [supportOpen, setSupportOpen] = useState(false)

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-[#18191C]">
      <div className="flex h-16 items-center border-b border-border px-6">
        <Link to="/dashboard" className="flex items-center gap-2 font-semibold text-foreground">
          <span className="text-accent">ClawCloud</span>
        </Link>
      </div>
      <ScrollArea className="h-[calc(100vh-4rem)] py-4">
        <div className="space-y-1 px-3">
          <button
            type="button"
            onClick={() => setWorkspaceOpen(!workspaceOpen)}
            className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-card hover:text-foreground"
          >
            <span>Workspace</span>
            <ChevronDown
              className={cn('h-4 w-4 transition-transform', workspaceOpen && 'rotate-180')}
            />
          </button>
          {workspaceOpen && (
            <div className="ml-2 space-y-0.5">
              {navItems.map((item) => {
                const isActive = location.pathname === item.to
                const Icon = item.icon
                return (
                  <Link key={item.to} to={item.to}>
                    <span
                      className={cn(
                        'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary/15 text-primary'
                          : 'text-muted-foreground hover:bg-card hover:text-foreground'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </span>
                  </Link>
                )
              })}
            </div>
          )}
          <button
            type="button"
            onClick={() => setSupportOpen(!supportOpen)}
            className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-card hover:text-foreground"
          >
            <span>Support</span>
            <ChevronDown
              className={cn('h-4 w-4 transition-transform', supportOpen && 'rotate-180')}
            />
          </button>
          {supportOpen && (
            <div className="ml-2 space-y-0.5">
              <Link to="/help">
                <span className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-card hover:text-foreground">
                  Help & Docs
                </span>
              </Link>
              <Link to="/dashboard/profile">
                <span
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-card hover:text-foreground',
                    location.pathname === '/dashboard/profile' && 'bg-primary/15 text-primary'
                  )}
                >
                  <User className="h-4 w-4" />
                  Profile
                </span>
              </Link>
            </div>
          )}
          <Link to="/dashboard/settings">
            <span
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-card hover:text-foreground',
                location.pathname === '/dashboard/settings' && 'bg-primary/15 text-primary'
              )}
            >
              <Settings className="h-4 w-4" />
              Settings
            </span>
          </Link>
          <Link to="/dashboard/data-management">
            <span
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-card hover:text-foreground',
                location.pathname === '/dashboard/data-management' && 'bg-primary/15 text-primary'
              )}
            >
              <Database className="h-4 w-4" />
              Data & Retention
            </span>
          </Link>
        </div>
      </ScrollArea>
    </aside>
  )
}
