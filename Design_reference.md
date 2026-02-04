# Modern Design Best Practices

## Philosophy

Create unique, memorable experiences while maintaining consistency through modern design principles. Every project should feel distinct yet professional, innovative yet intuitive.

---

## Landing Pages & Marketing Sites

### Hero Sections
**Go beyond static backgrounds:**
- Animated gradients with subtle movement
- Particle systems or geometric shapes floating
- Interactive canvas backgrounds (Three.js, WebGL)
- Video backgrounds with proper fallbacks
- Parallax scrolling effects
- Gradient mesh animations
- Morphing blob animations


### Layout Patterns
**Use modern grid systems:**
- Bento grids (asymmetric card layouts)
- Masonry layouts for varied content
- Feature sections with diagonal cuts or curves
- Overlapping elements with proper z-index
- Split-screen designs with scroll-triggered reveals

**Avoid:** Traditional 3-column equal grids

### Scroll Animations
**Engage users as they scroll:**
- Fade-in and slide-up animations for sections
- Scroll-triggered parallax effects
- Progress indicators for long pages
- Sticky elements that transform on scroll
- Horizontal scroll sections for portfolios
- Text reveal animations (word by word, letter by letter)
- Number counters animating into view

**Avoid:** Static pages with no scroll interaction

### Call-to-Action Areas
**Make CTAs impossible to miss:**
- Gradient buttons with hover effects
- Floating action buttons with micro-interactions
- Animated borders or glowing effects
- Scale/lift on hover
- Interactive elements that respond to mouse position
- Pulsing indicators for primary actions

---

## Dashboard Applications

### Layout Structure
**Always use collapsible side navigation:**
- Sidebar that can collapse to icons only
- Smooth transition animations between states
- Persistent navigation state (remember user preference)
- Mobile: drawer that slides in/out
- Desktop: sidebar with expand/collapse toggle
- Icons visible even when collapsed

**Structure:**
```
/dashboard (layout wrapper with sidebar)
  /dashboard/overview
  /dashboard/analytics
  /dashboard/settings
  /dashboard/users
  /dashboard/projects
```

All dashboard pages should be nested inside the dashboard layout, not separate routes.

### Data Tables
**Modern table design:**
- Sticky headers on scroll
- Row hover states with subtle elevation
- Sortable columns with clear indicators
- Pagination with items-per-page control
- Search/filter with instant feedback
- Selection checkboxes with bulk actions
- Responsive: cards on mobile, table on desktop
- Loading skeletons, not spinners
- Empty states with illustrations or helpful text

**Use modern table libraries:**
- TanStack Table (React Table v8)
- AG Grid for complex data
- Data Grid from MUI (if using MUI)

### Charts & Visualizations
**Use the latest charting libraries:**
- Recharts (for React, simple charts)
- Chart.js v4 (versatile, well-maintained)
- Apache ECharts (advanced, interactive)
- D3.js (custom, complex visualizations)
- Tremor (for dashboards, built on Recharts)

**Chart best practices:**
- Animated transitions when data changes
- Interactive tooltips with detailed info
- Responsive sizing
- Color scheme matching design system
- Legend placement that doesn't obstruct data
- Loading states while fetching data

### Dashboard Cards
**Metric cards should stand out:**
- Gradient backgrounds or colored accents
- Trend indicators (↑ ↓ with color coding)
- Sparkline charts for historical data
- Hover effects revealing more detail
- Icon representing the metric
- Comparison to previous period

---

## Color & Visual Design

### Color Palettes
**Create depth with gradients:**
- Primary gradient (not just solid primary color)
- Subtle background gradients
- Gradient text for headings
- Gradient borders on cards
- Elevated surfaces for depth

**Color usage:**
- 60-30-10 rule (dominant, secondary, accent)
- Consistent semantic colors (success, warning, error)
- Accessible contrast ratios (WCAG AA minimum)

### Typography
**Create hierarchy through contrast:**
- Large, bold headings (48-72px for heroes)
- Clear size differences between levels
- Variable font weights (300, 400, 600, 700)
- Letter spacing for small caps
- Line height 1.5-1.7 for body text
- Inter, Poppins, or DM Sans for modern feel

