import { z } from 'zod';
import { note as noteSchemas } from '@chiefos/shared';
import { createTRPCRouter, workspaceProcedure } from '../trpc';

export const activityRouter = createTRPCRouter({
  /** Activity timeline for a single entity (contact, company, deal, etc). */
  forTarget: workspaceProcedure
    .input(
      z.object({
        targetType: noteSchemas.activityTargetTypeSchema,
        targetId: z.string().cuid(),
        limit: z.number().int().min(1).max(100).default(50),
      }),
    )
    .query(async ({ ctx, input }) => {
      const rows = await ctx.prisma.activity.findMany({
        where: {
          workspaceId: ctx.workspace.id,
          targetType: input.targetType,
          targetId: input.targetId,
        },
        orderBy: { createdAt: 'desc' },
        take: input.limit,
      });

      const userIds = Array.from(
        new Set(rows.map((r) => r.actorId).filter((id): id is string => Boolean(id))),
      );
      const users = userIds.length
        ? await ctx.prisma.user.findMany({
            where: { id: { in: userIds } },
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatarUrl: true,
            },
          })
        : [];
      const usersById = new Map(users.map((u) => [u.id, u]));

      return rows.map((r) => ({
        ...r,
        actor: r.actorId ? usersById.get(r.actorId) ?? null : null,
      }));
    }),
});
