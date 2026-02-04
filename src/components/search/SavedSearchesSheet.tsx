import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useSavedSearchesList, useDeleteSavedSearch } from '@/hooks/useSearch'
import type { UserSearch } from '@/types/search'
import { Search, Pencil, Trash2, Loader2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export interface SavedSearchesSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectSearch: (params: UserSearch['search_parameters']) => void
  onEditSearch?: (search: UserSearch) => void
}

export function SavedSearchesSheet({
  open,
  onOpenChange,
  onSelectSearch,
  onEditSearch,
}: SavedSearchesSheetProps) {
  const { data: saved = [], isLoading } = useSavedSearchesList()
  const deleteSearch = useDeleteSavedSearch()

  const handleApply = (s: UserSearch) => {
    onSelectSearch(s.search_parameters)
    onOpenChange(false)
  }

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    deleteSearch.mutate(id)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Saved searches</SheetTitle>
          <SheetDescription>
            Select a saved search to apply its filters, or manage your list.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="mt-6 h-[calc(100vh-12rem)]">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : saved.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card/50 py-12 text-center">
              <Search className="h-10 w-10 text-muted-foreground" aria-hidden />
              <p className="mt-2 text-sm font-medium text-foreground">No saved searches</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Save a search from the search bar to see it here.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {saved.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-border bg-card p-3 transition-all duration-200 hover:bg-card/90"
                >
                  <button
                    type="button"
                    className="min-w-0 flex-1 text-left"
                    onClick={() => handleApply(s)}
                  >
                    <p className="truncate text-sm font-medium text-foreground">
                      {s.search_name}
                    </p>
                    {s.description && (
                      <p className="truncate text-xs text-muted-foreground">
                        {s.description}
                      </p>
                    )}
                  </button>
                  <div className="flex items-center gap-1">
                    {onEditSearch && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation()
                          onEditSearch(s)
                          onOpenChange(false)
                        }}
                        aria-label="Edit saved search"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={(e) => handleDelete(e, s.id)}
                      disabled={deleteSearch.isPending}
                      aria-label="Delete saved search"
                    >
                      {deleteSearch.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
