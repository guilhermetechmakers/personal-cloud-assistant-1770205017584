import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  Plug,
  Package,
  Sparkles,
  Bot,
  Shield,
  Mail,
  Calendar,
  Briefcase,
  Quote,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AnimatedPage } from '@/components/layout/AnimatedPage'
import { FeatureDetailModal, BookDemoModal } from '@/components/landing'
import { cn } from '@/lib/utils'

const SECTION_IDS = {
  features: 'features',
  packs: 'packs',
  testimonials: 'testimonials',
  pricing: 'pricing',
  contact: 'contact',
} as const

const features = [
  {
    id: 'connectors',
    title: 'Connectors',
    description:
      'Connect Gmail, Google Calendar, Slack, and more via secure OAuth. Tokens are encrypted and never logged. Background refresh and health checks keep integrations reliable.',
    icon: Plug,
    linkToDetails: '/dashboard/settings',
  },
  {
    id: 'skill-packs',
    title: 'Skill Packs',
    description:
      'Curated packs like Inbox Zero, Meeting Master, and Travel Concierge. Install with one click after connector preflight. Audit trail for every install and uninstall.',
    icon: Package,
    linkToDetails: '/dashboard/skills',
  },
  {
    id: 'skill-studio',
    title: 'Skill Studio',
    description:
      'No-code builder with drag-and-drop blocks: Fetch, Transform, Search, WebAgent, CreateOutput, Deliver, Guard. Test on sample input and publish with draft-only defaults.',
    icon: Sparkles,
    linkToDetails: '/dashboard/skills/studio',
  },
  {
    id: 'web-agent',
    title: 'Web Agent',
    description:
      'Browser automation with approval checkpoints. Ephemeral or persistent encrypted profiles. Timeline with screenshots and logs; runs pause at irreversible steps until you approve.',
    icon: Bot,
    linkToDetails: '/dashboard/web-agent',
  },
  {
    id: 'trust-controls',
    title: 'Trust & Controls',
    description:
      'Draft defaults, approvals, and immutable audit trails. Workspace policies for default action levels and connector whitelists. You stay in control.',
    icon: Shield,
    linkToDetails: '/dashboard/settings',
  },
]

const packs = [
  {
    name: 'Inbox Zero',
    description: 'Daily digest, top threads, draft replies',
    icon: Mail,
  },
  {
    name: 'Meeting Master',
    description: 'Schedule, reschedule, follow-ups',
    icon: Calendar,
  },
  {
    name: 'Travel Concierge',
    description: 'Bookings and itineraries',
    icon: Briefcase,
  },
]

const testimonials = [
  {
    quote:
      'ClawCloud cut my email triage time in half. The daily digest and draft replies are exactly what I needed.',
    author: 'Sarah K.',
    role: 'Founder',
  },
  {
    quote:
      'Meeting Master keeps our calendar sane. Proposals and follow-ups happen without me chasing people.',
    author: 'James L.',
    role: 'Operations Lead',
  },
  {
    quote:
      'Trust-by-default won us over. We see every approval and can roll back when needed.',
    author: 'Priya M.',
    role: 'Team Admin',
  },
]

const pricingTiers = [
  { name: 'Free', subtitle: 'Get started', price: null, href: '/signup', featured: false },
  { name: 'Pro', subtitle: 'For professionals', price: 'Coming soon', href: '/checkout', featured: true },
  { name: 'Teams', subtitle: 'For teams', price: 'Contact us', href: '/help', featured: false },
]

function scrollToSection(id: string) {
  const el = document.getElementById(id)
  el?.scrollIntoView({ behavior: 'smooth' })
}