### Shadows & Depth
**Layer UI elements:**
- Multi-layer shadows for realistic depth
- Colored shadows matching element color
- Elevated states on hover
- Neumorphism for special elements (sparingly)

---

## Interactions & Micro-animations

### Button Interactions
**Every button should react:**
- Scale slightly on hover (1.02-1.05)
- Lift with shadow on hover
- Ripple effect on click
- Loading state with spinner or progress
- Disabled state clearly visible
- Success state with checkmark animation

### Card Interactions
**Make cards feel alive:**
- Lift on hover with increased shadow
- Subtle border glow on hover
- Tilt effect following mouse (3D transform)
- Smooth transitions (200-300ms)
- Click feedback for interactive cards

### Form Interactions
**Guide users through forms:**
- Input focus states with border color change
- Floating labels that animate up
- Real-time validation with inline messages
- Success checkmarks for valid inputs
- Error states with shake animation
- Password strength indicators
- Character count for text areas

### Page Transitions
**Smooth between views:**
- Fade + slide for page changes
- Skeleton loaders during data fetch
- Optimistic UI updates
- Stagger animations for lists
- Route transition animations

---

## Mobile Responsiveness

### Mobile-First Approach
**Design for mobile, enhance for desktop:**
- Touch targets minimum 44x44px
- Generous padding and spacing
- Sticky bottom navigation on mobile
- Collapsible sections for long content
- Swipeable cards and galleries
- Pull-to-refresh where appropriate

### Responsive Patterns
**Adapt layouts intelligently:**
- Hamburger menu → full nav bar
- Card grid → stack on mobile
- Sidebar → drawer
- Multi-column → single column
- Data tables → card list
- Hide/show elements based on viewport

---

## Loading & Empty States

### Loading States
**Never leave users wondering:**
- Skeleton screens matching content layout
- Progress bars for known durations
- Animated placeholders
- Spinners only for short waits (<3s)
- Stagger loading for multiple elements
- Shimmer effects on skeletons

### Empty States
**Make empty states helpful:**
- Illustrations or icons
- Helpful copy explaining why it's empty
- Clear CTA to add first item
- Examples or suggestions
- No "no data" text alone

---

## Unique Elements to Stand Out

### Distinctive Features
**Add personality:**
- Custom cursor effects on landing pages
- Animated page numbers or section indicators
- Unusual hover effects (magnification, distortion)
- Custom scrollbars
- Glassmorphism for overlays
- Animated SVG icons
- Typewriter effects for hero text
- Confetti or celebration animations for actions

### Interactive Elements
**Engage users:**
- Drag-and-drop interfaces
- Sliders and range controls
- Toggle switches with animations
- Progress steps with animations
- Expandable/collapsible sections
- Tabs with slide indicators
- Image comparison sliders
- Interactive demos or playgrounds

---

## Consistency Rules

### Maintain Consistency
**What should stay consistent:**
- Spacing scale (4px, 8px, 16px, 24px, 32px, 48px, 64px)
- Border radius values
- Animation timing (200ms, 300ms, 500ms)
- Color system (primary, secondary, accent, neutrals)
- Typography scale
- Icon style (outline vs filled)
- Button styles across the app
- Form element styles

### What Can Vary
**Project-specific customization:**
- Color palette (different colors, same system)
- Layout creativity (grids, asymmetry)
- Illustration style
- Animation personality
- Feature-specific interactions
- Hero section design
- Card styling variations
- Background patterns or textures

---

## Technical Excellence

### Performance
- Optimize images (WebP, lazy loading)
- Code splitting for faster loads
- Debounce search inputs
- Virtualize long lists
- Minimize re-renders
- Use proper memoization

### Accessibility
- Keyboard navigation throughout
- ARIA labels where needed
- Focus indicators visible
- Screen reader friendly
- Sufficient color contrast
- Respect reduced motion preferences

---

## Key Principles

