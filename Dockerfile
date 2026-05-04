# syntax=docker/dockerfile:1.7
# Production image for the Next.js web app inside a pnpm monorepo.
# Build context MUST be the repo root so the lockfile and workspace
# packages are visible.

FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat openssl
RUN corepack enable
WORKDIR /app

# ---------- deps ----------
FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json .npmrc* ./
COPY apps/web/package.json apps/web/
COPY packages/db/package.json packages/db/
COPY packages/shared/package.json packages/shared/
COPY packages/emails/package.json packages/emails/
RUN pnpm install --frozen-lockfile

# ---------- build ----------
FROM base AS builder
COPY --from=deps /app /app
COPY . .
RUN pnpm --filter @chiefos/db generate
RUN pnpm --filter @chiefos/web build

# ---------- runtime ----------
FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=builder /app /app
WORKDIR /app/apps/web
EXPOSE 3000
CMD ["pnpm", "start"]
