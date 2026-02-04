import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Plug,
  Package,
  Sparkles,
  Bot,
  Shield,
} from 'lucide-react'
import { AnimatedPage } from '@/components/layout/AnimatedPage'
import { cn } from '@/lib/utils'

const features = [
  {
    title: 'Connectors',
    description: 'Connect Gmail, Calendar, Slack, and more with OAuth.',
    icon: Plug,
  },
  {
    title: 'Skill Packs',
    description: 'Curated packs: Inbox Zero, Meeting Master, Travel Concierge.',
    icon: Package,
  },
  {
    title: 'Skill Studio',
    description: 'No-code builder with blocks and templates.',
    icon: Sparkles,
  },
  {
    title: 'Web Agent',
    description: 'Browser automation with approval checkpoints.',
    icon: Bot,
  },
  {
    title: 'Trust & Controls',
    description: 'Draft defaults, approvals, immutable audit trails.',
    icon: Shield,
  },
]

const packs = [
  { name: 'Inbox Zero', desc: 'Daily digest, top threads, draft replies' },
  { name: 'Meeting Master', desc: 'Schedule, reschedule, follow-ups' },
  { name: 'Travel Concierge', desc: 'Bookings and itineraries' },
]

export function Landing() {
  return (
    <AnimatedPage>
      <div className="min-h-screen bg-background">
        <nav className="flex h-16 items-center justify-between border-b border-border px-6">
          <span className="text-xl font-bold text-primary">ClawCloud</span>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost">Log in</Button>
            </Link>
            <Link to="/signup">
              <Button>Sign up</Button>
            </Link>
            <Link to="/demo">
              <Button variant="outline">Book demo</Button>
            </Link>
          </div>
        </nav>

        <section className="px-6 py-24 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
            AI-driven assistants for email, calendar, and bookings
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Connect your cloud accounts, install Skill Packs, and run safe, auditable assistants. Draft-first and approval checkpoints by default.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link to="/signup">
              <Button size="lg" className="min-w-[140px]">
                Sign up
              </Button>
            </Link>
            <Link to="/demo">
              <Button size="lg" variant="outline" className="min-w-[140px]">
                Book demo
              </Button>
            </Link>
          </div>
        </section>

        <section className="border-t border-border px-6 py-16">
          <h2 className="mb-12 text-center text-2xl font-semibold text-foreground">
            Features
          </h2>
          <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => {
              const Icon = f.icon
              return (
                <div
                  key={f.title}
                  className={cn(
                    'rounded-lg border border-border bg-card p-6 transition-all hover:border-primary/30',
                    'animate-fade-in-up'
                  )}
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className="mb-4 rounded-lg bg-primary/10 p-3 w-fit">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {f.description}
                  </p>
                </div>
              )
            })}
          </div>
        </section>

        <section className="border-t border-border px-6 py-16">
          <h2 className="mb-12 text-center text-2xl font-semibold text-foreground">
            Hero Packs
          </h2>
          <div className="mx-auto flex max-w-4xl flex-wrap justify-center gap-6">
            {packs.map((p) => (
              <div
                key={p.name}
                className="w-64 rounded-lg border border-border bg-card p-6 transition-all hover:border-primary/30"
              >
                <h3 className="font-semibold text-foreground">{p.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-border px-6 py-16">
          <h2 className="mb-8 text-center text-2xl font-semibold text-foreground">
            Pricing
          </h2>
          <div className="mx-auto flex max-w-3xl justify-center gap-8">
            <div className="rounded-lg border border-border bg-card px-8 py-6 text-center">
              <p className="font-semibold text-foreground">Free</p>
              <p className="mt-2 text-muted-foreground">Get started</p>
            </div>
            <div className="rounded-lg border border-primary/50 bg-card px-8 py-6 text-center">
              <p className="font-semibold text-primary">Pro</p>
              <p className="mt-2 text-muted-foreground">For professionals</p>
            </div>
            <div className="rounded-lg border border-border bg-card px-8 py-6 text-center">
              <p className="font-semibold text-foreground">Teams</p>
              <p className="mt-2 text-muted-foreground">For teams</p>
            </div>
          </div>
        </section>

        <footer className="border-t border-border px-6 py-8">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4">
            <span className="text-sm text-muted-foreground">© ClawCloud</span>
            <div className="flex gap-6">
              <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
                Privacy
              </Link>
              <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground">
                Terms
              </Link>
              <Link to="/cookies" className="text-sm text-muted-foreground hover:text-foreground">
                Cookies
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </AnimatedPage>
  )
}
