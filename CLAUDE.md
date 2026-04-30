# CLAUDE.md

> Read this first. Every session. No exceptions.
> This file is the operating manual for any AI coder working on **ChiefOS**.

---

## 1. What you're building

ChiefOS is an AI-native, all-in-one Business OS that replaces 8–12 SaaS tools (CRM, sales pipeline, proposals, contracts, invoices, projects, tasks, forms, scheduling, time tracking, client portal, inbox) with one connected system. The differentiator is **Moe** — an agentic AI layer with voice-to-action that operates every module via tool calls.

**Read these next:**
- `SCHEMA.md` — full data model (single source of truth for the DB)
- `PHASES.md` — the build roadmap (which phase you're in, what ships in this phase, what doesn't)

**The single most important rule:** if a feature isn't in the current phase, **don't build it**. We ship in phases. Scope creep is the only thing that kills this.

---

## 2. Tech stack — locked

```
Frontend         Next.js 14 (App Router) · TypeScript strict · React Server Components
Styling          Tailwind CSS · shadcn/ui · Radix primitives · cva for variants
Forms            react-hook-form + zod
State            TanStack Query (server) · Zustand (client UI state)
Editor           Tiptap (rich text + custom blocks for proposals/contracts)
Drag/drop        dnd-kit
Realtime         Supabase Realtime
Icons            lucide-react

API              tRPC (mutation/query layer)  +  Next.js Route Handlers (webhooks/public endpoints)
DB               PostgreSQL (Supabase) · Prisma ORM
Auth             Clerk
Files            Supabase Storage
Search           Postgres full-text + pg_trgm; pgvector for semantic
Cache/Queue      Upstash Redis
Workflows        Inngest (durable execution)
Cron             Inngest scheduled functions

Payments         Stripe · Stripe Connect for marketplaces
Email            Resend (transactional) · Postmark (inbound parsing)
SMS/Voice        Twilio
STT              Deepgram (real-time) · Whisper (batch)
TTS              ElevenLabs

AI               Anthropic Claude (claude-opus-4-7 for Moe planning, claude-sonnet-4-6 for cheap calls)
Embeddings       OpenAI text-embedding-3-small (cheap, good enough)
Vector DB        pgvector

Hosting          Vercel (web) · Supabase (DB + storage) · Upstash (Redis) · Inngest (workflows)
Self-host        Oracle Cloud ARM + Coolify (parity build target)

Observability    Sentry · Axiom · PostHog
Testing          Vitest (unit) · Playwright (e2e)
```

**Do not introduce a new dependency without justifying it in the PR description.** "Saw it on Twitter" is not justification.

---

## 3. Folder structure

```
/
├── apps/
│   ├── web/                      # Next.js 14 app
│   │   ├── app/
│   │   │   ├── (marketing)/      # public marketing pages
│   │   │   ├── (auth)/           # sign-in, sign-up
│   │   │   ├── (app)/            # authed app — workspace-scoped
│   │   │   │   ├── [workspace]/
│   │   │   │   │   ├── contacts/
│   │   │   │   │   ├── deals/
│   │   │   │   │   ├── projects/
│   │   │   │   │   ├── proposals/
│   │   │   │   │   ├── invoices/
│   │   │   │   │   └── ...
│   │   │   ├── (portal)/         # client portal — separate layout
│   │   │   ├── api/              # webhooks + public REST
│   │   │   └── trpc/             # tRPC HTTP handler
│   │   ├── components/
│   │   │   ├── ui/               # shadcn/ui primitives
│   │   │   ├── modules/          # feature components (contacts, deals, etc.)
│   │   │   └── layout/           # shells, sidebars, nav
│   │   ├── lib/
│   │   │   ├── ai/               # Moe: tools, planner, memory, prompts
│   │   │   ├── auth/             # clerk helpers, session, RBAC
│   │   │   ├── db/               # prisma client + helpers
│   │   │   ├── workflows/        # inngest functions
│   │   │   ├── integrations/     # stripe, resend, twilio, deepgram, etc.
│   │   │   └── utils/
│   │   ├── server/
│   │   │   ├── trpc/
│   │   │   │   ├── routers/      # one router per module
│   │   │   │   ├── trpc.ts       # init + middleware
│   │   │   │   └── context.ts
│   │   │   └── services/         # business logic, called by trpc + workflows + Moe
│   │   └── middleware.ts         # tenant resolution, auth gate
│   └── mobile/                   # Expo (Phase 11)
│
├── packages/
│   ├── db/                       # prisma schema + migrations + seed
│   │   └── prisma/
│   │       └── schema.prisma
│   ├── shared/                   # types, zod schemas, constants used by web + mobile
│   ├── emails/                   # react-email templates
│   └── ui/                       # shared component primitives (if mobile reuse needed)
│
├── CLAUDE.md                     # ← you are here
├── SCHEMA.md
├── PHASES.md
└── README.md
```

