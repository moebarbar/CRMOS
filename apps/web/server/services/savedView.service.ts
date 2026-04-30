import 'server-only';
import { TRPCError } from '@trpc/server';
import type {
  CreateSavedViewInput,
  UpdateSavedViewInput,
} from '@chiefos/shared/zod/savedView';
import type { Context } from '@/server/trpc/context';

type Ctx = Context & {
  workspace: { id: string };
  user: NonNullable<Context['user']>;
};

export const savedViewService = {
  async listFor(ctx: Ctx, entity: string) {
    return ctx.prisma.savedView.findMany({
      where: {
        workspaceId: ctx.workspace.id,
        entity,
        OR: [{ userId: ctx.user.id }, { isShared: true }],
      },
      orderBy: { createdAt: 'asc' },
    });
  },

  async create(ctx: Ctx, input: CreateSavedViewInput) {
    return ctx.prisma.savedView.create({
      data: {
        ...input,
        filters: input.filters as never,
        workspaceId: ctx.workspace.id,
        userId: ctx.user.id,
      },
    });
  },

  async update(ctx: Ctx, input: UpdateSavedViewInput) {
    const existing = await ctx.prisma.savedView.findFirst({
      where: { id: input.id, workspaceId: ctx.workspace.id },
    });
    if (!existing) throw new TRPCError({ code: 'NOT_FOUND' });
    if (existing.userId !== ctx.user.id) {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Only the author can edit this view.' });
    }

    const { id, filters, ...data } = input;
    return ctx.prisma.savedView.update({
      where: { id },
      data: {
        ...data,
        ...(filters !== undefined && { filters: filters as never }),
      },
    });
  },

  async delete(ctx: Ctx, id: string) {
    const existing = await ctx.prisma.savedView.findFirst({
      where: { id, workspaceId: ctx.workspace.id },
    });
    if (!existing) throw new TRPCError({ code: 'NOT_FOUND' });
    if (existing.userId !== ctx.user.id) {
      throw new TRPCError({ code: 'FORBIDDEN' });
    }
    await ctx.prisma.savedView.delete({ where: { id } });
    return { ok: true };
  },
};
