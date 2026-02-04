/**
 * Edit Connector Form: update scopes or re-authenticate.
 * Used in details panel or modal for a single connector.
 */

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { RefreshCw, Loader2 } from 'lucide-react'
import { useUpdateConnector, useOAuthAuthorizeUrl } from '@/hooks/useConnectors'
import type { Connector } from '@/types/connector'

const editConnectorSchema = z.object({
  scopes: z.string().min(0).optional(),
})

type EditConnectorFormValues = z.infer<typeof editConnectorSchema>

export interface EditConnectorFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  connector: Connector
  onSuccess?: () => void
}

export function EditConnectorForm({
  open,
  onOpenChange,
  connector,
  onSuccess,
}: EditConnectorFormProps) {
  const updateMutation = useUpdateConnector()
  const oauthMutation = useOAuthAuthorizeUrl()

  const form = useForm<EditConnectorFormValues>({
    resolver: zodResolver(editConnectorSchema),
    defaultValues: {
      scopes: Array.isArray(connector.scopes) ? connector.scopes.join(', ') : '',
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        scopes: Array.isArray(connector.scopes) ? connector.scopes.join(', ') : '',
      })
    }
  }, [open, connector.id, connector.scopes, form])

  const handleSave = form.handleSubmit((values) => {
    const scopes = values.scopes
      ? values.scopes.split(',').map((s) => s.trim()).filter(Boolean)
      : []
    updateMutation.mutate(
      { id: connector.id, updates: { scopes } },
      {
        onSuccess: () => {
          form.reset({ scopes: scopes.join(', ') })
          onOpenChange(false)
          onSuccess?.()
        },
      }
    )
  })

  const handleReauth = () => {
    oauthMutation.mutate(connector.provider, {
      onSuccess: (url) => {
        if (url) window.location.href = url
      },
    })
  }

  const isPending = updateMutation.isPending || oauthMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showClose
        className="border-border bg-card sm:max-w-md"
        aria-describedby="edit-connector-description"
      >
        <DialogHeader>
          <DialogTitle className="text-foreground">Edit {connector.provider}</DialogTitle>
          <DialogDescription id="edit-connector-description" className="text-muted-foreground">
            Update scopes or re-authenticate to refresh the connection.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-connector-scopes" className="text-foreground">
              Scopes (comma-separated)
            </Label>
            <Input
              id="edit-connector-scopes"
              type="text"
              placeholder="e.g. read, write"
              className="border-border bg-background"
              {...form.register('scopes')}
            />
            {form.formState.errors.scopes && (
              <p className="text-sm text-destructive" role="alert">
                {form.formState.errors.scopes.message}
              </p>
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isPending}
              onClick={handleReauth}
              className="inline-flex items-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {oauthMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <RefreshCw className="h-4 w-4" aria-hidden />
              )}
              Re-authenticate
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isPending}
              className="transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {updateMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                'Save'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
