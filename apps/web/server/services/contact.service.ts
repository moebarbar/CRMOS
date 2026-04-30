import 'server-only';
import { TRPCError } from '@trpc/server';
import { Prisma } from '@chiefos/db';
import type {
  CreateContactInput,
  ListContactsInput,
  UpdateContactInput,
} from '@chiefos/shared/zod/contact';
import type { Context } from '@/server/trpc/context';
import { validateAndCoerceCustomFields } from '@/server/lib/customFields';
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

export interface BulkContactRow {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  jobTitle?: string | null;
  city?: string | null;
  country?: string | null;
}

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
    const { tagIds, customFields, ...data } = input;
    const coercedCustomFields = await validateAndCoerceCustomFields(ctx, 'CONTACT', customFields);
    const companyId = await this.resolveCompanyId(ctx, data.companyId, data.email);

    const contact = await ctx.prisma.contact.create({
      data: {
        ...data,
        companyId,
        customFields: coercedCustomFields as Prisma.InputJsonValue,
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
      payload: {
        name:
          `${contact.firstName ?? ''} ${contact.lastName ?? ''}`.trim() ||
          contact.email,
      },
    });

    return contact;
  },

  async update(ctx: Ctx, input: UpdateContactInput) {
    const existing = await ctx.prisma.contact.findFirst({
      where: { id: input.id, workspaceId: ctx.workspace.id, deletedAt: null },
    });
    if (!existing) throw new TRPCError({ code: 'NOT_FOUND' });

    const { id, tagIds, customFields, ...data } = input;
    const coercedCustomFields =
      customFields !== undefined
        ? await validateAndCoerceCustomFields(ctx, 'CONTACT', customFields)
        : undefined;

    const updated = await ctx.prisma.contact.update({
      where: { id },
      data: {
        ...data,
        ...(coercedCustomFields !== undefined && {
          customFields: coercedCustomFields as Prisma.InputJsonValue,
        }),
      },
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

  /**
   * Bulk import. Dedupes by email within the workspace; existing rows
   * (by email) are updated with non-empty fields, missing rows created.
   * Auto-links companyId by email domain. Synchronous — keep input
   * under ~500 rows; queue Inngest for larger imports.
   */
  async bulkImport(ctx: Ctx, rows: BulkContactRow[]) {
    const normalized = rows.map((r) => ({
      firstName: r.firstName?.trim() || null,
      lastName: r.lastName?.trim() || null,
      email: r.email?.trim().toLowerCase() || null,
      phone: r.phone?.trim() || null,
      jobTitle: r.jobTitle?.trim() || null,
      city: r.city?.trim() || null,
      country: r.country?.trim() || null,
    }));

    const valid = normalized.filter(
      (r) => r.firstName || r.lastName || r.email || r.phone,
    );
    const skipped = normalized.length - valid.length;

    const emails = valid
      .map((r) => r.email)
      .filter((e): e is string => Boolean(e));
    const existingByEmail = new Map(
      (
        await ctx.prisma.contact.findMany({
          where: {
            workspaceId: ctx.workspace.id,
            email: { in: emails },
            deletedAt: null,
          },
          select: { id: true, email: true },
        })
      )
        .filter((c): c is { id: string; email: string } => Boolean(c.email))
        .map((c) => [c.email, c.id] as const),
    );

    let created = 0;
    let updated = 0;

    for (const row of valid) {
      const companyId = await this.resolveCompanyId(ctx, null, row.email);
      const existingId = row.email ? existingByEmail.get(row.email) : undefined;

      if (existingId) {
        await ctx.prisma.contact.update({
          where: { id: existingId },
          data: {
            firstName: row.firstName ?? undefined,
            lastName: row.lastName ?? undefined,
            phone: row.phone ?? undefined,
            jobTitle: row.jobTitle ?? undefined,
            city: row.city ?? undefined,
            country: row.country ?? undefined,
            ...(companyId && { companyId }),
          },
        });
        updated++;
      } else {
        const contact = await ctx.prisma.contact.create({
          data: {
            workspaceId: ctx.workspace.id,
            ownerId: ctx.user.id,
            firstName: row.firstName,
            lastName: row.lastName,
            email: row.email,
            phone: row.phone,
            jobTitle: row.jobTitle,
            city: row.city,
            country: row.country,
            companyId,
            source: 'import',
          },
        });
        created++;
        if (row.email) existingByEmail.set(row.email, contact.id);
      }
    }

    await activityService.log(ctx, {
      verb: 'imported',
      targetType: 'CONTACT',
      targetId: ctx.workspace.id,
      payload: { created, updated, skipped, total: rows.length },
    });

    return { created, updated, skipped, total: rows.length };
  },

  async resolveCompanyId(
    ctx: Ctx,
    explicit: string | null | undefined,
    email: string | null | undefined,
  ): Promise<string | null> {
    if (explicit) return explicit;
    if (!email) return null;
    const domain = email.split('@')[1]?.toLowerCase();
    if (!domain) return null;
    const match = await ctx.prisma.company.findFirst({
      where: { workspaceId: ctx.workspace.id, domain, deletedAt: null },
      select: { id: true },
    });
    return match?.id ?? null;
  },
};