**Rules:**
- One router per module in `server/trpc/routers/` (e.g. `contacts.ts`, `deals.ts`)
- Business logic lives in `server/services/` so it's reusable from tRPC, workflows, and Moe tools
- Components grouped by module under `components/modules/<module>/`
- No business logic in components. Components consume hooks; hooks call tRPC

---

## 4. Database conventions

### Multi-tenancy is non-negotiable
- **Every row has `workspaceId`.** No exceptions.
- Use Supabase RLS policies as a defense-in-depth backstop. Trust the application layer first; let RLS save you when you mess up.
- The first thing every tRPC procedure does is verify the caller can access the workspace.

### Naming
- Models: `PascalCase` singular (`Contact`, `Invoice`, `TimeEntry`)
- Fields: `camelCase` (`firstName`, `dueDate`, `workspaceId`)
- Enums: `PascalCase` enum, `SCREAMING_SNAKE_CASE` values
- Relation arrays: plural (`contacts`, `tasks`)
- FKs always end in `Id` (`contactId`, `workspaceId`)
- Booleans always start with `is`/`has`/`can` (`isBillable`, `hasSignature`)

### Money
- **Always store as `Decimal(12, 2)`.** Never floats. Never cents-as-Int unless you're matching Stripe's API at the boundary.
- Always paired with a `currency` field (ISO 4217: USD, EUR, GBP).
- Conversions happen at display time, not storage time.

### Timestamps
- Every model has `createdAt` (default `now()`) and `updatedAt` (`@updatedAt`).
- All timestamps stored as UTC.
- Display in user's timezone (read from `User.timezone` or `Workspace.timezone`).

### Soft delete
- For Contacts, Deals, Projects, Invoices — use `deletedAt` nullable timestamp.
- Default queries filter `deletedAt: null` via Prisma middleware.
- Hard delete only for spam/legal/explicit user request.

### Custom fields
- One `customFields Json` column per model that supports them.
- Schema definitions live in a separate `CustomFieldDef` table per workspace.
- Validate against the schema at the service layer before write.

### Indexing
- Index `workspaceId` on every multi-tenant table.
- Composite indexes for common queries: `@@index([workspaceId, status])`, `@@index([workspaceId, ownerId])`.
- Don't over-index. Add when slow queries show up in Axiom.

---

## 5. API conventions (tRPC)

### Router structure

```ts
// server/trpc/routers/contacts.ts
export const contactsRouter = createTRPCRouter({
  list: workspaceProcedure
    .input(listContactsSchema)
    .query(({ ctx, input }) => contactsService.list(ctx, input)),

  get: workspaceProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => contactsService.get(ctx, input.id)),

  create: workspaceProcedure
    .input(createContactSchema)
    .mutation(({ ctx, input }) => contactsService.create(ctx, input)),

  update: workspaceProcedure
    .input(updateContactSchema)
    .mutation(({ ctx, input }) => contactsService.update(ctx, input)),

  delete: workspaceProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => contactsService.delete(ctx, input.id)),
});
```

### Middleware tiers

