import 'server-only';
import { TRPCError } from '@trpc/server';
import { Prisma } from '@chiefos/db';
import type {
  CreateContactInput,
  ListContactsInput,
  UpdateContactInput,
} from '@chiefos/shared/zod/contact';
import type { Context } from '@/server/trpc/context';
import { activityService } from './activity.service';

type Ctx = Context & {
  workspace: { id: string };
  user: NonNullable<Context['user']>;
};

const SORT_MAP: Record<ListContactsInput['sort'], Prisma.ContactOrderByWithRelationInput[]> = {
  'createdAt:desc': [{ createdAt: 'desc' }],
  'createdAt:asc': [{ createdAt: 'asc' }],
  'lastName:asc': [{ lastName: 'asc' }, { firstName: 'asc' }],
  'lastContactedAt:desc': [{ lastContactedAt: 'desc' }],
};

export const contactService = {
  async list(ctx: Ctx, input: ListContactsInput) {
    const where: Prisma.ContactWhereInput = {
      workspaceId: ctx.workspace.id,
      deletedAt: null,
      ...(input.lifecycleStage && { lifecycleStage: input.lifecycleStage }),
      ...(input.ownerId && { ownerId: input.ownerId }),
      ...(input.companyId && { companyId: input.companyId }),
      ...(input.tagId && { tags: { some: { tagId: input.tagId } } }),
      ...(input.search && {
        OR: [
          { firstName: { contains: input.search, mode: 'insensitive' } },
          { lastName: { contains: input.search, mode: 'insensitive' } },
          { email: { contains: input.search, mode: 'insensitive' } },
        ],
      }),
    };

    const rows = await ctx.prisma.contact.findMany({
      where,
      take: input.limit + 1,
      ...(input.cursor && { skip: 1, cursor: { id: input.cursor } }),
      orderBy: SORT_MAP[input.sort],
      include: {
        company: { select: { id: true, name: true, logoUrl: true } },
        tags: { include: { tag: true } },
      },
    });

    const hasMore = rows.length > input.limit;
    const items = hasMore ? rows.slice(0, input.limit) : rows;
    return {
      items,
      nextCursor: hasMore ? items[items.length - 1]?.id ?? null : null,
    };
  },

  async get(ctx: Ctx, id: string) {
    const contact = await ctx.prisma.contact.findFirst({
      where: { id, workspaceId: ctx.workspace.id, deletedAt: null },
      include: {
        company: { select: { id: true, name: true, logoUrl: true } },
        tags: { include: { tag: true } },
        notes: { orderBy: { createdAt: 'desc' }, take: 50 },
      },
    });
    if (!contact) throw new TRPCError({ code: 'NOT_FOUND' });
    return contact;
  },

  async create(ctx: Ctx, input: CreateContactInput) {
    const { tagIds, ...data } = input;

    const contact = await ctx.prisma.contact.create({
      data: {
        ...data,
        workspaceId: ctx.workspace.id,
        ownerId: data.ownerId ?? ctx.user.id,
        ...(tagIds.length > 0 && {
          tags: { create: tagIds.map((tagId) => ({ tagId })) },
        }),
      },
      include: { company: true, tags: { include: { tag: true } } },
    });

    await activityService.log(ctx, {
      verb: 'created',
      targetType: 'CONTACT',
      targetId: contact.id,
      payload: { name: `${contact.firstName ?? ''} ${contact.lastName ?? ''}`.trim() || contact.email },
    });

    return contact;
  },

  async update(ctx: Ctx, input: UpdateContactInput) {
    const existing = await ctx.prisma.contact.findFirst({
      where: { id: input.id, workspaceId: ctx.workspace.id, deletedAt: null },
    });
    if (!existing) throw new TRPCError({ code: 'NOT_FOUND' });

    const { id, tagIds, ...data } = input;
    const updated = await ctx.prisma.contact.update({
      where: { id },
      data,
      include: { company: true, tags: { include: { tag: true } } },
    });

    if (tagIds) {
      await ctx.prisma.contactTag.deleteMany({ where: { contactId: id } });
      if (tagIds.length > 0) {
        await ctx.prisma.contactTag.createMany({
          data: tagIds.map((tagId) => ({ contactId: id, tagId })),
          skipDuplicates: true,
        });
      }
    }

    const changedFields = Object.keys(data);
    if (changedFields.length > 0) {
      await activityService.log(ctx, {
        verb: 'updated',
        targetType: 'CONTACT',
        targetId: id,
        payload: { fields: changedFields },
      });
    }

    return updated;
  },

  async softDelete(ctx: Ctx, id: string) {
    const existing = await ctx.prisma.contact.findFirst({
      where: { id, workspaceId: ctx.workspace.id, deletedAt: null },
    });
    if (!existing) throw new TRPCError({ code: 'NOT_FOUND' });

    await ctx.prisma.contact.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await activityService.log(ctx, {
      verb: 'deleted',
      targetType: 'CONTACT',
      targetId: id,
    });

    return { ok: true };
  },

  async restore(ctx: Ctx, id: string) {
    const existing = await ctx.prisma.contact.findFirst({
      where: { id, workspaceId: ctx.workspace.id, deletedAt: { not: null } },
    });
    if (!existing) throw new TRPCError({ code: 'NOT_FOUND' });
    await ctx.prisma.contact.update({ where: { id }, data: { deletedAt: null } });
    return { ok: true };
  },
};
