import 'server-only';
import { TRPCError } from '@trpc/server';
import type { CreateTagInput } from '@chiefos/shared/zod/tag';
import type { TagScope } from '@chiefos/db';
import type { Context } from '@/server/trpc/context';

type Ctx = Context & { workspace: { id: string } };

export const tagService = {
  async list(ctx: Ctx, scope?: TagScope) {
    return ctx.prisma.tag.findMany({
      where: { workspaceId: ctx.workspace.id, ...(scope && { scope }) },
      orderBy: { name: 'asc' },
    });
  },

  async create(ctx: Ctx, input: CreateTagInput) {
    return ctx.prisma.tag.create({
      data: { ...input, workspaceId: ctx.workspace.id },
    });
  },

  async delete(ctx: Ctx, id: string) {
    const tag = await ctx.prisma.tag.findFirst({
      where: { id, workspaceId: ctx.workspace.id },
    });
    if (!tag) throw new TRPCError({ code: 'NOT_FOUND' });
    await ctx.prisma.tag.delete({ where: { id } });
    return { ok: true };
  },

  async attach(ctx: Ctx, contactId: string, tagId: string) {
    await this.assertOwnership(ctx, contactId, tagId);
    return ctx.prisma.contactTag.upsert({
      where: { contactId_tagId: { contactId, tagId } },
      update: {},
      create: { contactId, tagId },
    });
  },

  async detach(ctx: Ctx, contactId: string, tagId: string) {
    await this.assertOwnership(ctx, contactId, tagId);
    await ctx.prisma.contactTag.deleteMany({ where: { contactId, tagId } });
    return { ok: true };
  },

  async assertOwnership(ctx: Ctx, contactId: string, tagId: string) {
    const [contact, tag] = await Promise.all([
      ctx.prisma.contact.findFirst({
        where: { id: contactId, workspaceId: ctx.workspace.id },
        select: { id: true },
      }),
      ctx.prisma.tag.findFirst({
        where: { id: tagId, workspaceId: ctx.workspace.id },
        select: { id: true },
      }),
    ]);
    if (!contact || !tag) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Contact or tag not found.' });
    }
  },
};
