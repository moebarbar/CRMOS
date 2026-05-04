# PHASES.md

> The build roadmap for ChiefOS. Twelve phases. Each phase ends with something demoable.
> **Rule:** if a feature isn't in the current phase, don't build it.

---

## Cadence

- Estimates are for one focused builder + Claude Code, weekday hours.
- Each phase ends with a **shipping milestone** — push to a deploy preview, demo internally, only then move on.
- Bugs from earlier phases are fixed inline; do not start the next phase with a known broken money path from the previous one.
- After every phase, update the [changelog](./CHANGELOG.md) and re-read `CLAUDE.md`.

---

## Phase 0 — Foundation

**Goal:** Empty but correctly-architected app shell. Auth works. Multi-tenant resolved. Empty rooms ready for furniture.
**Duration:** 1–2 weeks
**Prereqs:** none

### Schema

- `User`, `Workspace`, `Membership`, `WorkspaceDomain`, `ApiKey`, `Activity`, `AuditLog`, `Notification`

### Setup tasks

- [ ] Initialize monorepo: `pnpm init`, Turborepo, `apps/web`, `packages/db`, `packages/shared`, `packages/emails`
- [ ] Next.js 14 with App Router, TypeScript strict, ESLint, Prettier
- [ ] Tailwind + shadcn/ui base install (`button`, `input`, `card`, `dialog`, `dropdown-menu`, `command`, `toast`, `skeleton`, `avatar`, `badge`)
- [ ] Prisma + Postgres on Supabase, run first migration with the Phase 0 schema
- [ ] Clerk integrated (sign-in, sign-up, MFA, organization-less since we have our own Workspace model)
- [ ] tRPC server + client wired with `auth`, `workspace`, `audit` middleware
- [ ] Inngest set up; one example function deployed
- [ ] Resend + a `WelcomeEmail` template in `packages/emails`
- [ ] Sentry, Axiom, PostHog initialized (envs + boot)
- [ ] CI on GitHub Actions: typecheck, lint, test, prisma validate
- [ ] Vercel deploy with preview URLs
- [ ] `.env.example` complete; `README.md` with setup instructions
- [ ] `CLAUDE.md`, `SCHEMA.md`, `PHASES.md` committed

### Files to scaffold

```
apps/web/
├── app/
│   ├── layout.tsx                    # root layout, theme provider, toaster
│   ├── page.tsx                      # marketing landing (placeholder)
│   ├── (auth)/sign-in/[[...rest]]/page.tsx
│   ├── (auth)/sign-up/[[...rest]]/page.tsx
│   ├── onboarding/page.tsx           # post-signup: create-workspace
│   ├── (app)/[workspace]/
│   │   ├── layout.tsx                # AppShell: sidebar, topbar, command palette
│   │   ├── page.tsx                  # dashboard (empty state for now)
│   │   ├── settings/page.tsx
│   │   └── settings/team/page.tsx    # invite + manage members
│   ├── api/
│   │   ├── webhooks/clerk/route.ts   # syncs user creates → our User table
│   │   └── webhooks/inngest/route.ts
│   └── trpc/[trpc]/route.ts
├── server/
│   ├── trpc/
│   │   ├── trpc.ts
│   │   ├── context.ts
│   │   ├── routers/
│   │   │   ├── workspace.ts
│   │   │   ├── membership.ts
│   │   │   └── _app.ts
│   ├── services/
│   │   ├── workspace.service.ts
│   │   └── activity.service.ts
│   └── lib/
│       ├── audit.ts                  # writeAudit() + activity helpers
│       └── tenant.ts                 # resolveTenant(headers)
├── lib/
│   ├── auth/
│   │   ├── clerk.ts
│   │   └── permissions.ts
│   ├── db/
│   │   └── prisma.ts
│   └── utils/
│       └── cn.ts
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx              # sidebar + topbar + cmd palette container
│   │   ├── Sidebar.tsx
│   │   ├── Topbar.tsx
│   │   └── CommandMoeette.tsx        # cmd+k (empty until Phase 10)
│   └── ui/                           # shadcn primitives
└── middleware.ts                     # tenant + auth middleware
```

### Acceptance criteria

- [ ] User signs up → redirected to onboarding → creates workspace → lands on `/[slug]` dashboard
- [ ] Owner can invite a teammate by email; invitee accepts and sees the same workspace
- [ ] Switching workspaces via dropdown works
- [ ] Invalid workspace slug 404s
- [ ] Non-member trying to access a workspace 403s (via middleware AND tRPC)
- [ ] Every mutation logs an Activity row
- [ ] Sentry catches a test error end-to-end
- [ ] CI green on `main`

### Demo

"I sign up, create my workspace, invite my co-founder. He joins. We can both see the dashboard. There's nothing in it yet — that's Phase 1."

---

## Phase 1 — CRM Core

**Goal:** Real contact + company management with custom fields, tags, activity timeline, saved views.
**Duration:** 2–3 weeks
**Prereqs:** Phase 0

### Schema

- `Contact`, `Company`, `Tag`, `ContactTag`, `Note`, `CustomFieldDef`

### Tasks