```ts
publicProcedure       // unauth — landing pages, public proposals/invoices
protectedProcedure    // requires Clerk session
workspaceProcedure    // requires session + active workspace + membership
roleProcedure(role)   // requires specific role
```

`workspaceProcedure` injects `ctx.workspace`, `ctx.membership`, `ctx.user` and verifies access.

### Inputs and outputs
- Every input parsed by zod. Reuse zod schemas from `packages/shared/`.
- Never trust the client. Validate at the boundary.
- Return Prisma types directly when possible. Avoid mapping layers unless you need to hide fields.

### Errors
- Throw `TRPCError` with proper code: `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `BAD_REQUEST`, `CONFLICT`, `INTERNAL_SERVER_ERROR`.
- Include a user-friendly `message`. The client surfaces it directly in toasts.
- Log to Sentry on `INTERNAL_SERVER_ERROR`. Don't log expected 4xx errors.

### Side effects
- Every mutation writes an `Activity` row.
- Sensitive mutations write an `AuditLog` row (financial, permission, deletion).
- Heavy side effects (sending email, generating PDF, calling AI) go through Inngest events, not awaited inline.

---

## 6. Auth & permissions

- **Clerk** handles identity (sign in, sign up, MFA, passwordless).
- ChiefOS handles workspace-level membership and roles.
- A user can belong to N workspaces. Active workspace is in the URL path: `/[workspaceSlug]/...`.

### RBAC pattern

```ts
// lib/auth/permissions.ts
export const can = (membership: Membership, action: Action, resource: Resource) => {
  // Owner can do anything
  if (membership.role === 'OWNER') return true;
  // Admins can do anything except billing/settings/destructive workspace ops
  if (membership.role === 'ADMIN' && !ADMIN_BLOCKED.includes(action)) return true;
  // Members default
  if (membership.role === 'MEMBER') return MEMBER_ALLOWED.includes(action);
  // Contractors: scoped to assigned projects
  if (membership.role === 'CONTRACTOR') return contractorCan(membership, action, resource);
  // Clients: only their own portal data
  if (membership.role === 'CLIENT') return clientCan(membership, action, resource);
  return false;
};
```

- Every service-layer call verifies permission before action.
- UI hides what the user can't do, but never trusts the UI for security.

---

## 7. AI / Moe integration

### Tool registry

Every Moe-callable action is registered in `lib/ai/tools/`:

```ts
// lib/ai/tools/contacts.ts
export const contactsTools = [
  defineTool({
    name: 'search_contacts',
    description: 'Find contacts by name, email, company, tag, or any field',
    input: z.object({ query: z.string(), limit: z.number().max(20).default(10) }),
    permission: 'contacts:read',
    execute: async (ctx, input) => contactsService.search(ctx, input),
  }),
  defineTool({
    name: 'create_contact',
    description: 'Create a new contact record',
    input: createContactSchema,
    permission: 'contacts:write',
    requiresConfirmation: false,
    execute: async (ctx, input) => contactsService.create(ctx, input),
  }),
  // ...
];
```

### Planner loop (lib/ai/planner.ts)

```
1. Receive user input (text or transcript)
2. Build context: workspace state, recent activity, current page, user role
3. Send to Claude with available tools (filtered by permission)
4. Receive tool_use blocks
5. For destructive/irreversible tools → confirm with user
6. Execute tool with permission check
7. Stream tool_result back to Claude
8. Loop until Claude returns plain text or stop_reason === 'end_turn'
9. Persist conversation + every tool call to AiConversation/AiToolCall
10. Write Activity row tagged actorId='moe' with userId for attribution
```

### Rules
- **Read tools** can run freely. **Write tools** that send/charge/delete confirm by default.
- Use `claude-opus-4-7` for the top-level planner. Drop to `claude-sonnet-4-6` for in-tool sub-tasks (drafting, summarizing).
- Always pass `tool_use_id` correctly through the loop.
- Stream UI updates per tool call so the user sees progress.
- Hard-cap iterations at 10. After 10, return to user with what we have.
- Token budget enforced per workspace per month. Surface remaining clearly.

### Memory
- Per-conversation: in the messages array.
- Per-user: pgvector store of past conversations + key facts.
- Per-workspace: pgvector store of notes, messages, files, proposals.
- Inject top-K relevant docs into the system prompt at planner kickoff.

### Voice
- Push-to-talk button + global hotkey + "Hey Moe" wake word (mobile only initially).
- Deepgram streaming STT for low latency.
- Voice-to-text mode: transcript → Claude polishes → injected at cursor.
- Voice-to-action mode: transcript → planner loop.

---

## 8. Component conventions

### Server vs client
- Default to **Server Components**. Fetch data server-side via tRPC server caller.
- Mark `"use client"` only when you need state, effects, or browser APIs.
- Drop client islands (forms, dnd, charts) inside server pages.

### shadcn/ui usage
- Always start from a shadcn primitive when one exists. Don't reinvent.
- Customize via Tailwind classes + `cva` variants, never by editing the primitive.
- Group related primitives into module-level compound components (e.g. `<ContactCard />`).

### Forms
- **Always** `react-hook-form + zodResolver`.
- Reuse the same zod schema as the tRPC input — share via `packages/shared/`.
- Errors render inline; submit button disabled while pending.
- Optimistic updates for fast feedback; rollback on mutation error.

### Loading + empty + error states
- Every list view has all four: loading, empty, error, success.
- Use `Skeleton` from shadcn for loading.
- Empty states have a clear primary action.

### Accessibility
- All interactive elements keyboard-reachable.
- `aria-label` on icon-only buttons.
- Focus rings visible.
- Color contrast meets WCAG AA.
- Test with VoiceOver / NVDA before marking a feature done.

### Design quality
- Look at frontend-design skill standards. ChiefOS is premium — Linear/Notion/Stripe-grade, not Plutio-grade.
- Spacing on 4px grid. Type scale from a single source. Color tokens via CSS variables for theming + white-label.
- Animations: 150–250ms ease-out. Don't animate layout. Use `transform` and `opacity`.
- Dark mode is first-class, not an afterthought.

---

## 9. Workflows (Inngest)

- One file per workflow in `lib/workflows/`.
- Triggered by events: `app/contact.created`, `app/invoice.paid`, `app/proposal.signed`.
- Steps are durable (`step.run`, `step.sleep`, `step.waitForEvent`).
- Failures retry automatically; surface to user dashboard if exceeded.
- Visual workflow builder compiles user-defined flows to Inngest function specs stored as JSON; runtime interprets that spec.

---

## 10. Testing

- **Unit**: Vitest. Cover service layer thoroughly. Mock Prisma with `vitest-mock-extended`.
- **E2E**: Playwright. Cover the critical money paths: signup, create proposal, sign, pay, generate project.
- Don't unit-test components. Test behavior via Playwright.
- CI runs all tests on PR. No merge with red CI.
- Snapshot tests are banned. They give false confidence.

---

## 11. Performance

- **Server Components by default** — minimize client JS.
- **Suspense boundaries** at the right granularity for streaming.
- **N+1 prevention** — use Prisma's `include` carefully; prefer explicit selects.
- **Pagination on every list** — cursor-based, not offset.
- **Debounce** all search inputs at 300ms.
- **Image** with next/image, always sized.
- **Bundle budget** — page bundles under 200KB gzipped. Run `next build` and check.

---

## 12. Security

- **Never** log PII, tokens, payment data, or customer content.
- **Always** verify webhook signatures (Stripe, Clerk, Inngest, etc.).
- **CSRF** via tRPC's built-in protections + same-site cookies.
- **Rate-limit** every public endpoint (Upstash Ratelimit).
- **Input sanitization** at every boundary (zod parses, html escaped, file uploads scanned).
- **Secrets** in env only. Never committed. Use Vercel envs in prod.
- **Sentry scrubs** PII in error reports — verify the integration config.
- **GDPR**: support data export + deletion at the workspace and user level.
- **SOC 2-ready logging**: AuditLog table is append-only.

---

## 13. Git & PR conventions

- Branch off `main`: `feat/contacts-bulk-actions`, `fix/invoice-pdf-render`, `refactor/services-layer`.
- Commit messages: imperative, present tense (`add bulk delete to contacts`, not `added` or `adds`).
- PR title = "what changed" in plain English. PR body = "why + how to test".
- Squash-merge to keep `main` linear.
- Conventional commits optional but encouraged for auto-changelogs.

---

## 14. ❌ NEVER

1. Never write code that bypasses workspace scoping.
2. Never store passwords, tokens, or card data in our DB. Use Clerk + Stripe.
3. Never use floats for money.
4. Never `await` a long-running side effect inline. Inngest event it.
5. Never call OpenAI/Anthropic from a Server Component on the request path. Background job.
6. Never inline-style a component. Tailwind only.
7. Never use `any` in TypeScript. Prefer `unknown` and narrow.
8. Never `console.log` in committed code. Use the logger (Axiom).
9. Never trust user input. Zod everything.
10. Never skip the migration step. Schema changes go through `prisma migrate dev`.
11. Never delete data without a soft-delete or audit trail.
12. Never let Moe execute write actions without permission verification.
13. Never ship a feature that's not in the current phase (see `PHASES.md`).
14. Never hand-roll auth. Clerk handles it.
15. Never edit `node_modules`. Patch via `patch-package` if you must.
16. Never use `useEffect` to fetch data. Use TanStack Query / Server Components.
17. Never disable TypeScript strict mode for "speed".

---

## 15. ✅ ALWAYS

1. Always read `PHASES.md` before starting work — confirm scope.
2. Always start with the schema change. Migration before code.
3. Always write the service layer first, then tRPC, then UI.
4. Always include loading + empty + error states.
5. Always handle the unauthorized + forbidden cases explicitly.
6. Always write a workflow row when something asynchronous starts.
7. Always test the money paths (proposals, contracts, invoices, payments) E2E before merging.
8. Always honor the user's timezone, currency, and locale.
9. Always check `ctx.workspace.planId` before exposing gated features.
10. Always document non-obvious decisions inline with `// why:` comments.
11. Always design for white-label first — no hardcoded colors, logos, or product names in UI.
12. Always degrade gracefully when AI is down or rate-limited.
13. Always confirm destructive Moe actions with the user.
14. Always treat the Activity log as the source of truth for "what happened."
15. Always verify the schema in `SCHEMA.md` matches `schema.prisma` after migration.