1. **Be Bold** - Don't be afraid to try unique layouts and interactions
2. **Be Consistent** - Use the same patterns for similar functions
3. **Be Responsive** - Design works beautifully on all devices
4. **Be Fast** - Animations are smooth, loading is quick
5. **Be Accessible** - Everyone can use what you build
6. **Be Modern** - Use current design trends and technologies
7. **Be Unique** - Each project should have its own personality
8. **Be Intuitive** - Users shouldn't need instructions


---

# Project-Specific Customizations

**IMPORTANT: This section contains the specific design requirements for THIS project. The guidelines above are universal best practices - these customizations below take precedence for project-specific decisions.**

## User Design Requirements

# ClawCloud - Development Blueprint

ClawCloud is a multi-tenant SaaS web app that enables non-technical users to connect cloud accounts, install curated Skill Packs, and run safe, auditable AI-driven assistants that handle email, calendar, bookings, and research. It prioritizes time-to-value, no-code skill creation, and trust-by-default through draft defaults, approvals, and immutable audit trails. The MVP targets busy professionals, founders/operators, and small team leads.

## 1. Pages (UI Screens)

- Password Reset
  - Purpose: Allow users to request a password reset and complete reset via secure emailed token link.
  - Key sections/components:
    - Email Input (for reset request) + "Send reset link" button
    - Confirmation message after request
    - Reset Form (via secure token): New password, Confirm password
    - Password strength indicator
    - Inline errors and success states
    - Link to Login page

- Email Verification
  - Purpose: Surface account verification-required state and allow resends; block main app where applicable.
  - Key sections/components:
    - Verification notice banner
    - "Resend verification" button with cooldown & progress UI
    - Link to support/help
    - CTA to continue after verification

- User Profile
  - Purpose: Account and personalization center for user settings and security.
  - Key sections/components:
    - Profile Summary Card: Name, avatar, email, workspace role
    - Edit Profile Form: name, display name, timezone, locale
    - Preferences Panel: assistant tone, verbosity, default approval level
    - Security Section: 2FA toggle, sessions list with revoke buttons
    - Connected Accounts Summary: quick links to manage connectors
    - Billing & Plan Link
    - Delete Account button + confirmation modal

- Automations & Scheduler
  - Purpose: Manage scheduled runs and automation rules.
  - Key sections/components:
    - Automation List: name, trigger, next run time, status toggle
    - Create Automation Modal: choose skill, trigger type, schedule, timezone
    - Run Calendar View: visual schedule
    - Audit Snapshot: last run result link
    - Bulk actions: enable/disable, delete

- Skill Studio (No-Code Builder)
  - Purpose: Create/edit skills via templates, blocks, and forms with test/preview.
  - Key sections/components:
    - Toolbar: Save, Test, Publish/Enable, Revert
    - Trigger Panel: manual / schedule / event configuration
    - Block Canvas: drag-and-drop blocks (Fetch, Transform, Search, WebAgent, CreateOutput, Deliver, Guard)
    - Block Properties Sidebar: parameters, connectors, templates
    - Test Runner: run on sample input + output simulation
    - Error/Validation Pane: preflight errors & connector warnings
    - Versioning & History: snapshots and revert control

- Run Details / History
  - Purpose: Inspect single run with timeline, logs, approvals, and artifacts.
  - Key sections/components:
    - Run Header: id, skill name, initiator, status, timestamps
    - Steps Timeline: step inputs/outputs, AI model logs, artifacts
    - Approval Details: decision, actor, rollback options
    - Artifacts Panel: screenshots, exports, downloads
    - Export/Share Controls (PDF/JSON) + access control

- Web Agent Runs & Recorder
  - Purpose: Start/monitor browser automation runs with approval checkpoints.
  - Key sections/components:
    - Start Run Button: choose ephemeral or persistent profile
    - Recorder/Script Preview: high-level action list
    - Run Timeline: chronological steps with screenshots/logs
    - Approval Checkpoints: editable fields & pause points
    - Run Controls: pause, cancel, retry
    - Profile Management: manage encrypted persistent profiles

