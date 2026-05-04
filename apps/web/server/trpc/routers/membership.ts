import { randomBytes } from 'node:crypto';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { membership as membershipSchemas } from '@chiefos/shared';
import { InviteEmail } from '@chiefos/emails';
import { createTRPCRouter, protectedProcedure, workspaceProcedure } from '../trpc';
import { can } from '@/lib/auth/permissions';
import { activityService } from '@/server/services/activity.service';
import { sendEmail } from '@/lib/integrations/resend';
import { log } from '@/lib/observability/logger';

const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function generateInviteToken() {
  return randomBytes(24).toString('base64url');
}

function inviteUrl(token: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  return `${base}/invite/${token}`;
}

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

      // Reuse-or-create a placeholder User by email. The real Clerk-backed
      // User row arrives via webhook on accept and is reconciled there.
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
      if (existing && existing.acceptedAt) {
        throw new TRPCError({ code: 'CONFLICT', message: 'Already a member.' });
      }

      const token = generateInviteToken();
      const expiresAt = new Date(Date.now() + INVITE_TTL_MS);

      const membership = existing
        ? await ctx.prisma.membership.update({
            where: { id: existing.id },
            data: {
              role: input.role,
              customRoleId: input.customRoleId ?? null,
              inviteToken: token,
              inviteEmail: input.email,
              inviteExpiresAt: expiresAt,
              invitedAt: new Date(),
            },
          })
        : await ctx.prisma.membership.create({
            data: {
              userId: user.id,
              workspaceId: ctx.workspace.id,
              role: input.role,
              customRoleId: input.customRoleId ?? null,
              inviteToken: token,
              inviteEmail: input.email,
              inviteExpiresAt: expiresAt,
            },
          });

      const inviterName =
        [ctx.user.firstName, ctx.user.lastName].filter(Boolean).join(' ') || ctx.user.email;

      try {
        await sendEmail({
          to: input.email,
          subject: `${inviterName} invited you to ${ctx.workspace.name}`,
          react: InviteEmail({
            workspaceName: ctx.workspace.name,
            inviterName,
            role: input.role,
            acceptUrl: inviteUrl(token),
          }),
          replyTo: ctx.user.email,
        });
      } catch (err) {
        log.error('invite.email.failed', { membershipId: membership.id, err: String(err) });
      }

      await activityService.log(ctx, {
        verb: 'invited',
        targetType: 'USER',
        targetId: user.id,
        payload: { email: input.email, role: input.role },
      });

      return membership;
    }),

  /** Public-ish: requires a signed-in Clerk user. Reconciles invite token → membership. */
  acceptInvite: protectedProcedure
    .input(z.object({ token: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const membership = await ctx.prisma.membership.findUnique({
        where: { inviteToken: input.token },
        include: { workspace: { select: { slug: true, name: true } } },
      });
      if (!membership) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'This invite is invalid or already used.',
        });
      }
      if (membership.inviteExpiresAt && membership.inviteExpiresAt < new Date()) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'This invite has expired.' });
      }
      if (
        membership.inviteEmail &&
        membership.inviteEmail.toLowerCase() !== ctx.user.email.toLowerCase()
      ) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: `This invite was sent to ${membership.inviteEmail}. Sign in with that email to accept.`,
        });
      }

      // Reconcile: if a placeholder User was created at invite time, drop it
      // and re-point the Membership at the real Clerk-backed User.
      if (membership.userId !== ctx.user.id) {
        const placeholderUserId = membership.userId;
        await ctx.prisma.$transaction([
          ctx.prisma.membership.update({
            where: { id: membership.id },
            data: {
              userId: ctx.user.id,
              acceptedAt: new Date(),
              inviteToken: null,
              inviteEmail: null,
              inviteExpiresAt: null,
            },
          }),
          ctx.prisma.user.deleteMany({
            where: { id: placeholderUserId, clerkUserId: { startsWith: 'pending_' } },
          }),
        ]);
      } else {
        await ctx.prisma.membership.update({
          where: { id: membership.id },
          data: {
            acceptedAt: new Date(),
            inviteToken: null,
            inviteEmail: null,
            inviteExpiresAt: null,
          },
        });
      }

      await ctx.prisma.activity.create({
        data: {
          workspaceId: membership.workspaceId,
          actorId: ctx.user.id,
          actorType: 'user',
          verb: 'accepted',
          targetType: 'USER',
          targetId: ctx.user.id,
        },
      });

      return { workspaceSlug: membership.workspace.slug };
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
