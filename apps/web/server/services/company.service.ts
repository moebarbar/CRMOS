import 'server-only';
import { TRPCError } from '@trpc/server';
import { Prisma } from '@chiefos/db';
import type {
  CreateCompanyInput,
  ListCompaniesInput,
  UpdateCompanyInput,
} from '@chiefos/shared/zod/company';
import type { Context } from '@/server/trpc/context';
import { activityService } from './activity.service';

type Ctx = Context & {
  workspace: { id: string };
  user: NonNullable<Context['user']>;
};

export const companyService = {
  async list(ctx: Ctx, input: ListCompaniesInput) {
    const where: Prisma.CompanyWhereInput = {
      workspaceId: ctx.workspace.id,
      deletedAt: null,
      ...(input.search && {
        OR: [
          { name: { contains: input.search, mode: 'insensitive' } },
          { domain: { contains: input.search, mode: 'insensitive' } },
        ],
      }),
    };

    const rows = await ctx.prisma.company.findMany({
      where,
      take: input.limit + 1,
      ...(input.cursor && { skip: 1, cursor: { id: input.cursor } }),
      orderBy: { name: 'asc' },
      include: { _count: { select: { contacts: true } } },
    });

    const hasMore = rows.length > input.limit;
    const items = hasMore ? rows.slice(0, input.limit) : rows;
    return { items, nextCursor: hasMore ? items[items.length - 1]?.id ?? null : null };
  },

  async get(ctx: Ctx, id: string) {
    const company = await ctx.prisma.company.findFirst({
      where: { id, workspaceId: ctx.workspace.id, deletedAt: null },
      include: {
        contacts: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
          take: 50,
          select: { id: true, firstName: true, lastName: true, email: true, jobTitle: true },
        },
      },
    });
    if (!company) throw new TRPCError({ code: 'NOT_FOUND' });
    return company;
  },

  async create(ctx: Ctx, input: CreateCompanyInput) {
    const company = await ctx.prisma.company.create({
      data: {
        ...input,
        workspaceId: ctx.workspace.id,
        ownerId: input.ownerId ?? ctx.user.id,
      },
    });

    await activityService.log(ctx, {
      verb: 'created',
      targetType: 'COMPANY',
      targetId: company.id,
      payload: { name: company.name },
    });

    return company;
  },

  async update(ctx: Ctx, input: UpdateCompanyInput) {
    const existing = await ctx.prisma.company.findFirst({
      where: { id: input.id, workspaceId: ctx.workspace.id, deletedAt: null },
    });
    if (!existing) throw new TRPCError({ code: 'NOT_FOUND' });

    const { id, ...data } = input;
    const updated = await ctx.prisma.company.update({ where: { id }, data });

    await activityService.log(ctx, {
      verb: 'updated',
      targetType: 'COMPANY',
      targetId: id,
      payload: { fields: Object.keys(data) },
    });

    return updated;
  },

  async softDelete(ctx: Ctx, id: string) {
    const existing = await ctx.prisma.company.findFirst({
      where: { id, workspaceId: ctx.workspace.id, deletedAt: null },
    });
    if (!existing) throw new TRPCError({ code: 'NOT_FOUND' });

    await ctx.prisma.company.update({ where: { id }, data: { deletedAt: new Date() } });

    await activityService.log(ctx, {
      verb: 'deleted',
      targetType: 'COMPANY',
      targetId: id,
    });

    return { ok: true };
  },
};
