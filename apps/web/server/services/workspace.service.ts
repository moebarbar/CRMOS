import 'server-only';
import { TRPCError } from '@trpc/server';
import type { Context } from '@/server/trpc/context';
import { Role } from '@chiefos/db';
import type {
  CreateWorkspaceInput,
  UpdateWorkspaceInput,
} from '@chiefos/shared/zod/workspace';
import { inngest } from '@/lib/inngest/client';
import { activityService } from './activity.service';

export const workspaceService = {
  async create(
    ctx: Context & { user: NonNullable<Context['user']> },
    input: CreateWorkspaceInput,
  ) {
    const existing = await ctx.prisma.workspace.findUnique({ where: { slug: input.slug } });
    if (existing) {
      throw new TRPCError({ code: 'CONFLICT', message: 'That URL is taken.' });
    }

    const workspace = await ctx.prisma.workspace.create({
      data: {
        name: input.name,
        slug: input.slug,
        ownerId: ctx.user.id,
        defaultCurrency: input.defaultCurrency,
        timezone: input.timezone,
        memberships: {
          create: {
            userId: ctx.user.id,
            role: Role.OWNER,
            acceptedAt: new Date(),
          },
        },
      },
    });

    if (!ctx.user.defaultWorkspaceId) {
      await ctx.prisma.user.update({
        where: { id: ctx.user.id },
        data: { defaultWorkspaceId: workspace.id },
      });
    }

    await activityService.log(
      { ...ctx, workspace },
      { verb: 'created', targetType: 'WORKSPACE', targetId: workspace.id },
    );

    await inngest.send({
      name: 'app/workspace.created',
      data: { workspaceId: workspace.id, ownerUserId: ctx.user.id },
    });

    return workspace;
  },

  async update(
    ctx: Context & { workspace: NonNullable<Awaited<ReturnType<Context['prisma']['workspace']['findFirst']>>> },
    input: UpdateWorkspaceInput,
  ) {
    const { id, ...data } = input;
    const updated = await ctx.prisma.workspace.update({
      where: { id },
      data,
    });

    await activityService.log(ctx, {
      verb: 'updated',
      targetType: 'WORKSPACE',
      targetId: updated.id,
      payload: { fields: Object.keys(data) },
    });

    return updated;
  },
};
