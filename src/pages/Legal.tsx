import { useEffect, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FileDown, ChevronRight, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { AnimatedPage } from '@/components/layout/AnimatedPage'
import { useLegalDocuments, useSubmitLegalInquiry } from '@/hooks/useLegal'
import { cn } from '@/lib/utils'
import type { LegalDocumentType } from '@/types/legal'

const legalSectionParam = ['privacy', 'terms', 'cookies'] as const
type LegalSection = (typeof legalSectionParam)[number]

const tabToType: Record<LegalSection, LegalDocumentType> = {
  privacy: 'privacy_policy',
  terms: 'terms_of_service',
  cookies: 'cookie_policy',
}


const inquirySchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  message: z.string().min(1, 'Please enter your message').max(2000, 'Message is too long'),
})

type InquiryFormValues = z.infer<typeof inquirySchema>

const staticPrivacyContent = (
  <div className="space-y-6">
    <section>
      <h2 className="text-lg font-semibold text-foreground">1. Information we collect</h2>
      <p className="text-muted-foreground">
        We collect information you provide when signing up, using our services, or contacting support.
      </p>
    </section>
    <section>
      <h2 className="text-lg font-semibold text-foreground">2. How we use it</h2>
      <p className="text-muted-foreground">
        We use your information to provide and improve our services, communicate with you, and ensure security.
      </p>
    </section>
    <section>
      <h2 className="text-lg font-semibold text-foreground">3. Data retention</h2>
      <p className="text-muted-foreground">
        We retain your data according to our retention policy and applicable law.
      </p>
    </section>
    <section>
      <h2 className="text-lg font-semibold text-foreground">4. Contact</h2>
      <p className="text-muted-foreground">
        For privacy inquiries, contact us at privacy@clawcloud.example.com.
      </p>
    </section>
  </div>
)

const staticTermsContent = (
  <div className="space-y-6">
    <section>
      <h2 className="text-lg font-semibold text-foreground">1. Acceptance</h2>
      <p className="text-muted-foreground">
        By using ClawCloud, you agree to these terms.
      </p>
    </section>
    <section>
      <h2 className="text-lg font-semibold text-foreground">2. Use of service</h2>
      <p className="text-muted-foreground">
        You agree to use the service in compliance with applicable laws and our policies.
      </p>
    </section>
    <section>
      <h2 className="text-lg font-semibold text-foreground">3. Contact</h2>
      <p className="text-muted-foreground">
        For legal inquiries, contact legal@clawcloud.example.com.
      </p>
    </section>
  </div>
)

const staticCookieContent = (
  <div className="space-y-6">
    <section>
      <h2 className="text-lg font-semibold text-foreground">1. What we use</h2>
      <p className="text-muted-foreground">
        We use cookies and similar technologies for authentication, preferences, and analytics.
      </p>
    </section>
    <section>
      <h2 className="text-lg font-semibold text-foreground">2. Your choices</h2>
      <p className="text-muted-foreground">
        You can manage cookie preferences in your browser or account settings.
      </p>
    </section>
    <section>
      <h2 className="text-lg font-semibold text-foreground">3. Contact</h2>
      <p className="text-muted-foreground">
        For cookie-related inquiries, contact privacy@clawcloud.example.com.
      </p>
    </section>
  </div>
)

const staticContentByType: Record<LegalDocumentType, React.ReactNode> = {
  privacy_policy: staticPrivacyContent,
  terms_of_service: staticTermsContent,
  cookie_policy: staticCookieContent,
}

