import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AnimatedPage } from '@/components/layout/AnimatedPage'
import { SearchBar } from '@/components/search'
import { useSearch } from '@/hooks/useSearch'
import type { SearchParameters, SearchDomainType } from '@/types/search'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Search as SearchIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

const LIMIT = 20

export function Search() {
  const [searchParams] = useSearchParams()
  const queryFromUrl = searchParams.get('q') ?? ''
  const pageFromUrl = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1)

  const params: SearchParameters = useMemo(
    () => ({
      query: queryFromUrl || undefined,
      types: ['skill', 'run'] as SearchDomainType[],
      page: pageFromUrl,
      limit: LIMIT,
    }),
    [queryFromUrl, pageFromUrl]
  )

  const { data: results, isFetching } = useSearch(
    queryFromUrl ? params : null
  )

  const totalPages = results
    ? Math.max(1, Math.ceil(results.total / results.limit))
    : 1
  const currentPage = results?.page ?? 1
  const hasPrev = currentPage > 1
  const hasNext = currentPage < totalPages

  return (
    <AnimatedPage>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Search
          </h1>
          <p className="text-sm text-muted-foreground">
            Find skills, runs, and more. Use the search bar in the header for quick search, or refine below.
          </p>
        </div>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <SearchIcon className="h-5 w-5 text-primary" />
              Quick search
            </CardTitle>
            <CardDescription>
              The search bar in the top navbar supports filters, saved searches, and instant results.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SearchBar />
          </CardContent>
        </Card>

        {queryFromUrl && (
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Results for &quot;{queryFromUrl}&quot;</CardTitle>
              <CardDescription>
                Page {currentPage} of {totalPages} · {results?.total ?? 0} total
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isFetching ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-lg" />
                  ))}
                </div>
              ) : results && results.items.length > 0 ? (
                <>
                  <ul className="space-y-2">
                    {results.items.map((item) => (
                      <li key={`${item.type}-${item.id}`}>
                        <Link
                          to={item.href ?? '#'}
                          className={cn(
                            'flex flex-col gap-0.5 rounded-lg border border-border bg-card/50 p-4 transition-all duration-200 hover:bg-card hover:shadow-md'
                          )}
                        >
                          <span className="font-medium text-foreground">
                            {item.title}
                          </span>
                          {(item.subtitle || item.snippet) && (
                            <span className="text-sm text-muted-foreground">
                              {item.subtitle}
                              {item.subtitle && item.snippet ? ' · ' : ''}
                              {item.snippet}
                            </span>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      disabled={!hasPrev}
                    >
                      <Link
                        to={`/dashboard/search?q=${encodeURIComponent(queryFromUrl)}&page=${currentPage - 1}`}
                      >
                        <ChevronLeft className="mr-1 h-4 w-4" />
                        Previous
                      </Link>
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      disabled={!hasNext}
                    >
                      <Link
                        to={`/dashboard/search?q=${encodeURIComponent(queryFromUrl)}&page=${currentPage + 1}`}
                      >
                        Next
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-center">
                  <SearchIcon className="h-10 w-10 text-muted-foreground" />
                  <p className="mt-2 text-sm font-medium text-foreground">
                    No results
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Try a different query or adjust filters in the search bar.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {!queryFromUrl && (
          <Card className="border-border bg-card">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <SearchIcon className="h-10 w-10 text-muted-foreground" />
              <p className="mt-2 text-sm font-medium text-foreground">
                Search from the URL
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Visit /dashboard/search?q=your-query to see paginated results here, or use the search bar above.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AnimatedPage>
  )
}
