import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { membership as membershipSchemas } from '@chiefos/shared';
import { createTRPCRouter, workspaceProcedure } from '../trpc';
import { can } from '@/lib/auth/permissions';
import { activityService } from '@/server/services/activity.service';

export const membershipRouter = createTRPCRouter({
  list: workspaceProcedure.query(async ({ ctx }) => {
    return ctx.prisma.membership.findMany({
      where: { workspaceId: ctx.workspace.id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { invitedAt: 'asc' },
    });
  }),

  invite: workspaceProcedure
    .input(membershipSchemas.inviteMemberSchema)
    .mutation(async ({ ctx, input }) => {
      if (!can(ctx.membership, 'members:invite')) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Cannot invite members.' });
      }

      // Phase 0 placeholder: create-or-attach a User shell by email and
      // record an unaccepted Membership. Real magic-link flow lands later
      // when Resend invites are wired up.
      const user = await ctx.prisma.user.upsert({
        where: { email: input.email },
        update: {},
        create: {
          email: input.email,
          clerkUserId: `pending_${crypto.randomUUID()}`,
        },
      });

      const existing = await ctx.prisma.membership.findUnique({
        where: { userId_workspaceId: { userId: user.id, workspaceId: ctx.workspace.id } },
      });
      if (existing) {
        throw new TRPCError({ code: 'CONFLICT', message: 'Already invited.' });
      }

      const membership = await ctx.prisma.membership.create({
        data: {
          userId: user.id,
          workspaceId: ctx.workspace.id,
          role: input.role,
          customRoleId: input.customRoleId ?? null,
        },
      });

      await activityService.log(ctx, {
        verb: 'invited',
        targetType: 'USER',
        targetId: user.id,
        payload: { email: input.email, role: input.role },
      });

      return membership;
    }),

  remove: workspaceProcedure
    .input(z.object({ membershipId: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      if (!can(ctx.membership, 'members:remove')) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Cannot remove members.' });
      }
      const target = await ctx.prisma.membership.findUnique({
        where: { id: input.membershipId },
      });
      if (!target || target.workspaceId !== ctx.workspace.id) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }
      if (target.role === 'OWNER') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cannot remove the owner.' });
      }

      await ctx.prisma.membership.delete({ where: { id: target.id } });
      await activityService.log(ctx, {
        verb: 'removed',
        targetType: 'USER',
        targetId: target.userId,
      });
      return { ok: true };
    }),
});