- 500 Server Error
  - Purpose: Friendly internal error page with support guidance.
  - Key sections/components:
    - Headline: "Something went wrong"
    - Retry button
    - Contact support CTA
    - Error ID for support reference

- Privacy / Terms / Cookie Policy
  - Purpose: Legal pages accessible from footer and onboarding.
  - Key sections/components:
    - Static legal text sections
    - Downloadable PDF
    - "Last updated" metadata
    - Contact for legal inquiries

- 404 Not Found
  - Purpose: User-friendly fallback for unknown routes.
  - Key sections/components:
    - Headline: "Page not found"
    - Suggested links: Dashboard, Help, Contact Support
    - Search field

- Landing Page
  - Purpose: Public marketing with value prop and CTAs.
  - Key sections/components:
    - Hero: headline, subheadline, CTA (Sign up / Book demo)
    - Feature cards: Connectors, Skill Packs, Skill Studio, Web Agent, Trust & Controls
    - Packs showcase: Inbox Zero, Meeting Master, Travel Concierge
    - Pricing teaser: Free / Pro / Teams
    - Testimonials / trust indicators
    - Footer links

- Workspace Settings
  - Purpose: Admin-level workspace configuration and security policies.
  - Key sections/components:
    - Workspace Info Card: name, plan, usage stats
    - Team Management: invite users, roles, permissions
    - Billing & Subscription: plan details, payment method, upgrade/downgrade CTA
    - Security & Policies: default action levels, allowed auto-run types, connectors whitelist
    - Audit Logs link
    - Data export & retention settings

- About & Help
  - Purpose: Integrated help center and onboarding docs.
  - Key sections/components:
    - Searchable docs & guides
    - Connector setup walkthroughs
    - FAQ
    - Contact support form
    - Changelog & release notes

- Checkout / Payment
  - Purpose: Subscription purchases and invoice history.
  - Key sections/components:
    - Plan Selector: Free / Pro / Teams
    - Payment Form: hosted card elements
    - Promo code input
    - Invoice summary & terms checkbox
    - Success & failure states

- Login / Signup
  - Purpose: Authentication entry with SSO & magic link.
  - Key sections/components:
    - Brand header
    - Auth form tabs: Login / Sign up
    - Email / Password inputs + show/hide
    - Password strength meter (signup)
    - SSO buttons (Google)
    - Magic link option
    - Forgot password link
    - Legal links

- Admin Dashboard (operator)
  - Purpose: Product operator tools to monitor system health and manage packs/workspaces.
  - Key sections/components:
    - Global metrics cards
    - Workspace list with quick actions
    - Connector health panel
    - Web Agent cluster status
    - Pack management CMS
    - Logs & monitoring links

- Dashboard / Universal Inbox
  - Purpose: Central workspace where assistant outputs, digests, approvals, and runs appear.
  - Key sections/components:
    - Top navbar: search, quick-create skill, notifications, avatar
    - Left sidebar: workspace switcher, nav (Inbox, Skills, Automations, Web Agent Runs, Settings)
    - Main pane: Today's Digest card (Top threads, Action required, Suggested replies)
    - Approvals panel: pending approvals with inline edit/approve
    - Run history feed with expandable timeline
    - Right pane: contextual preview
    - Mobile behavior: collapsible sidebar & single-column feed

- Skill Library & Packs
  - Purpose: Browse, preview, and install curated packs.
  - Key sections/components:
    - Search & filters (category, connector required, trust level)
    - Pack cards (name, description, required connectors)
    - Pack detail page: steps, sample outputs, safety defaults, pricing
    - Install flow: connector preflight, settings, confirmation
    - Installed packs list with quick-config links

## 2. Features

- Connectors (OAuth & Token Management)
  - Technical details:
    - Provider record model: provider, scopes, tokenRef (KMS), status, expiresAt
    - OAuth flows w/ PKCE where required; redirect URIs per workspace
    - Background refresh jobs for token refresh + health checks
    - Webhook handlers for push events (Gmail push, Slack events)
    - Connector health UI with actionable errors
  - Implementation notes:
    - Store tokens encrypted with KMS; never log raw tokens
    - Expose connector scope warnings in Skill Studio validations