export function Landing() {
  const [featureModal, setFeatureModal] = useState<{
    title: string
    description: string
    icon: typeof Plug
    linkToDetails: string | null
  } | null>(null)
  const [bookDemoOpen, setBookDemoOpen] = useState(false)

  const openFeatureModal = useCallback(
    (f: (typeof features)[number]) => {
      setFeatureModal({
        title: f.title,
        description: f.description,
        icon: f.icon,
        linkToDetails: f.linkToDetails ?? null,
      })
    },
    []
  )

  return (
    <AnimatedPage>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link
              to="/"
              className="text-xl font-bold text-foreground transition-opacity hover:opacity-90"
            >
              ClawCloud
            </Link>
            <div className="flex items-center gap-1 sm:gap-4">
              <button
                type="button"
                onClick={() => scrollToSection(SECTION_IDS.features)}
                className="hidden rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-card hover:text-foreground sm:block"
              >
                Features
              </button>
              <button
                type="button"
                onClick={() => scrollToSection(SECTION_IDS.pricing)}
                className="hidden rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-card hover:text-foreground sm:block"
              >
                Pricing
              </button>
              <Link
                to="/help"
                className="hidden rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-card hover:text-foreground sm:block"
              >
                About
              </Link>
              <Link
                to="/help"
                className="hidden rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-card hover:text-foreground sm:block"
              >
                Contact
              </Link>
              <Link to="/login">
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  Log in
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="sm" variant="outline" className="hidden sm:inline-flex">
                  Sign up
                </Button>
              </Link>
              <Button
                size="sm"
                className="hidden sm:inline-flex"
                onClick={() => setBookDemoOpen(true)}
              >
                Book demo
              </Button>
            </div>
          </nav>
        </header>

        {/* Hero */}
        <section className="relative overflow-hidden px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
          {/* Animated gradient blobs */}
          <div
            className="pointer-events-none absolute inset-0 overflow-hidden"
            aria-hidden
          >
            <div
              className="absolute -left-1/4 top-1/4 h-[400px] w-[400px] rounded-full bg-primary/20 opacity-60 blur-3xl animate-blob"
              style={{ animationDelay: '0ms' }}
            />
            <div
              className="absolute right-0 top-0 h-[300px] w-[300px] rounded-full bg-primary/15 opacity-50 blur-3xl animate-blob"
              style={{ animationDelay: '2000ms' }}
            />
            <div
              className="absolute bottom-0 left-1/2 h-[350px] w-[350px] -translate-x-1/2 rounded-full bg-primary/10 opacity-40 blur-3xl animate-blob"
              style={{ animationDelay: '4000ms' }}
            />
          </div>
          <div className="relative mx-auto max-w-4xl text-center">
            <h1
              className="animate-fade-in-up text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl"
              style={{ animationFillMode: 'backwards', animationDelay: '100ms' }}
            >
              AI-driven assistants for email, calendar, and bookings
            </h1>
            <p
              className="mx-auto mt-6 max-w-2xl animate-fade-in-up text-lg text-muted-foreground"
              style={{ animationFillMode: 'backwards', animationDelay: '200ms' }}
            >
              Connect your cloud accounts, install Skill Packs, and run safe, auditable
              assistants. Draft-first and approval checkpoints by default.
            </p>
            <div
              className="mt-10 flex flex-col items-center justify-center gap-4 animate-fade-in-up sm:flex-row"
              style={{ animationFillMode: 'backwards', animationDelay: '300ms' }}
            >
              <Link to="/signup">
                <Button
                  size="lg"
                  className="min-w-[160px] transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
                >
                  Sign up
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="min-w-[160px] transition-all duration-200 hover:scale-[1.02] hover:border-primary/50 hover:bg-primary/5 active:scale-[0.98]"
                onClick={() => setBookDemoOpen(true)}
              >
                Book demo
              </Button>
            </div>
          </div>
        </section>

        {/* Feature cards */}
        <section
          id={SECTION_IDS.features}
          className="scroll-mt-20 border-t border-border px-4 py-16 sm:px-6 lg:px-8"
        >
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-12 text-center text-2xl font-semibold text-foreground sm:text-3xl">
              Features
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f, i) => {
                const Icon = f.icon
                return (
                  <button
                    type="button"
                    key={f.id}
                    onClick={() => openFeatureModal(f)}
                    className={cn(
                      'group relative rounded-lg border border-border bg-card p-6 text-left transition-all duration-200',
                      'hover:scale-[1.02] hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5',
                      'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background',
                      'animate-fade-in-up'
                    )}
                    style={{
                      animationFillMode: 'backwards',
                      animationDelay: `${100 + i * 80}ms`,
                    }}
                  >
                    <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3 transition-colors group-hover:bg-primary/20">
                      <Icon className="h-6 w-6 text-primary" aria-hidden />
                    </div>
                    <h3 className="font-semibold text-foreground">{f.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                      {f.description}
                    </p>
                    <span className="mt-3 inline-block text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                      Learn more →
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </section>

        {/* Packs showcase (bento-style) */}
        <section
          id={SECTION_IDS.packs}
          className="scroll-mt-20 border-t border-border px-4 py-16 sm:px-6 lg:px-8"
        >
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-12 text-center text-2xl font-semibold text-foreground sm:text-3xl">
              Hero Packs
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {packs.map((p, i) => {
                const Icon = p.icon
                return (
                  <div
                    key={p.name}
                    className={cn(
                      'rounded-lg border border-border bg-card p-6 transition-all duration-200',
                      'hover:scale-[1.02] hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5',
                      'animate-fade-in-up'
                    )}
                    style={{
                      animationFillMode: 'backwards',
                      animationDelay: `${150 + i * 100}ms`,
                    }}
                  >
                    <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
                      <Icon className="h-6 w-6 text-primary" aria-hidden />
                    </div>
                    <h3 className="font-semibold text-foreground">{p.name}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{p.description}</p>
                    <Link
                      to="/dashboard/skills"
                      className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
                    >
                      Browse packs →
                    </Link>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Testimonials / trust */}
        <section
          id={SECTION_IDS.testimonials}
          className="scroll-mt-20 border-t border-border px-4 py-16 sm:px-6 lg:px-8"
        >
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-12 text-center text-2xl font-semibold text-foreground sm:text-3xl">
              Trusted by busy professionals
            </h2>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((t, i) => (
                <div
                  key={t.author}
                  className={cn(
                    'rounded-lg border border-border bg-card p-6 animate-fade-in-up'
                  )}
                  style={{
                    animationFillMode: 'backwards',
                    animationDelay: `${200 + i * 100}ms`,
                  }}
                >
                  <Quote className="h-8 w-8 text-primary/40" aria-hidden />
                  <p className="mt-3 text-muted-foreground">&ldquo;{t.quote}&rdquo;</p>
                  <p className="mt-4 font-medium text-foreground">{t.author}</p>
                  <p className="text-sm text-muted-foreground">{t.role}</p>
                </div>
              ))}
            </div>
            <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-muted-foreground">
              <span className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-success" aria-hidden />
                Draft-only by default
              </span>
              <span className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-success" aria-hidden />
                Approval checkpoints
              </span>
              <span className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-success" aria-hidden />
                Immutable audit trails
              </span>
            </div>
          </div>
        </section>

        {/* Pricing teaser */}
        <section
          id={SECTION_IDS.pricing}
          className="scroll-mt-20 border-t border-border px-4 py-16 sm:px-6 lg:px-8"
        >
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-12 text-center text-2xl font-semibold text-foreground sm:text-3xl">
              Pricing
            </h2>
            <div className="grid gap-6 sm:grid-cols-3">
              {pricingTiers.map((tier, i) => (
                <Link
                  key={tier.name}
                  to={tier.href}
                  className={cn(
                    'rounded-lg border p-6 text-center transition-all duration-200',
                    'hover:scale-[1.02] hover:shadow-lg',
                    tier.featured
                      ? 'border-primary/50 bg-primary/5 hover:border-primary/70'
                      : 'border-border bg-card hover:border-primary/30'
                  )}
                  style={{
                    animationFillMode: 'backwards',
                    animationDelay: `${250 + i * 80}ms`,
                  }}
                >
                  <p
                    className={cn(
                      'font-semibold',
                      tier.featured ? 'text-primary' : 'text-foreground'
                    )}
                  >
                    {tier.name}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">{tier.subtitle}</p>
                  {tier.price && (
                    <p className="mt-3 text-sm font-medium text-foreground">{tier.price}</p>
                  )}
                  <span
                    className={cn(
                      'mt-4 inline-block text-sm font-medium',
                      tier.featured ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {tier.name === 'Free' ? 'Get started' : 'Learn more'} →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer
          id={SECTION_IDS.contact}
          className="scroll-mt-20 border-t border-border px-4 py-8 sm:px-6 lg:px-8"
        >
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4">
            <span className="text-sm text-muted-foreground">© ClawCloud</span>
            <div className="flex flex-wrap gap-6">
              <Link
                to="/help"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                About
              </Link>
              <Link
                to="/help"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Help
              </Link>
              <Link
                to="/legal?section=privacy"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Privacy
              </Link>
              <Link
                to="/legal?section=terms"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Terms
              </Link>
            </div>
          </div>
        </footer>
      </div>

      {/* Modals */}
      {featureModal && (
        <FeatureDetailModal
          open={!!featureModal}
          onOpenChange={(open) => !open && setFeatureModal(null)}
          title={featureModal.title}
          description={featureModal.description}
          icon={featureModal.icon}
          linkToDetails={featureModal.linkToDetails}
        />
      )}
      <BookDemoModal open={bookDemoOpen} onOpenChange={setBookDemoOpen} />
    </AnimatedPage>
  )
}
