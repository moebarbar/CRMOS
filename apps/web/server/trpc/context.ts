import 'server-only';
import { auth } from '@clerk/nextjs/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/db/prisma';
import { getCurrentUser } from '@/lib/auth/clerk';

export interface CreateContextOpts {
  workspaceSlug?: string | null;
}

/**
 * Server context for tRPC. Built once per request.
 * `workspaceSlug` is read from the `x-chiefos-workspace` header set by the
 * client provider, or supplied directly when calling from server components.
 */
export async function createTRPCContext(opts: CreateContextOpts = {}) {
  const { userId } = await auth();
  const reqHeaders = await headers();
  const workspaceSlug = opts.workspaceSlug ?? reqHeaders.get('x-chiefos-workspace');

  return {
    prisma,
    clerkUserId: userId,
    workspaceSlug,
    user: userId ? await getCurrentUser() : null,
  };
}

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;
