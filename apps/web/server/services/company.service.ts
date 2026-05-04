import 'server-only';
import { TRPCError } from '@trpc/server';
import { Prisma } from '@chiefos/db';
import type {
  CreateCompanyInput,
  ListCompaniesInput,
  UpdateCompanyInput,
} from '@chiefos/shared/zod/company';
import type { Context } from '@/server/trpc/context';
import { validateAndCoerceCustomFields } from '@/server/lib/customFields';
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
      // why: ILIKE backed by gin_trgm_ops indexes from migration 1_pg_trgm_indexes
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
    return { items, nextCursor: hasMore ? (items[items.length - 1]?.id ?? null) : null };
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
    const { customFields, ...data } = input;
    const coercedCustomFields = await validateAndCoerceCustomFields(ctx, 'COMPANY', customFields);

    const company = await ctx.prisma.company.create({
      data: {
        ...data,
        customFields: coercedCustomFields as Prisma.InputJsonValue,
        workspaceId: ctx.workspace.id,
        ownerId: data.ownerId ?? ctx.user.id,
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

    const { id, customFields, ...data } = input;
    const coercedCustomFields =
      customFields !== undefined
        ? await validateAndCoerceCustomFields(ctx, 'COMPANY', customFields)
        : undefined;

    const updated = await ctx.prisma.company.update({
      where: { id },
      data: {
        ...data,
        ...(coercedCustomFields !== undefined && {
          customFields: coercedCustomFields as Prisma.InputJsonValue,
        }),
      },
    });

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
