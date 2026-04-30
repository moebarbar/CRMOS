import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { workspace as workspaceSchemas } from '@chiefos/shared';
import { createTRPCRouter, protectedProcedure, workspaceProcedure } from '../trpc';
import { workspaceService } from '@/server/services/workspace.service';
import { can } from '@/lib/auth/permissions';

export const workspaceRouter = createTRPCRouter({
  /** Workspaces the current user is a member of. */
  listMine: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.workspace.findMany({
      where: {
        deletedAt: null,
        memberships: { some: { userId: ctx.user.id } },
      },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        logoUrl: true,
        brandPrimary: true,
        brandAccent: true,
      },
    });
  }),

  /** Bootstrap: create a new workspace + OWNER membership. */
  create: protectedProcedure
    .input(workspaceSchemas.createWorkspaceSchema)
    .mutation(({ ctx, input }) => workspaceService.create(ctx, input)),

  /** Get the active workspace (slug from header). */
  current: workspaceProcedure.query(({ ctx }) => ctx.workspace),

  /** Update workspace settings — gated by permission. */
  update: workspaceProcedure
    .input(workspaceSchemas.updateWorkspaceSchema)
    .mutation(async ({ ctx, input }) => {
      if (!can(ctx.membership, 'workspace:update')) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Cannot edit workspace settings.' });
      }
      if (input.id !== ctx.workspace.id) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Mismatched workspace id.' });
      }
      return workspaceService.update(ctx, input);
    }),

  /** Slug availability for the create flow. */
  isSlugAvailable: protectedProcedure
    .input(z.object({ slug: workspaceSchemas.slugSchema }))
    .query(async ({ ctx, input }) => {
      const existing = await ctx.prisma.workspace.findUnique({ where: { slug: input.slug } });
      return { available: !existing };
    }),
});
