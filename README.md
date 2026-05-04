# ChiefOS

AI-native, all-in-one Business OS. One connected system replacing 8–12 SaaS tools (CRM, sales pipeline, proposals, contracts, invoices, projects, tasks, forms, scheduling, time tracking, client portal, inbox). The differentiator is **Moe** — an agentic AI layer with voice-to-action that operates every module via tool calls.

> **Read these first, every session:** [`CLAUDE.md`](./CLAUDE.md), [`SCHEMA.md`](./SCHEMA.md), [`PHASES.md`](./PHASES.md).

## Stack

Next.js 14 (App Router) · TypeScript strict · Tailwind · shadcn/ui · tRPC · Prisma · Postgres (Supabase) · Clerk · Inngest · Stripe · Resend · Anthropic Claude · OpenAI embeddings · pgvector. Hosted on Vercel + Supabase + Upstash + Inngest.

## Layout

```
apps/
  web/                 # Next.js 14 app
packages/
  db/                  # Prisma schema + client
  shared/              # zod schemas, types, constants
  emails/              # react-email templates
```

## Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Copy and fill env
cp .env.example .env.local

# 3. Generate Prisma client + apply migrations
pnpm db:generate
pnpm db:migrate

# 4. Seed dev data
pnpm db:seed

# 5. Run the app
pnpm web
```

### Baselining an existing database

If your dev or production DB was provisioned with `prisma db push` before
migrations existed, mark the initial migration as already applied so Prisma
doesn't try to re-run it:

```bash
cd packages/db
pnpm exec prisma migrate resolve --applied 0_init
pnpm exec prisma migrate deploy   # applies any newer migrations (e.g. 1_pg_trgm_indexes)
```

After that, the canonical workflow is `pnpm db:migrate` for every schema
change. **Do not use `pnpm db:push` against a database with migration
history** — it will diverge.

## Daily commands

```bash
pnpm dev              # all apps in parallel
pnpm web              # just the web app
pnpm check            # tsc + eslint + prettier
pnpm fix              # eslint --fix + prettier --write
pnpm test             # vitest
pnpm test:e2e         # playwright
pnpm db:studio        # Prisma Studio
pnpm inngest:dev      # local Inngest dev server
```

## Build phases

We ship in 12 numbered phases. **Don't build outside the current phase.** See [`PHASES.md`](./PHASES.md).

| Phase | Scope                                                |   Status   |
| ----: | ---------------------------------------------------- | :--------: |
|     0 | Foundation: monorepo, auth, multi-tenancy, app shell | ✅ shipped |
|     1 | CRM Core: contacts, companies, tags, custom fields   | ✅ shipped |
|     2 | Pipeline & Deals                                     | ✅ shipped |
|     3 | Projects & Tasks                                     |     ⬜     |
|     4 | Proposals & Contracts                                |     ⬜     |
|     5 | Invoices & Payments                                  |     ⬜     |
|     6 | Forms & Schedulers                                   |     ⬜     |
|     7 | Time, Files, Inbox, Wiki, Calendar                   |     ⬜     |
|     8 | Client Portal & White-Label                          |     ⬜     |
|     9 | Workflows Engine                                     |     ⬜     |
|    10 | Moe (voice-to-action AI)                             |     ⬜     |
|    11 | Mobile, Integrations, Marketplace                    |     ⬜     |

## Contributing

Read [`CLAUDE.md`](./CLAUDE.md) section 14 (`NEVER`) and 15 (`ALWAYS`) before opening a PR.
