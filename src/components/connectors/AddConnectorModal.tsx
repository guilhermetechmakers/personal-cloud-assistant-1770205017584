/**
 * Add Connector Modal: guides user through OAuth flow initiation.
 * Lists available providers; Connect redirects to OAuth URL (or shows configure message).
 */

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Mail, Calendar, MessageSquare, Loader2 } from 'lucide-react'
import { useOAuthAuthorizeUrl } from '@/hooks/useConnectors'
import { cn } from '@/lib/utils'

const PROVIDERS: { id: string; name: string; icon: typeof Mail; description: string }[] = [
  { id: 'gmail', name: 'Gmail', icon: Mail, description: 'Email and send-as' },
  { id: 'google_calendar', name: 'Google Calendar', icon: Calendar, description: 'Events and availability' },
  { id: 'slack', name: 'Slack', icon: MessageSquare, description: 'Messages and channels' },
]

export interface AddConnectorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  alreadyConnected?: string[]
}

export function AddConnectorModal({
  open,
  onOpenChange,
  alreadyConnected = [],
}: AddConnectorModalProps) {
  const [connectingProvider, setConnectingProvider] = useState<string | null>(null)
  const oauthMutation = useOAuthAuthorizeUrl()

  const handleConnect = async (providerId: string) => {
    setConnectingProvider(providerId)
    try {
      const url = await oauthMutation.mutateAsync(providerId)
      if (url) {
        window.location.href = url
        return
      }
    } finally {
      setConnectingProvider(null)
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showClose
        className="border-border bg-card sm:max-w-md"
        aria-describedby="add-connector-description"
      >
        <DialogHeader>
          <DialogTitle className="text-foreground">Add integration</DialogTitle>
          <DialogDescription id="add-connector-description" className="text-muted-foreground">
            Connect a service to use with skills and automations. You’ll be redirected to sign in with the provider.
          </DialogDescription>
        </DialogHeader>
        <ul className="space-y-2" role="list">
          {PROVIDERS.map((provider) => {
            const isConnected = alreadyConnected.includes(provider.id)
            const Icon = provider.icon
            const isThisConnecting = connectingProvider === provider.id
            return (
              <li
                key={provider.id}
                className={cn(
                  'flex items-center justify-between gap-4 rounded-lg border border-border bg-background/50 p-3 transition-colors',
                  isConnected && 'opacity-75'
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <div>
                    <p className="font-medium text-foreground">{provider.name}</p>
                    <p className="text-sm text-muted-foreground">{provider.description}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  disabled={isConnected || !!connectingProvider}
                  onClick={() => handleConnect(provider.id)}
                  className="shrink-0 transition-transform hover:scale-[1.02] active:scale-[0.98]"
                  aria-label={isConnected ? `${provider.name} already connected` : `Connect ${provider.name}`}
                >
                  {isThisConnecting ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  ) : isConnected ? (
                    'Connected'
                  ) : (
                    'Connect'
                  )}
                </Button>
              </li>
            )
          })}
        </ul>
        <p className="text-xs text-muted-foreground">
          OAuth is configured via an Edge Function. If Connect does nothing, deploy the connector-oauth-url function.
        </p>
      </DialogContent>
    </Dialog>
  )
}