- [ ] Contacts module: list, create, edit, delete (soft), bulk actions, CSV import/export
- [ ] Companies module same surface
- [ ] Tags: workspace-scoped, color-coded, attach to contacts
- [ ] Notes: rich text via Tiptap, attached to contact (polymorphic for future)
- [ ] Activity timeline component (reads from `Activity` table)
- [ ] Custom fields engine:
  - [ ] `CustomFieldDef` CRUD per workspace per entity
  - [ ] Generic field renderer (read + edit) handling all 14 types
  - [ ] Validation against the def at the service layer
- [ ] Saved views (filter, sort, group, columns) — saved per user per entity
- [ ] Search: Postgres `pg_trgm` index for fuzzy name/email search; surface in command palette
- [ ] CSV import wizard: column mapping, dedupe by email, error report
- [ ] Lifecycle stage workflow (`SUBSCRIBER → LEAD → MQL → SQL → CUSTOMER`)
- [ ] Auto-link contact's `companyId` when email domain matches a company

### Files

```
app/(app)/[workspace]/contacts/
├── page.tsx                          # list view with views/filters/columns
├── [id]/page.tsx                     # contact detail: profile + tabs
├── [id]/(tabs)/notes/page.tsx
├── [id]/(tabs)/activity/page.tsx
├── [id]/(tabs)/deals/page.tsx        # wired in Phase 2
├── new/page.tsx
└── import/page.tsx

app/(app)/[workspace]/companies/
└── ...                               # mirror

components/modules/contacts/
├── ContactsList.tsx
├── ContactsKanban.tsx                # by stage
├── ContactRow.tsx
├── ContactCard.tsx
├── ContactForm.tsx
├── ContactDetailHeader.tsx
├── ContactsToolbar.tsx
├── ContactImportWizard.tsx
└── ...

components/modules/custom-fields/
├── CustomFieldDefList.tsx
├── CustomFieldEditor.tsx
└── CustomFieldRenderer.tsx           # one of: TextField, SelectField, etc.

server/services/
├── contact.service.ts
├── company.service.ts
├── tag.service.ts
└── customField.service.ts

server/trpc/routers/
├── contacts.ts
├── companies.ts
├── tags.ts
├── notes.ts
└── customFields.ts
```

### Acceptance criteria

- [ ] Create 100 contacts via CSV import in < 30 seconds
- [ ] Custom field of every type renders + saves correctly
- [ ] Filter "Owner = me AND lifecycle = LEAD" returns correct rows
- [ ] Saved view persists across sessions
- [ ] Activity timeline shows: created, updated (with diff), tagged, untagged, note added
- [ ] Search "joh" finds "John Smith" via trgm
- [ ] Soft-deleted contact returns from "trash" within 30 days
- [ ] Permission test: a CONTRACTOR cannot see contacts not assigned to their projects

### Demo

"I import 200 contacts from a CSV. I tag the agency clients. I filter by tag and save the view. I open Sarah's profile, add a note, see the activity timeline."

---

## Phase 2 — Pipeline & Deals

**Goal:** Drag-drop sales pipeline, multiple pipelines, forecasts, won/lost handling.
**Duration:** 1.5–2 weeks
**Prereqs:** Phase 1

### Schema

- `Pipeline`, `PipelineStage`, `Deal`

### Tasks

- [ ] Pipelines: CRUD, multiple per workspace, set default
- [ ] Stages: drag to reorder, color, win-probability, rot-in-days
- [ ] Deals: CRUD, link to contact + company, value + currency, expected close, owner
- [ ] Kanban view with dnd-kit: drag deals between stages, sticky column headers
- [ ] List view with inline editing
- [ ] Forecast widget (Σ value × probability, by month)
- [ ] Won flow: prompt for actuals, mark `closedAt`, fire `deal.won` event
- [ ] Lost flow: required reason dropdown, fire `deal.lost` event
- [ ] Stale-deal detection (visual badge if no activity in `rotInDays`)
- [ ] Deal templates (clone)
- [ ] Activities required per stage (gate: must have a logged note before advancing)

### Files

```
app/(app)/[workspace]/deals/
├── page.tsx                          # default = active pipeline kanban
├── pipelines/page.tsx                # manage pipelines
├── pipelines/[id]/page.tsx
└── [id]/page.tsx                     # deal detail

components/modules/deals/
├── DealsKanban.tsx
├── DealsList.tsx
├── DealCard.tsx
├── DealForm.tsx
├── DealStageColumn.tsx
├── ForecastWidget.tsx
├── PipelineEditor.tsx
└── WonLostDialog.tsx

server/services/
├── pipeline.service.ts
└── deal.service.ts

server/trpc/routers/
├── pipelines.ts
└── deals.ts
```

### Acceptance criteria

- [ ] Drag a deal from "Demo" to "Proposal" — saves order + stage
- [ ] Forecast widget recalculates on drag
- [ ] Cannot move deal forward without a logged note (when stage gate enabled)
- [ ] Won deal fires `deal.won` event (visible in Inngest dashboard)
- [ ] Two pipelines (Sales + Renewals) operate independently
- [ ] Filter "owner = me + value > $5k + stage = Demo" works on both views
- [ ] Mobile-responsive kanban (vertical stack on small screens)

### Demo

"I drag a $12k deal from Demo to Proposal. The forecast jumps. I close it as Won. The system fires an event that, in Phase 4, will auto-create the contract."

---

## Phase 3 — Projects & Tasks

**Goal:** Asana-grade project + task management connected to CRM.
**Duration:** 3 weeks
**Prereqs:** Phase 1

### Schema

