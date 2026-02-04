import { useState, useCallback, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, SlidersHorizontal, Bookmark, Save } from 'lucide-react'
import { useSearch, useSavedSearchesList } from '@/hooks/useSearch'
import type { SearchParameters, SearchResultItem, SearchDomainType } from '@/types/search'
import { SaveSearchModal } from './SaveSearchModal'
import { FilterDialog } from './FilterDialog'
import type { FilterFormValues } from './FilterDialog'
import { SavedSearchesSheet } from './SavedSearchesSheet'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

const RECENT_KEY = 'clawcloud_recent_searches'
const RECENT_MAX = 5

function getRecentSearches(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as string[]
    return Array.isArray(parsed) ? parsed.slice(0, RECENT_MAX) : []
  } catch {
    return []
  }
}

function addRecentSearch(query: string) {
  if (!query.trim()) return
  const recent = getRecentSearches().filter((q) => q !== query)
  recent.unshift(query)
  localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, RECENT_MAX)))
}

export function SearchBar() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<Pick<FilterFormValues, 'types' | 'dateFrom' | 'dateTo' | 'status'>>({
    types: ['skill', 'run'],
    dateFrom: '',
    dateTo: '',
    status: '',
  })
  const [filterDialogOpen, setFilterDialogOpen] = useState(false)
  const [savedSheetOpen, setSavedSheetOpen] = useState(false)
  const [saveModalOpen, setSaveModalOpen] = useState(false)

  const searchParams: SearchParameters = useMemo(
    () => ({
      query: query.trim() || undefined,
      types: filters.types,
      dateFrom: filters.dateFrom || undefined,
      dateTo: filters.dateTo || undefined,
      status: filters.status || undefined,
      page: 1,
      limit: 20,
    }),
    [query, filters]
  )

  const { data: results, isFetching } = useSearch(
    open ? searchParams : null
  )
  const { data: savedList = [] } = useSavedSearchesList()

  const handleApplyFilters = useCallback((values: FilterFormValues) => {
    setFilters({
      types: values.types,
      dateFrom: values.dateFrom ?? '',
      dateTo: values.dateTo ?? '',
      status: values.status ?? '',
    })
  }, [])

  const handleSelectSavedSearch = useCallback(
    (params: SearchParameters) => {
      setQuery((params.query as string) ?? '')
      setFilters({
        types: (params.types as SearchDomainType[]) ?? ['skill', 'run'],
        dateFrom: (params.dateFrom as string) ?? '',
        dateTo: (params.dateTo as string) ?? '',
        status: (params.status as string) ?? '',
      })
    },
    []
  )

  const handleSelectResult = useCallback(
    (item: SearchResultItem) => {
      if (query.trim()) addRecentSearch(query.trim())
      setOpen(false)
      setQuery('')
      if (item.href) navigate(item.href)
    },
    [query, navigate]
  )

  const currentParamsForSave: SearchParameters = useMemo(
    () => ({
      ...searchParams,
      query: query.trim() || undefined,
    }),
    [searchParams, query]
  )

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search skills, runs..."
              className="pl-9 pr-4"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setOpen(true)}
              aria-label="Search"
              aria-expanded={open}
            />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[20rem] max-w-md p-0"
          sideOffset={8}
        >
          <div className="flex flex-col gap-1 border-b border-border p-2">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5"
                onClick={() => {
                  setFilterDialogOpen(true)
                }}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5"
                onClick={() => setSavedSheetOpen(true)}
              >
                <Bookmark className="h-4 w-4" />
                Saved ({savedList.length})
              </Button>
              {(query.trim() || filters.types.length > 0) && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => setSaveModalOpen(true)}
                >
                  <Save className="h-4 w-4" />
                  Save search
                </Button>
              )}
            </div>
          </div>
          <ScrollArea className="max-h-[min(20rem,60vh)]">
            {isFetching && (!results || results.items.length === 0) ? (
              <div className="space-y-2 p-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-lg" />
                ))}
              </div>
            ) : results && results.items.length > 0 ? (
              <>
                <ul className="p-2">
                  {results.items.map((item) => (
                  <li key={`${item.type}-${item.id}`}>
                    <button
                      type="button"
                      className={cn(
                        'flex w-full flex-col gap-0.5 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-accent/10 focus:bg-accent/10 focus:outline-none'
                      )}
                      onClick={() => handleSelectResult(item)}
                    >
                      <span className="font-medium text-foreground">{item.title}</span>
                      {(item.subtitle || item.snippet) && (
                        <span className="truncate text-xs text-muted-foreground">
                          {item.subtitle}
                          {item.subtitle && item.snippet ? ' · ' : ''}
                          {item.snippet}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
                </ul>
                {results.total > results.items.length && (
                  <div className="border-t border-border p-2">
                    <Link
                      to={`/dashboard/search?q=${encodeURIComponent(query.trim())}&page=1`}
                      className="block rounded-md px-3 py-2 text-center text-sm font-medium text-primary hover:bg-primary/10"
                      onClick={() => setOpen(false)}
                    >
                      View all {results.total} results
                    </Link>
                  </div>
                )}
              </>
            ) : open && (query.trim() || filters.types.length > 0) ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No results. Try different keywords or filters.
              </div>
            ) : (
              <div className="py-4 text-center text-sm text-muted-foreground">
                Type to search skills and runs, or open Saved searches.
              </div>
            )}
          </ScrollArea>
        </DropdownMenuContent>
      </DropdownMenu>

      <FilterDialog
        open={filterDialogOpen}
        onOpenChange={setFilterDialogOpen}
        initialValues={filters}
        onApply={handleApplyFilters}
      />
      <SavedSearchesSheet
        open={savedSheetOpen}
        onOpenChange={setSavedSheetOpen}
        onSelectSearch={handleSelectSavedSearch}
      />
      <SaveSearchModal
        open={saveModalOpen}
        onOpenChange={setSaveModalOpen}
        searchParameters={currentParamsForSave}
      />
    </>
  )
}