- Skill Library & Pack Installation
  - Technical details:
    - Pack metadata: id, name, description, requiredConnectors, steps, pricing
    - Install flow endpoint: POST /workspaces/:id/packs/install
    - Permission: workspace admins by default
    - Audit trail for installs/uninstalls
  - Implementation notes:
    - Provide sandboxed sample output generator for previews
    - Enforce connector preflight checks before install

- Skill Studio (No-Code Builder)
  - Technical details:
    - Skill model: triggers, blocks[], inputs, guards, versions
    - Blocks: Fetch, Transform, Search, WebAgent, CreateOutput, Deliver, Guard
    - Server endpoints: POST /skills, GET /skills/:id, POST /skills/test, POST /skills/:id/publish
    - Validation engine to verify connector availability and required scopes
    - Sandboxed test runner for sample executions
  - Implementation notes:
    - Drag-and-drop canvas with property sidebar; persist drafts server-side
    - Preflight validation prevents publish when required connectors missing

- Automations & Scheduler
  - Technical details:
    - Automation model references skillId, trigger definition, timezone
    - Scheduler service enqueues runs respecting concurrency limits
    - Cron expression helper & timezone-aware trigger parsing
  - Implementation notes:
    - Show next-run times in UI; allow quick toggles enable/disable
    - Provide calendar view and bulk operations

- Web Agent (Browser Automation)
  - Technical details:
    - Browser cluster (Playwright/Puppeteer) workers, queue, and rate limits
    - Profile management: ephemeral (no persistence) vs persistent encrypted profiles (KMS)
    - Step-level timeline, screenshots stored in S3
    - Approval checkpoints integrated into run orchestration; runs pause until decision
    - Endpoints: POST /webagent/runs, GET /webagent/runs/:id
  - Implementation notes:
    - Limit MVP to robust flows, provide clear timeline UX & approval checkpoints
    - Redact sensitive artifacts; store screenshots with limited TTL per retention policy

- Universal Inbox & Digest
  - Technical details:
    - Inbox model with digest cards, drafts, approvals, briefs
    - Scheduled digest generator job (runs installed Inbox Zero skills)
    - Endpoints: GET /inbox/digest, GET /inbox/drafts, PATCH /inbox/drafts/:id
  - Implementation notes:
    - Virtualize lists for performance; paginate and cache digest generation
    - Deliver draft replies as drafts by default (never auto-send without approval)

- Approvals & Trust Controls
  - Technical details:
    - Approval model: requestedAction, payload, status, actor, createdAt
    - Orchestration: runs pause at checkpoint until POST /approvals/:id/decision
    - Policy engine: workspace defaults & whitelist rules
    - Audit logs for approvals with undo where supported
  - Implementation notes:
    - Checkout-style approval UI with editable key fields and "approve once" / "always allow" options
    - Default workspace policy: draft-only / requires-approval for irreversible actions

- Run Orchestration & Tool Workers
  - Technical details:
    - Agent orchestrator enqueues steps to tool workers (fetch, transform, model call, web agent)
    - Event bus/queue (e.g., Rabbit/Kafka/SQS) for durable messaging
    - Idempotency keys, retries with backoff, and run state persistence
  - Implementation notes:
    - Keep step logs and artifacts; implement retention & export

- AI Model Layer & Routing
  - Technical details:
    - Provider adapter layer: providerId, credentials, rate limits
    - Workspace model settings: tone, verbosity, risk tolerance
    - Structured output schema enforcement & sanitization
    - Retry & timeout controls; logging with redaction
  - Implementation notes:
    - Abstract provider so adding new providers requires adapter + config
    - Cache repeated prompts where feasible for cost control

- Notifications & Alerts
  - Technical details:
    - Notification model: channel preferences (email, in-app, push)
    - Transactional email via SendGrid
    - Realtime in-app notifications via websockets or server-sent events
  - Implementation notes:
    - Deduplicate notifications, implement retry/backoff for failures

- Search & Filter
  - Technical details:
    - Search index (Elasticsearch/Algolia) for inbox items, runs, and packs
    - API endpoints with facets, pagination, saved searches
  - Implementation notes:
    - Provide faceted filters (requires-approval, date range, source)

