import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCreateSavedSearch } from '@/hooks/useSearch'
import type { SearchParameters } from '@/types/search'

const schema = z.object({
  search_name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
})

type FormValues = z.infer<typeof schema>

export interface SaveSearchModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  searchParameters: SearchParameters
  onSaved?: () => void
}

export function SaveSearchModal({
  open,
  onOpenChange,
  searchParameters,
  onSaved,
}: SaveSearchModalProps) {
  const createSearch = useCreateSavedSearch()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { search_name: '', description: '' },
  })

  const onSubmit = form.handleSubmit((values) => {
    createSearch.mutate(
      {
        search_name: values.search_name.trim(),
        description: values.description?.trim() || null,
        search_parameters: searchParameters,
      },
      {
        onSuccess: () => {
          form.reset()
          onOpenChange(false)
          onSaved?.()
        },
      }
    )
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Save search</DialogTitle>
          <DialogDescription>
            Save your current query and filters to reuse later.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="search_name">Name</Label>
            <Input
              id="search_name"
              placeholder="e.g. My skills"
              {...form.register('search_name')}
              aria-invalid={!!form.formState.errors.search_name}
              className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
            />
            {form.formState.errors.search_name && (
              <p className="text-sm text-destructive">
                {form.formState.errors.search_name.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Input
              id="description"
              placeholder="Short description"
              {...form.register('description')}
              className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createSearch.isPending}>
              {createSearch.isPending ? 'Saving…' : 'Save search'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
