import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AnimatedPage } from '@/components/layout/AnimatedPage'
import { Search, Package, Plug } from 'lucide-react'

const mockPacks = [
  {
    id: 'inbox-zero',
    name: 'Inbox Zero Pack',
    description: 'Daily digest, top threads, draft replies. Requires Gmail.',
    requiredConnectors: ['Gmail', 'Google Calendar'],
  },
  {
    id: 'meeting-master',
    name: 'Meeting Master Pack',
    description: 'Schedule, reschedule, follow-ups. Requires Calendar.',
    requiredConnectors: ['Google Calendar', 'Slack'],
  },
  {
    id: 'travel-concierge',
    name: 'Travel Concierge',
    description: 'Bookings and itineraries with approval checkpoints.',
    requiredConnectors: ['Gmail'],
  },
]

export function SkillLibrary() {
  return (
    <AnimatedPage>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Skill Library</h1>
          <p className="text-muted-foreground">
            Browse and install curated Skill Packs
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search packs..."
              className="pl-9 border-border bg-card"
              aria-label="Search"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              Category
            </Button>
            <Button variant="outline" size="sm">
              Connector required
            </Button>
            <Button variant="outline" size="sm">
              Trust level
            </Button>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {mockPacks.map((pack) => (
            <Card key={pack.id} className="border-border bg-card transition-all hover:border-primary/30">
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-foreground">{pack.name}</CardTitle>
                <CardDescription className="text-muted-foreground">
                  {pack.description}
                </CardDescription>
                <div className="flex flex-wrap gap-1 pt-2">
                  {pack.requiredConnectors.map((c) => (
                    <span
                      key={c}
                      className="inline-flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                    >
                      <Plug className="h-3 w-3" />
                      {c}
                    </span>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="flex gap-2">
                <Link to={`/dashboard/skills/${pack.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    View details
                  </Button>
                </Link>
                <Link to={`/dashboard/skills/${pack.id}/install`}>
                  <Button size="sm">Install</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AnimatedPage>
  )
}