- Export & Data Retention
  - Technical details:
    - Export endpoints (CSV/PDF/JSON) for runs and audit logs
    - Retention policy enforcement background job
  - Implementation notes:
    - Ensure exports respect access control and redact sensitive tokens

- Billing & Subscription Management
  - Technical details:
    - Integrate with Stripe for subscriptions, metered usage, invoices, promo codes
    - Billing webhooks to update workspace state
  - Implementation notes:
    - Show plan limits in workspace UI; enforce quotas server-side

- Authentication & Session Management
  - Technical details:
    - Email/password + Google SSO + magic link
    - JWT access tokens + refresh tokens stored in secure HttpOnly cookies
    - Endpoints: /auth/signup, /auth/login, /auth/logout, /auth/refresh
    - Session listing and revocation in profile
  - Implementation notes:
    - Use bcrypt/argon2 for passwords; rate-limit auth endpoints

- Admin & Monitoring Tools
  - Technical details:
    - Metrics ingestion (Prometheus), dashboards (Grafana)
    - Admin RBAC, operator APIs for workspace lifecycle
  - Implementation notes:
    - Expose logs with redaction and QA workflow for curated packs

## 3. User Journeys

- New User / Inbox Zero Pack (Busy professional)
  1. Sign up or SSO -> onboarding modal shown
  2. Guided connector setup: connect Gmail (OAuth) and Google Calendar
  3. Browse Skill Library -> select "Inbox Zero Pack" -> Install
  4. Preflight connector check passes -> configure schedule (Daily Digest at 08:00)
  5. Confirm install -> scheduled automation created
  6. Next morning scheduled run executes -> Digest appears in Universal Inbox
  7. User opens digest -> views Top threads, Action-required list, and draft replies
  8. Edit drafts as needed -> approve/send (draft-only default, explicit approve)

- Schedule a Meeting via Chat (Slack/Telegram user)
  1. User messages assistant in Slack/Telegram
  2. Connector webhook routes message -> orchestrator maps to skill
  3. Skill queries calendar free/busy -> proposes 3 slots (based on calendar rules)
  4. Assistant posts choices to chat -> user selects slot
  5. Skill reaches approval checkpoint if policy requires
  6. User approves -> assistant creates event via Google Calendar API and notifies participants

- Book a Reservation (Web Agent flow)
  1. User requests booking via chat or web UI
  2. Skill Studio or Pack triggers Web Agent run (POST /webagent/runs)
  3. Web Agent navigates & fills forms; timeline populated with screenshots
  4. Run reaches checkout/irreversible step -> pause and create approval
  5. User receives in-app/email notification -> opens Run Details
  6. In approval UI, user edits key fields (time, party size, cost) -> Approve
  7. Web Agent resumes and completes booking; confirmation artifact added to run

- Non-technical Custom Skill (Skill Studio)
  1. User opens Skill Studio -> chooses template "Summarize incoming emails from X"
  2. Configure trigger: "on new email from domain X", set output style (short/concise)
  3. Add blocks: Fetch (Gmail), Transform (extract key points), CreateOutput (draft email)
  4. Test on sample -> view Preview output and validation warnings
  5. Save and Publish with default "Draft-only" delivery
  6. Skill becomes available; runs produce drafts that appear in Inbox

- Workspace Admin Setup (Teams)
  1. Admin receives invite -> signs up / logs in
  2. Admin goes to Workspace Settings -> set default approval level (requires approval for bookings)
  3. Invite team members and assign roles
  4. Install "Meeting Master Pack" to workspace and configure shared schedule rules
  5. Team members can enable pack for personal use if allowed; admins see install audit log

## 4. UI Guide
---

Implementation notes: apply the Visual Style and Design Philosophy across all pages and components. Use the component guidelines and tokens consistently.

Visual Style