export function Legal() {
  const [searchParams, setSearchParams] = useSearchParams()
  const sectionParam = searchParams.get('section')
  const activeTab: LegalSection =
    sectionParam && legalSectionParam.includes(sectionParam as LegalSection)
      ? (sectionParam as LegalSection)
      : 'privacy'

  const { data: documents = [], isLoading } = useLegalDocuments()
  const submitInquiry = useSubmitLegalInquiry()

  const docByType = useMemo(() => {
    const map: Partial<Record<LegalDocumentType, (typeof documents)[0]>> = {}
    for (const d of documents) map[d.type] = d
    return map
  }, [documents])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InquiryFormValues>({
    resolver: zodResolver(inquirySchema),
    defaultValues: { email: '', message: '' },
  })

  const onInquirySubmit = (values: InquiryFormValues) => {
    submitInquiry.mutate(
      { email: values.email, message: values.message },
      { onSuccess: () => reset() }
    )
  }

  useEffect(() => {
    if (!sectionParam || !legalSectionParam.includes(sectionParam as LegalSection)) return
    const tab = document.querySelector(`[data-state="active"][value="${sectionParam}"]`)
    tab?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [sectionParam])

  const setSection = (section: LegalSection) => {
    setSearchParams({ section }, { replace: true })
  }

  return (
    <AnimatedPage>
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card/50 px-4 py-4 md:px-6">
          <nav className="mx-auto flex max-w-5xl items-center gap-2 text-sm text-muted-foreground" aria-label="Breadcrumb">
            <Link to="/" className="transition-colors hover:text-foreground">Home</Link>
            <ChevronRight className="h-4 w-4 shrink-0" aria-hidden />
            <span className="text-foreground">Legal</span>
          </nav>
          <h1 className="mx-auto mt-2 max-w-5xl text-2xl font-bold text-foreground md:text-3xl">
            Privacy, Terms &amp; Cookie Policy
          </h1>
        </header>

        <main className="mx-auto max-w-5xl px-4 py-8 md:px-6">
          <Tabs
            value={activeTab}
            onValueChange={(v) => setSection(v as LegalSection)}
            className="w-full"
          >
            <TabsList className="mb-6 w-full justify-start gap-1 rounded-lg border border-border bg-card p-1 md:flex-nowrap">
              <TabsTrigger value="privacy" className="flex-1 md:flex-none">Privacy Policy</TabsTrigger>
              <TabsTrigger value="terms" className="flex-1 md:flex-none">Terms of Service</TabsTrigger>
              <TabsTrigger value="cookies" className="flex-1 md:flex-none">Cookie Policy</TabsTrigger>
            </TabsList>

            {(['privacy', 'terms', 'cookies'] as const).map((tab) => {
              const type = tabToType[tab]
              const doc = docByType[type]
              const lastUpdated = doc?.last_updated
                ? new Date(doc.last_updated).toLocaleDateString(undefined, { dateStyle: 'long' })
                : new Date().toLocaleDateString(undefined, { dateStyle: 'long' })
              const content = doc?.content
                ? <div className="prose prose-invert prose-sm max-w-none text-muted-foreground" dangerouslySetInnerHTML={{ __html: doc.content }} />
                : staticContentByType[type]
              const pdfLink = doc?.pdf_link ?? null

              return (
                <TabsContent key={tab} value={tab} className="mt-0 focus-visible:outline-none">
                  <Card className="border-border bg-card">
                    <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4 border-b border-border pb-4">
                      <div>
                        <CardTitle className="text-foreground">
                          {tab === 'privacy' && 'Privacy Policy'}
                          {tab === 'terms' && 'Terms of Service'}
                          {tab === 'cookies' && 'Cookie Policy'}
                        </CardTitle>
                        <p className="mt-1 text-sm text-muted-foreground">Last updated: {lastUpdated}</p>
                      </div>
                      {pdfLink ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="shrink-0 transition-transform hover:scale-[1.02]"
                          asChild
                        >
                          <a href={pdfLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2">
                            <FileDown className="h-4 w-4" aria-hidden />
                            Download PDF
                          </a>
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" className="shrink-0" disabled>
                          <FileDown className="h-4 w-4" aria-hidden />
                          PDF not available
                        </Button>
                      )}
                    </CardHeader>
                    <CardContent className="pt-6">
                      {isLoading && !doc ? (
                        <div className="h-48 animate-pulse rounded-lg bg-muted/50" aria-busy="true" />
                      ) : (
                        <ScrollArea className="h-[50vh] pr-4 md:h-auto md:max-h-none">
                          {content}
                        </ScrollArea>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              )
            })}
          </Tabs>

          <Card className="mt-10 border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Mail className="h-5 w-5 text-primary" aria-hidden />
                Contact for legal inquiries
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Questions about our policies or legal matters? Send us a message and we&apos;ll respond as soon as possible.
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onInquirySubmit)} className="space-y-4 max-w-xl">
                <div className="space-y-2">
                  <Label htmlFor="legal-inquiry-email">Email</Label>
                  <Input
                    id="legal-inquiry-email"
                    type="email"
                    placeholder="you@example.com"
                    className={cn(errors.email && 'border-destructive focus-visible:ring-destructive')}
                    {...register('email')}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive" role="alert">{errors.email.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="legal-inquiry-message">Message</Label>
                  <textarea
                    id="legal-inquiry-message"
                    rows={4}
                    placeholder="Your question or comment..."
                    className={cn(
                      'flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                      errors.message && 'border-destructive focus-visible:ring-destructive'
                    )}
                    {...register('message')}
                  />
                  {errors.message && (
                    <p className="text-sm text-destructive" role="alert">{errors.message.message}</p>
                  )}
                </div>
                <Button type="submit" disabled={isSubmitting || submitInquiry.isPending} className="transition-transform hover:scale-[1.02]">
                  {isSubmitting || submitInquiry.isPending ? 'Sending…' : 'Send inquiry'}
                </Button>
              </form>
              <p className="mt-4 text-sm text-muted-foreground">
                For urgent legal matters you can also email{' '}
                <a href="mailto:legal@clawcloud.example.com" className="text-primary underline hover:no-underline">
                  legal@clawcloud.example.com
                </a>.
              </p>
            </CardContent>
          </Card>
        </main>

        <footer className="mt-12 border-t border-border px-4 py-6 md:px-6">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4">
            <span className="text-sm text-muted-foreground">© ClawCloud</span>
            <div className="flex gap-6">
              <Link to="/legal?section=privacy" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Privacy</Link>
              <Link to="/legal?section=terms" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Terms</Link>
              <Link to="/legal?section=cookies" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Cookies</Link>
              <Link to="/" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Home</Link>
            </div>
          </div>
        </footer>
      </div>
    </AnimatedPage>
  )
}