---

## 16. When you're unsure

1. **Re-read this file.** Most answers are here.
2. **Check `SCHEMA.md`** for data questions.
3. **Check `PHASES.md`** for scope questions.
4. **Look at an analogous module already built** for pattern questions. Mirror it.
5. **Ask** in the PR description before writing the wrong thing for two days.

When two patterns conflict in the existing codebase, the **newer** one wins. Refactor older instances toward the new one as you touch them.

---

## 17. Useful commands

```bash
# Dev
pnpm dev                          # all apps in parallel via turborepo
pnpm web                          # just the web app

# DB
pnpm db:migrate                   # create + apply a migration
pnpm db:push                      # push schema without migration (local only)
pnpm db:studio                    # open Prisma Studio
pnpm db:seed                      # seed dev data
pnpm db:reset                     # nuke + reseed (NEVER on prod)

# Type-check + lint + format
pnpm check                        # tsc --noEmit + eslint + prettier check
pnpm fix                          # eslint --fix + prettier --write

# Test
pnpm test                         # vitest
pnpm test:e2e                     # playwright
pnpm test:e2e:ui                  # playwright UI mode

# Inngest
pnpm inngest:dev                  # local Inngest dev server

# Build
pnpm build                        # production build
pnpm analyze                      # bundle analyzer

# AI tools
pnpm ai:tools                     # regenerate the Moe tool registry types
```

---

## 18. The bar

Every line of code should pass: *"would a senior engineer at Linear or Stripe ship this?"*

If the answer is no, it's not done.

This is a premium product. The implementation has to match.