### Color Palette:
- **Primary Background:** Deep charcoal (#18191C) used for main backgrounds and panels.
- **Secondary Background:** Slightly lighter dark gray (#232429) for cards and sub-panels.
- **Accent Color:** Vibrant blue (#3A8FFF) for highlights, active states, and icons (e.g., sidebar active item).
- **Text Colors:**
  - Primary text: White or near-white (#F4F5F7)
  - Secondary text: Cool gray (#B0B3BC)
  - Tertiary/muted text: Dimmed gray (#6E727A)
- **Borders/Dividers:** Subtle dark gray (#26272C) for separating elements.
- **Status/Indicators:** Soft red (#FF5B5B), yellow (#FFD66B), green (#3DD598) for tags/indicators.
- **Card/Panel Highlights:** Slightly lighter overlays or gradients for card hovers.

### Typography & Layout:
- **Font Family:** Sans-serif (Inter / SF Pro)
- **Font Weights:** Bold for headings, Medium/Regular for body, Light for meta
- **Spacing:** 24px–32px gutters; generous padding inside cards
- **Alignment:** Left-aligned content; sidebar nav on left
- **Typography Treatments:** All-caps or semi-bold for section titles; subtle letter-spacing for nav/labels

### Key Design Elements

Card Design
- Rounded corners (8px), dark background (#232429), 1px border (#26272C)
- Low-contrast soft shadows; hover lightening and icon highlight

Navigation
- Fixed vertical sidebar (#18191C) with icons+text
- Active state: blue #3A8FFF pill or filled indicator
- Collapsible sections indicated by chevrons; top bar with search & profile

Data Visualization
- Minimalist line/donut charts; transparent backgrounds; muted labels

Interactive Elements
- Buttons rounded; primary filled accent, secondary muted
- Inputs: rounded, dark background, blue focus glow
- Smooth micro-interactions for expand/collapse and transitions

Design Philosophy
- Modern, minimalist dark UI focused on clarity and low cognitive load for busy users
- Prioritize accessibility (contrast, keyboard navigation, focus states)

Implementation Notes
- Create a design token file (colors, spacing, typography, radii) and a component library (buttons, inputs, cards, modals, toasts, lists, tables, icons).
- Ensure all components support light/dark tokens (MVP uses dark tokens above).
- Implement global CSS variables and a consistent spacing scale.
- All interactive components must include accessible ARIA attributes and keyboard navigation.
- Verify color contrast meets WCAG AA for primary text.

Instructions to AI Development Tool
- After every development step, refer back to this blueprint to ensure correct implementation.
- Verify pages, features, and UI follow this blueprint before marking steps complete.
- Pay special attention to Skill Studio validation, approval checkpoint orchestration, Web Agent timeline UX, and connector preflight checks.

Notes: For MVP focus on Inbox Zero + Meeting Master as hero packs, Gmail + Google Calendar + Slack + WebChat connectors, Skill Studio v1 templates, and Web Agent booking v1 with approval checkpoints.

## Implementation Notes

When implementing this project:

1. **Follow Universal Guidelines**: Use the design best practices documented above as your foundation
2. **Apply Project Customizations**: Implement the specific design requirements stated in the "User Design Requirements" section
3. **Priority Order**: Project-specific requirements override universal guidelines when there's a conflict
4. **Color System**: Extract and implement color values as CSS custom properties in RGB format
5. **Typography**: Define font families, sizes, and weights based on specifications
6. **Spacing**: Establish consistent spacing scale following the design system
7. **Components**: Style all Shadcn components to match the design aesthetic
8. **Animations**: Use Motion library for transitions matching the design personality
9. **Responsive Design**: Ensure mobile-first responsive implementation

## Implementation Checklist

- [ ] Review universal design guidelines above
- [ ] Extract project-specific color palette and define CSS variables
- [ ] Configure Tailwind theme with custom colors
- [ ] Set up typography system (fonts, sizes, weights)
- [ ] Define spacing and sizing scales
- [ ] Create component variants matching design
- [ ] Implement responsive breakpoints
- [ ] Add animations and transitions
- [ ] Ensure accessibility standards
- [ ] Validate against user design requirements

---

**Remember: Always reference this file for design decisions. Do not use generic or placeholder designs.**
