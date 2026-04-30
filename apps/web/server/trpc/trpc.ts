import 'server-only';
import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { ZodError } from 'zod';
import type { Context } from './context';

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
export const middleware = t.middleware;

/** Requires a signed-in Clerk session. Loads the ChiefOS User row. */
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.clerkUserId || !ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'You must be signed in.' });
  }
  return next({ ctx: { ...ctx, user: ctx.user, clerkUserId: ctx.clerkUserId } });
});

/**
 * Requires a signed-in user AND a resolved workspace they belong to.
 * Resolution rule: `workspaceSlug` from header → Workspace → Membership.
 * Injects `ctx.workspace` and `ctx.membership`.
 */
export const workspaceProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (!ctx.workspaceSlug) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Missing workspace.' });
  }

  const workspace = await ctx.prisma.workspace.findFirst({
    where: { slug: ctx.workspaceSlug, deletedAt: null },
  });
  if (!workspace) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Workspace not found.' });
  }

  const membership = await ctx.prisma.membership.findUnique({
    where: { userId_workspaceId: { userId: ctx.user.id, workspaceId: workspace.id } },
  });
  if (!membership) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Not a member of this workspace.' });
  }

  return next({ ctx: { ...ctx, workspace, membership } });
});
