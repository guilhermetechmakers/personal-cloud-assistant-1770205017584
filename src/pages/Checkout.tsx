import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { AnimatedPage } from '@/components/layout/AnimatedPage'
import { CreditCard } from 'lucide-react'

const plans = [
  { id: 'free', name: 'Free', price: '$0', desc: 'Get started' },
  { id: 'pro', name: 'Pro', price: '$29/mo', desc: 'For professionals' },
  { id: 'teams', name: 'Teams', price: '$99/mo', desc: 'For teams' },
]

export function Checkout() {
  return (
    <AnimatedPage>
      <div className="mx-auto max-w-2xl space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Checkout</h1>
          <p className="text-muted-foreground">
            Subscription and invoice history
          </p>
        </div>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Plan Selector</CardTitle>
            <CardDescription className="text-muted-foreground">
              Free / Pro / Teams
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              {plans.map((p) => (
                <div
                  key={p.id}
                  className="rounded-lg border border-border bg-card/50 p-4 transition-colors hover:border-primary/30"
                >
                  <p className="font-semibold text-foreground">{p.name}</p>
                  <p className="text-lg font-bold text-primary">{p.price}</p>
                  <p className="text-sm text-muted-foreground">{p.desc}</p>
                  <Button variant={p.id === 'pro' ? 'default' : 'outline'} size="sm" className="mt-4 w-full">
                    Select
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <CreditCard className="h-5 w-5" />
              Payment
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Hosted card elements (Stripe placeholder)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="promo">Promo code</Label>
              <Input
                id="promo"
                placeholder="Enter code"
                className="border-border bg-card"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="terms" />
              <Label htmlFor="terms" className="text-sm text-muted-foreground">
                I agree to the terms and conditions
              </Label>
            </div>
            <Button className="w-full">Subscribe</Button>
          </CardContent>
        </Card>
      </div>
    </AnimatedPage>
  )
}