- `Project`, `ProjectTemplate`, `Milestone`, `Task`, `TaskDependency`

### Tasks

- [ ] Projects: CRUD, link to client (contact/company) + deal, status, dates, budget
- [ ] Project templates: clone-with-tasks, store as `ProjectTemplate.data`
- [ ] Milestones: ordered groupings inside a project
- [ ] Tasks: CRUD, subtasks (parent_id), dependencies, recurring (RRULE)
- [ ] Six task views: List, Board (kanban), Table, Calendar, Timeline (Gantt), Cards
- [ ] Drag-drop in board view (dnd-kit) between status columns
- [ ] Drag-drop in timeline view to change dates
- [ ] "My Tasks" cross-project dashboard
- [ ] Comments + @mentions (sends notification)
- [ ] File attachments (placeholder until Phase 7's full File module)
- [ ] Recurring task generator (Inngest cron)
- [ ] Task templates
- [ ] Email-to-task: dedicated inbound address per project (Postmark inbound)

### Files

```
app/(app)/[workspace]/projects/
├── page.tsx                          # all projects
├── new/page.tsx
├── [id]/page.tsx                     # project overview
├── [id]/(views)/board/page.tsx
├── [id]/(views)/list/page.tsx
├── [id]/(views)/timeline/page.tsx
├── [id]/(views)/calendar/page.tsx
├── [id]/files/page.tsx
└── [id]/settings/page.tsx

app/(app)/[workspace]/tasks/
└── page.tsx                          # My Tasks

components/modules/projects/
├── ProjectCard.tsx
├── ProjectForm.tsx
├── ProjectTemplatePicker.tsx
└── ProjectHealthBadge.tsx

components/modules/tasks/
├── TaskBoard.tsx
├── TaskList.tsx
├── TaskTimeline.tsx
├── TaskCalendar.tsx
├── TaskCard.tsx
├── TaskRow.tsx
├── TaskDetailDrawer.tsx
├── TaskForm.tsx
└── TaskComments.tsx

server/services/
├── project.service.ts
└── task.service.ts

lib/workflows/
└── recurringTasks.workflow.ts        # Inngest scheduled function
```

### Acceptance criteria

- [ ] Create project from template — tasks + milestones replicate
- [ ] Drag task between board columns → status updates
- [ ] Drag task in timeline → start/due dates update
- [ ] Recurring task ("every Monday") generates an instance every Monday at 8am workspace time
- [ ] @mention creates a Notification, sends Resend email, surfaces in topbar bell
- [ ] Email-to-task: send to `tasks+abc123@inbound.chiefos.app` → creates task on project abc123
- [ ] Subtask completion increments parent's progress
- [ ] Blocked-by dependency prevents marking blocker incomplete

### Demo

"I clone the 'Web design retainer' template into a new project for Acme. 24 tasks generate. I drag tasks across the kanban, build a timeline, mention Diego. He gets a notification. I send him a task by email — it appears in the right project."

---

## Phase 4 — Proposals & Contracts

**Goal:** PandaDoc/HoneyBook-grade proposals with click-to-sign + multi-party contracts with audit trail.
**Duration:** 3 weeks
**Prereqs:** Phase 2

### Schema

- `Proposal`, `ProposalTemplate`, `ProposalView`, `Contract`, `ContractTemplate`, `ContractSigner`, `ContractField`

### Tasks

- [ ] Proposal builder using Tiptap with custom blocks:
  - text, heading, image, table, divider, columns
  - `pricing-table` (line items with qty, rate, total, optional toggles)
  - `signature` (placeholder for accept-and-sign)
  - `accept-button` (CTA)
  - `video-embed` (Loom, YouTube)
  - `variable` (`{{contact.firstName}}`)
- [ ] Templates library + workspace templates
- [ ] Variable substitution at send time (dehydrate → hydrate)
- [ ] Public proposal view at `/p/[slug]` with:
  - read tracking (per-section)
  - view duration
  - `ProposalView` row per session
  - accept / decline flow with typed name + drawn signature canvas
- [ ] PDF export (Puppeteer with shared print stylesheet)
- [ ] Reminder workflow (Inngest): unviewed at 3 days → email; unsigned at 7 days → email
- [ ] Contracts module mirrors proposals but adds:
  - multi-party signers with sequence
  - field placement editor (drag fields onto pages)
  - field types: signature, initial, text, date, checkbox
  - audit trail capture (IP, UA, timestamp, sequential token verification)
  - finalized PDF with signature + audit trail page, hashed for tamper-evidence
- [ ] Yousign passthrough mode behind a feature flag (legal-grade option)
- [ ] Auto-generate contract from accepted proposal (`proposal.approved` → `createContractFromProposal`)

### Files

```
app/(app)/[workspace]/proposals/
├── page.tsx
├── new/page.tsx
├── templates/page.tsx
├── [id]/page.tsx                     # editor
└── [id]/preview/page.tsx

app/(app)/[workspace]/contracts/
└── ...

app/(public)/p/[slug]/page.tsx        # public proposal viewer
app/(public)/c/[slug]/page.tsx        # public contract viewer
app/(public)/c/[slug]/sign/page.tsx   # signing flow

components/modules/proposals/
├── ProposalEditor.tsx
├── ProposalBlocks/
│   ├── PricingTableBlock.tsx
│   ├── SignatureBlock.tsx
│   ├── AcceptButtonBlock.tsx
│   ├── VariableBlock.tsx
│   └── VideoEmbedBlock.tsx
├── ProposalPreview.tsx
├── ProposalPublicView.tsx            # client-facing
└── SignatureCanvas.tsx

components/modules/contracts/
├── ContractEditor.tsx
├── ContractFieldOverlay.tsx
├── ContractSignerList.tsx
└── ContractAuditTrail.tsx

server/services/
├── proposal.service.ts
├── contract.service.ts
└── pdf.service.ts                    # Puppeteer renderer

lib/workflows/
└── proposalReminders.workflow.ts
```

### Acceptance criteria

- [ ] Build a 3-page proposal with pricing table, send to a test contact
- [ ] Track view event from real browser (sees view in timeline)
- [ ] Client clicks Accept → types name → draws signature → "Approved" page
- [ ] Server generates PDF identical to web view
- [ ] Reminder email sends if unviewed at 3 days
- [ ] Approved proposal fires `proposal.approved` event → contract drafted automatically
- [ ] Two-party contract with sequential signing: signer 1 must sign before signer 2 gets the email
- [ ] Audit page in PDF lists IPs, UAs, timestamps, hash
- [ ] Yousign mode: same flow but legal-grade artifact

### Demo

"I draft a proposal for Acme with a 3-tier pricing table. They view it twice over 4 hours. They accept the middle tier and e-sign. A contract auto-drafts with the same line items. Both parties sign in sequence. Final PDF lands in the deal's files."

---

## Phase 5 — Invoices & Payments

**Goal:** FreshBooks-grade billing fully connected to projects + contacts. Stripe Connect ready for marketplace mode.
**Duration:** 3 weeks
**Prereqs:** Phase 4

### Schema

- `Invoice`, `InvoiceLineItem`, `RecurringInvoice`, `Payment`, `Refund`, `CreditNote`, `TaxRate`

### Tasks

- [ ] Stripe Connect onboarding (Express accounts; falls back to platform account in dev)
- [ ] Invoices: CRUD, draft, send via email + public link
- [ ] Line items: description, qty, rate, tax rate, discount %, total
- [ ] Tax rates: workspace-defined, multi-rate per invoice
- [ ] Currencies: any ISO 4217; FX shown at "approx. USD" via fixer/openexchangerates
- [ ] Discounts: % or flat, item-level or invoice-level
- [ ] Payment plans: split invoice into N scheduled invoices
- [ ] Recurring invoices: weekly/monthly/etc, Inngest cron generates instances
- [ ] Public payment page at `/i/[slug]`:
  - Stripe card + Apple/Google Pay
  - ACH (US)
  - PayMoe
  - "I'll pay another way" → marks pending
- [ ] Stripe webhooks update invoice status; idempotent
- [ ] Refunds + credit notes
- [ ] Auto-mark overdue (Inngest daily job)
- [ ] Reminder schedule: 3-day-before, day-of, +7d, +14d (each email customizable)
- [ ] Convert proposal → invoice (in Phase 4 we created the contract; here we add the invoice path)
- [ ] Convert time entries → invoice (one-click "bill all unbilled time on this project")
- [ ] PDF generation
- [ ] QuickBooks/Xero sync (one-way write at first; flag-gated)

### Files

```
app/(app)/[workspace]/invoices/
├── page.tsx
├── new/page.tsx
├── [id]/page.tsx                     # editor
├── [id]/preview/page.tsx
└── recurring/page.tsx

app/(public)/i/[slug]/page.tsx        # public invoice + payment

app/api/webhooks/stripe/route.ts
app/api/webhooks/quickbooks/route.ts

components/modules/invoices/
├── InvoiceEditor.tsx
├── LineItemsTable.tsx
├── InvoicePreview.tsx
├── InvoicePublicView.tsx
├── InvoicePayBox.tsx
├── RecurringInvoiceForm.tsx
└── PaymentMethodPicker.tsx

server/services/
├── invoice.service.ts
├── payment.service.ts
├── tax.service.ts
└── stripe.service.ts

lib/workflows/
├── recurringInvoices.workflow.ts
├── invoiceReminders.workflow.ts
└── invoiceOverdue.workflow.ts
```

### Acceptance criteria

- [ ] Send invoice → receive in inbox → pay with test card → invoice marked PAID, payment row created, project's `amountPaid` increments
- [ ] Recurring monthly invoice generates next instance on the 1st of next month
- [ ] Overdue email fires on +7 days unpaid
- [ ] Refund full amount → invoice REFUNDED, ledger balanced
- [ ] Convert 12 hours of unbilled time → 1 invoice with one line per task or grouped
- [ ] Stripe webhook idempotent (replay does not double-credit)
- [ ] Multi-currency: invoice in EUR, paid in EUR, recorded as EUR
- [ ] Stripe Connect onboarding completes in <5 minutes for a new workspace

### Demo

"I send a $4,500 invoice. The client pays with Apple Pay on their phone. My phone pings. The deal moves to Won. The project shows fully paid. I set up a $499/mo retainer that auto-bills next month."

---

## Phase 6 — Forms & Schedulers

**Goal:** Typeform + Calendly fully built in. Payment-collecting forms. Round-robin booking.
**Duration:** 2.5 weeks
**Prereqs:** Phase 1, Phase 5

### Schema

- `Form`, `FormSubmission`, `Scheduler`, `Booking`, `CalendarConnection`

### Tasks

- [ ] Form builder (drag-drop, 18 field types, conditional logic, multi-step)
- [ ] Public form pages at `/f/[slug]` with theming + custom CSS
- [ ] Embed code generator (iframe + JS embed with auto-resize)
- [ ] Form-to-contact mapping (which fields map to firstName/email/etc.)
- [ ] Auto-create contact + (optional) deal + project on submit
- [ ] Forms with payment (Stripe Checkout embedded)
- [ ] Spam protection: hCaptcha, honeypot, rate limit, optional email verification
- [ ] Webhooks on submit
- [ ] Schedulers module:
  - One-on-one, round-robin, collective, group
  - Public booking page at `/s/[slug]`
  - Availability rules (weekly + exceptions + advance notice + horizon + max/day)
  - Buffer before/after
  - Time zone aware
  - Custom intake questions
  - Optional payment to book
  - Auto video call link (Google Meet via OAuth, Zoom via OAuth, Whereby via API)
- [ ] Calendar OAuth (Google, Microsoft) — read busy times, write events
- [ ] Two-way calendar sync (push booking → external; pull external blocks)
- [ ] Reminder emails (24h, 1h)
- [ ] Reschedule + cancel via signed token URL
- [ ] Combined form + scheduler flow: intake form → book on submit

### Files

```
app/(app)/[workspace]/forms/
├── page.tsx
├── new/page.tsx
├── [id]/page.tsx
├── [id]/builder/page.tsx
├── [id]/submissions/page.tsx
└── [id]/embed/page.tsx

app/(app)/[workspace]/schedulers/
└── ...

app/(public)/f/[slug]/page.tsx
app/(public)/s/[slug]/page.tsx        # availability picker
app/(public)/s/[slug]/book/page.tsx   # confirm + intake
app/(public)/b/[token]/page.tsx       # manage existing booking

components/modules/forms/
├── FormBuilder.tsx
├── FormField/
│   ├── ShortText.tsx
│   ├── LongText.tsx
│   ├── EmailField.tsx
│   ├── ... (18 types)
├── FormPublicView.tsx
└── ConditionalLogicEditor.tsx

components/modules/schedulers/
├── SchedulerForm.tsx
├── AvailabilityEditor.tsx
├── BookingPagePicker.tsx
└── BookingsList.tsx

server/services/
├── form.service.ts
├── scheduler.service.ts
├── booking.service.ts
└── calendar.service.ts

lib/integrations/
├── googleCalendar.ts
└── microsoftCalendar.ts
```

### Acceptance criteria

- [ ] Build a 5-field form with conditional logic in <5 min
- [ ] Embed it in a Webflow page; submit; see contact created with correct mapping
- [ ] Form with $500 deposit: Stripe Checkout collects, mark paid, creates contact + deal
- [ ] Connect Google Calendar; book a slot from public page; event created on Google + ChiefOS
- [ ] Round-robin scheduler with 3 hosts distributes evenly
- [ ] Cancel booking via email link → calendar event removed both sides
- [ ] Time zone: US client books a 9am London slot from NYC — both calendars show right time

### Demo

"I build a 'Book a strategy call' form on my site. A lead fills it, pays $200, and gets booked into Diego's Tuesday at 2pm. Diego's Google Calendar updates. The contact, deal, payment, and meeting are all linked."

---

## Phase 7 — Time, Files, Inbox, Wiki, Calendar

**Goal:** The remaining table-stakes modules.
**Duration:** 3 weeks
**Prereqs:** Phase 3, Phase 5

### Schema

- `TimeEntry`, `Timesheet`, `Folder`, `File`, `FileShare`, `FileRequest`, `Channel`, `ChannelMember`, `Message`, `MessageReaction`, `MessageAttachment`, `EmailThread`, `EmailMessage`, `WikiPage`

### Tasks

- [ ] Time tracking: start/stop timer, manual entry, idle detection (browser visibilitychange)
- [ ] Timesheets: weekly view, submit, approve, lock
- [ ] Time-to-invoice: bulk action "create invoice from these entries"
- [ ] Files module: folder tree, upload (drag-drop), preview (image/pdf/video), version history
- [ ] File sharing: public link with optional password + expiry + max downloads
- [ ] File requests: client-facing upload page that auto-attaches to a contact
- [ ] Inbox / Channels: 1:1 DMs, group chats, project channels (auto-created), client channels
- [ ] Real-time messages via Supabase Realtime
- [ ] Email integration: connect Gmail/Outlook OAuth → ingest into `EmailThread/EmailMessage` → surface on contact timeline
- [ ] Postmark inbound: dedicated address per workspace; matches sender email → contact, threads on subject
- [ ] Universal Inbox view: all channels + email threads + form submissions in one stream
- [ ] Wiki: nested pages, Tiptap editor, public-to-portal flag
- [ ] Calendar overlay view: bookings + tasks-with-due + project deadlines + external calendars in one canvas

### Files

```
app/(app)/[workspace]/time/
├── page.tsx                          # this week
├── timesheets/page.tsx
└── timesheets/[id]/page.tsx

app/(app)/[workspace]/files/
├── page.tsx
└── folders/[id]/page.tsx

app/(app)/[workspace]/inbox/
├── page.tsx
└── [channelId]/page.tsx

app/(app)/[workspace]/wiki/
├── page.tsx
└── [slug]/page.tsx

app/(app)/[workspace]/calendar/
└── page.tsx

components/modules/time/
├── TimerBar.tsx                      # global persistent timer
├── TimeEntryForm.tsx
├── TimesheetView.tsx
└── TimeToInvoiceDialog.tsx

components/modules/files/
├── FolderTree.tsx
├── FileGrid.tsx
├── FileUpload.tsx                    # multipart with progress
├── FilePreview.tsx
└── FileShareDialog.tsx

components/modules/inbox/
├── ChannelList.tsx
├── MessageList.tsx
├── MessageInput.tsx
├── EmailThreadView.tsx
└── UniversalInbox.tsx

components/modules/wiki/
├── WikiSidebar.tsx
└── WikiPageEditor.tsx

server/services/
├── timeEntry.service.ts
├── timesheet.service.ts
├── file.service.ts
├── channel.service.ts
├── message.service.ts
├── email.service.ts
└── wikiPage.service.ts
```

### Acceptance criteria

- [ ] Start timer → 30 min later, stop → entry saved to right project + task
- [ ] Submit timesheet → manager approves → locked
- [ ] Bill 8 unbilled hours from this week into one invoice in 3 clicks
- [ ] Drag-drop 50MB file → upload progress → preview in browser
- [ ] Real-time message between two users in the same channel (typing indicator + delivery)
- [ ] Connect Gmail; new email from a known contact appears in their timeline within 60s
- [ ] Inbound email to `support@chiefos-tenant.app` creates an EmailThread on the matching contact
- [ ] Wiki page tree with 3 levels deep loads in <500ms

### Demo

"I track 4 hours on Acme's project. I bill it in one click. I share their Q4 brand assets via a password-protected link. I message Diego about a question on the project. I email the client from inside the app — the reply lands on their CRM record automatically."

---

## Phase 8 — Client Portal & White-Label

**Goal:** Branded client portal where customers see their projects, invoices, files, contracts, messages — all on your custom domain.
**Duration:** 2 weeks
**Prereqs:** Phases 3–7

### Schema additions

- (No new tables; uses `Membership.role = CLIENT`, `WorkspaceDomain`, `Contact`)

### Tasks

- [ ] Client invitation flow: send a contact a magic-link invite to portal
- [ ] Dedicated portal layout with separate routes under `/(portal)/`
- [ ] Per-client visibility scoping (a client only sees their projects, contracts, invoices, files, messages)
- [ ] Client can: view projects (status only), pay invoices, sign contracts, upload requested files, message the team, fill forms, book meetings
- [ ] Branding system:
  - Logo, favicon, colors as workspace settings
  - CSS variables driven by workspace tokens (no hard-coded colors anywhere)
  - "Hide branding" toggle (Pro+)
  - Custom CSS (Pro+)
- [ ] Custom domain: CNAME, automated SSL via Cloudflare for SaaS or Vercel domains API
- [ ] Custom email sending domain: DKIM + SPF setup wizard, Resend domain verification
- [ ] Multi-language portal (i18n with next-intl, 12 languages at launch)

### Files

```
app/(portal)/
├── layout.tsx                        # portal-specific shell
├── page.tsx                          # dashboard
├── projects/page.tsx
├── projects/[id]/page.tsx
├── invoices/page.tsx
├── invoices/[id]/page.tsx
├── contracts/page.tsx
├── contracts/[id]/page.tsx
├── files/page.tsx
├── messages/page.tsx
├── settings/page.tsx
└── (auth)/sign-in/page.tsx

middleware.ts                         # route portal hostnames to (portal) routes

components/modules/portal/
├── PortalShell.tsx
├── PortalDashboard.tsx
├── BrandingProvider.tsx              # injects CSS vars
└── ...

server/services/
└── portalAccess.service.ts

lib/branding/
├── tokens.ts                         # generates CSS variables from workspace
└── domains.ts                        # custom domain mgmt
```

### Acceptance criteria

- [ ] Client opens magic-link → lands on their branded portal with workspace logo + colors
- [ ] Client can pay an invoice from portal
- [ ] Client signs a contract from portal
- [ ] Client uploads files in response to a file request → attached to their contact
- [ ] Workspace owner sets custom domain `clients.acme.com` → SSL active in <5 minutes
- [ ] "Hide branding" hides all ChiefOS mentions in portal + emails
- [ ] Switching workspace locale changes portal language

### Demo

"I send Acme an invite. They land on `clients.youragency.com` with my logo and colors — no ChiefOS branding anywhere. They see their two active projects, pay an outstanding invoice, sign the renewal contract, and message me."

---

## Phase 9 — Workflows Engine

**Goal:** Visual no-code workflow builder. Replaces Zapier for in-platform automations.
**Duration:** 3 weeks
**Prereqs:** all previous

### Schema

- `Workflow`, `WorkflowRun`

### Tasks

- [ ] Workflow definition schema (versioned, validated by zod)
- [ ] Visual builder using React Flow:
  - Trigger nodes
  - Action nodes
  - Branching (if/else)
  - Wait/delay nodes
  - Loop nodes (for-each)
- [ ] Trigger types (≥30): contact.created, contact.tagged, deal.stage_changed, deal.won, deal.lost, proposal.sent, proposal.viewed, proposal.signed, contract.signed, invoice.sent, invoice.paid, invoice.overdue, payment.received, project.created, project.completed, task.completed, task.assigned, form.submitted, booking.created, booking.canceled, time.tracked, message.received, file.uploaded, scheduled (cron), webhook (HTTP), manual (button)
- [ ] Action types (≥50): send email, send SMS, create contact, update contact, add tag, remove tag, create task, create project, create invoice, send invoice, change deal stage, send Slack message, post to webhook, wait, branch, create note, schedule meeting, enroll in sequence, increment counter
- [ ] Compile workflow JSON → Inngest function spec at runtime
- [ ] Run history view with step-by-step inspection
- [ ] Retry failed runs manually
- [ ] Templates library (seed with 30 common automations)

### Files

```
app/(app)/[workspace]/workflows/
├── page.tsx
├── new/page.tsx
├── templates/page.tsx
├── [id]/page.tsx
├── [id]/builder/page.tsx
└── [id]/runs/page.tsx

components/modules/workflows/
├── WorkflowCanvas.tsx                # React Flow
├── TriggerNode.tsx
├── ActionNode.tsx
├── BranchNode.tsx
├── WaitNode.tsx
├── NodePropertiesPanel.tsx
├── RunHistoryView.tsx
└── WorkflowTemplateGallery.tsx

server/services/
├── workflow.service.ts
└── workflowRunner.service.ts         # interprets the spec → Inngest

lib/workflows/
└── runner/
    ├── triggers/                     # one file per trigger type
    └── actions/                      # one file per action type
```

### Acceptance criteria

- [ ] Build "When invoice paid → wait 3 days → send thank-you email + create upsell task" — runs end-to-end
- [ ] Branch: "If deal value > $5k → notify Sarah; else → notify Mike"
- [ ] For-each: "When project completed → for each line item → create satisfaction survey"
- [ ] Failed run shows the failing step with full input/output
- [ ] Retry from failed step works
- [ ] Cron trigger fires nightly at 9am workspace time

### Demo

"I build a workflow visually: when a new lead form submits, tag them, send a welcome email, wait 2 days, send a follow-up, and notify the owner. I see real runs flow through with inputs and outputs at each step."

---

## Phase 10 — Moe (Super Work AI)

**Goal:** The differentiator. Voice-to-text everywhere. Voice-to-action via "Hey Moe." Agentic execution across every module.
**Duration:** 4 weeks
**Prereqs:** all previous

### Schema

- `AiConversation`, `AiMessage`, `AiToolCall`, `AiMemory`, `SearchDocument`

### Tasks

- [ ] Tool registry: every module exposes typed tools
  - Contacts: search, create, update, tag, untag, delete
  - Deals: search, create, update, move-stage, mark-won, mark-lost
  - Proposals: draft, send, copy
  - Contracts: draft from proposal, send for signature
  - Invoices: create, send, mark-paid, refund, draft from time
  - Projects: create, complete, archive
  - Tasks: create, assign, complete, defer
  - Forms: list, get-submissions, summarize
  - Schedulers: list-availability, create-booking
  - Time: start-timer, stop-timer, log-entry
  - Files: search, share-link, request-from-client
  - Inbox: send-message, draft-reply, summarize-thread
  - Workflows: trigger
  - Reports: query (natural language → SQL via guarded layer)
  - Calendar: find-time, schedule
  - ~120 tools total
- [ ] Permission-aware tool filtering at planner kickoff
- [ ] Confirmation gate for destructive/external actions (configurable per tool per user)
- [ ] Anthropic tool-use loop with streaming UI updates
- [ ] Voice-to-text:
  - Push-to-talk button in every Tiptap editor (and any input via portal)
  - Deepgram streaming STT
  - Claude polish pass to clean up "ums" and match user's voice profile
- [ ] Voice-to-action:
  - Global hotkey (Cmd+Shift+P)
  - Mobile: "Hey Moe" wake word (using Picovoice on-device)
  - Always-listening mode opt-in
- [ ] Sidebar agent panel: page-aware context (knows what entity you're looking at)
- [ ] Inline AI buttons in every editor: improve, shorten, expand, translate, change tone
- [ ] Memory layer:
  - Per-conversation messages
  - Per-user vector store of past interactions + key facts
  - Per-workspace vector store of notes, messages, files, proposals
  - Top-K retrieval at planner kickoff
- [ ] Voice profile training: scrape last 100 emails/messages → build voice fingerprint
- [ ] Meeting recorder bot (Recall.ai integration): joins Zoom/Meet → transcript → summary → CRM note + action items
- [ ] AI-generated proposals from a brief
- [ ] AI-drafted email replies in user's voice
- [ ] Document Q&A: ask any contract/proposal/wiki page anything
- [ ] Smart custom fields ("AI: classify industry from email domain")
- [ ] Token budget UI: show remaining credits per workspace
- [ ] Audit log entry for every Moe write action

### Files

```
app/(app)/[workspace]/moe/
├── page.tsx                          # full chat
└── settings/page.tsx                 # voice profile, no-confirm tools

components/modules/moe/
├── MoeSidebar.tsx
├── MoeChat.tsx
├── MoeMessage.tsx
├── MoeToolCallCard.tsx               # streaming tool execution UI
├── MoeConfirmDialog.tsx
├── VoiceButton.tsx                   # everywhere there's text input
├── VoiceModeOverlay.tsx              # full-screen voice UI on mobile
└── AiInlineActions.tsx               # improve/shorten/translate buttons

lib/ai/
├── tools/
│   ├── index.ts                      # tool registry export
│   ├── contacts.tools.ts
│   ├── deals.tools.ts
│   ├── proposals.tools.ts
│   ├── contracts.tools.ts
│   ├── invoices.tools.ts
│   ├── projects.tools.ts
│   ├── tasks.tools.ts
│   ├── forms.tools.ts
│   ├── schedulers.tools.ts
│   ├── time.tools.ts
│   ├── files.tools.ts
│   ├── inbox.tools.ts
│   ├── workflows.tools.ts
│   ├── calendar.tools.ts
│   └── reports.tools.ts
├── planner.ts                        # the main loop
├── memory.ts                         # vector store wrapper
├── voiceProfile.ts                   # tone analyzer
├── prompts/
│   ├── system.ts
│   ├── voicePolish.ts
│   ├── emailDraft.ts
│   ├── proposalDraft.ts
│   └── meetingSummary.ts
└── adapters/
    ├── deepgram.ts
    ├── elevenlabs.ts
    └── recall.ts                      # meeting bot

server/services/
└── ai.service.ts
```

### Acceptance criteria

- [ ] "Hey Moe, send Sarah the website proposal" — drafts, confirms, sends
- [ ] "Moe, invoice Acme $4,500 for last week's work" — bills unbilled time entries on the project, sends invoice
- [ ] "Show me overdue invoices and draft chase emails" — lists, drafts each in user's tone, awaits batch approve
- [ ] Voice-to-text in any editor produces clean text matching user's tone
- [ ] Recorded Zoom call → transcript → summary appears on the deal/contact + 3 action-item tasks
- [ ] AI proposal generation from a 1-line brief produces a complete on-brand draft
- [ ] Permission test: a CONTRACTOR cannot trigger a Moe tool that would charge a card
- [ ] Confirmation flow for "delete invoice" — user clicks confirm → executes → audit logged
- [ ] Token budget enforced; nice fallback when exhausted

### Demo (THE LAUNCH DEMO)

_Single uncut take, voice-only:_
"Hey Moe, Acme just signed the proposal — kick off the project."
→ Moe: "I'll create the project from the website-redesign template, send the contract to John, draft the kickoff invoice for the 50% deposit, and book a kickoff call. Want me to suggest a time?"
→ "Yeah, find Sarah a 30-min slot Thursday afternoon."
→ Moe does it. All four things appear in the UI. Total elapsed: 35 seconds.

---

## Phase 11 — Mobile, Integrations, Marketplace, Polish

**Goal:** Ecosystem and reach.
**Duration:** ongoing — V2 launch milestone
**Prereqs:** Phases 0–10

### Tasks

- [ ] Expo / React Native app sharing tRPC client
- [ ] Native push notifications
- [ ] Voice-first mobile UX: large mic button, "Hey Moe" listener, transcript display
- [ ] Offline mode for read paths (cache contacts, projects, tasks)
- [ ] Native integrations: Google Workspace, Microsoft 365, Slack, Zoom, Loom, Notion, GitHub, QuickBooks, Xero
- [ ] Public REST + GraphQL API
- [ ] Webhooks system polish (retry curve, signing key rotation, deliveries dashboard)
- [ ] Zapier app (private at first, public at GA)
- [ ] Templates marketplace: proposals, contracts, forms, projects, workflows
  - Submit → review → publish
  - Revenue share with creators (Stripe Connect to creator)
- [ ] SOC 2 readiness: audit log retention, encryption-at-rest review, vendor list, BCP/DR plan
- [ ] Status page (BetterUptime or self-hosted)

### Acceptance criteria

- [ ] Mobile app on App Store + Play Store with the 8 most-used flows
- [ ] Public docs at `docs.chiefos.app` with API reference
- [ ] At least 50 templates live in marketplace
- [ ] At least 5 SOC 2 controls implemented and documented

---

## How to use this file with Claude Code

For each phase:

1. Read `CLAUDE.md` and the relevant phase here.
2. Open a new Claude Code session in your repo with this file plus `SCHEMA.md` in context.
3. Say: _"We're starting Phase X. Read PHASES.md section for Phase X, confirm the schema in SCHEMA.md is current, then build it task-by-task. Run migrations, write tests, commit each task as a separate atomic commit. Stop after each acceptance criterion is verified."_
4. Review every commit. Don't sleep on the audit log.
5. After all acceptance criteria green: cut a release, deploy, demo, then move to the next phase.

---

## What changes when

- **Schema changes** require this file _and_ `SCHEMA.md` _and_ `prisma/schema.prisma` to all update in the same PR.
- **Phase scope changes** require updating this file before any commits in the new direction. Don't drift quietly.
- **Adding a new module** = add it as Phase 12+ rather than wedging into an existing phase mid-build.

---

## Done definition (every phase)

- All acceptance criteria pass
- E2E tests cover the phase's money path
- Activity + Audit logs verified for every mutation
- Permission tests written for every role
- Moe tool registered (from Phase 10 onward)
- Performance budget held: TTI <2s, page weight <200KB gz
- Demo video recorded (3 min max)
- Changelog entry written
- README + docs updated

When all of those are green, then — and only then — Phase X is **shipped**.
