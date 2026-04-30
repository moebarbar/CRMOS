import 'server-only';
import { TRPCError } from '@trpc/server';
import type { CreateNoteInput, UpdateNoteInput } from '@chiefos/shared/zod/note';
import type { Context } from '@/server/trpc/context';
import { activityService } from './activity.service';

type Ctx = Context & {
  workspace: { id: string };
  user: NonNullable<Context['user']>;
};

export const noteService = {
  async listFor(ctx: Ctx, targetType: CreateNoteInput['targetType'], targetId: string) {
    return ctx.prisma.note.findMany({
      where: { workspaceId: ctx.workspace.id, targetType, targetId },
      orderBy: { createdAt: 'desc' },
    });
  },

  async create(ctx: Ctx, input: CreateNoteInput) {
    const note = await ctx.prisma.note.create({
      data: {
        workspaceId: ctx.workspace.id,
        authorId: ctx.user.id,
        targetType: input.targetType,
        targetId: input.targetId,
        body: input.body,
        bodyJson: input.bodyJson === undefined ? undefined : (input.bodyJson as never),
        isPrivate: input.isPrivate,
        ...(input.targetType === 'CONTACT' && { contactId: input.targetId }),
      },
    });

    await activityService.log(ctx, {
      verb: 'commented',
      targetType: input.targetType,
      targetId: input.targetId,
      payload: { noteId: note.id },
    });

    return note;
  },

  async update(ctx: Ctx, input: UpdateNoteInput) {
    const existing = await ctx.prisma.note.findFirst({
      where: { id: input.id, workspaceId: ctx.workspace.id },
    });
    if (!existing) throw new TRPCError({ code: 'NOT_FOUND' });
    if (existing.authorId !== ctx.user.id) {
      throw new TRPCError({ code: 'FORBIDDEN', message: "You can only edit your own notes." });
    }

    const { id, ...data } = input;
    return ctx.prisma.note.update({
      where: { id },
      data: {
        ...data,
        bodyJson: data.bodyJson === undefined ? undefined : (data.bodyJson as never),
      },
    });
  },

  async delete(ctx: Ctx, id: string) {
    const existing = await ctx.prisma.note.findFirst({
      where: { id, workspaceId: ctx.workspace.id },
    });
    if (!existing) throw new TRPCError({ code: 'NOT_FOUND' });
    if (existing.authorId !== ctx.user.id) {
      throw new TRPCError({ code: 'FORBIDDEN' });
    }
    await ctx.prisma.note.delete({ where: { id } });
    return { ok: true };
  },
};
