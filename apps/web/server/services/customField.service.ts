import 'server-only';
import { TRPCError } from '@trpc/server';
import {
  customFieldEntitySchema,
  type CreateCustomFieldInput,
  type UpdateCustomFieldInput,
} from '@chiefos/shared/zod/customField';
import type { CustomFieldEntity } from '@chiefos/db';
import type { Context } from '@/server/trpc/context';

type Ctx = Context & { workspace: { id: string } };

export const customFieldService = {
  async list(ctx: Ctx, entity?: CustomFieldEntity) {
    return ctx.prisma.customFieldDef.findMany({
      where: { workspaceId: ctx.workspace.id, ...(entity && { entity }) },
      orderBy: [{ entity: 'asc' }, { position: 'asc' }, { createdAt: 'asc' }],
    });
  },

  async create(ctx: Ctx, input: CreateCustomFieldInput) {
    customFieldEntitySchema.parse(input.entity);
    return ctx.prisma.customFieldDef.create({
      data: {
        workspaceId: ctx.workspace.id,
        entity: input.entity,
        key: input.key,
        label: input.label,
        type: input.type,
        options: input.options as never,
        required: input.required,
        defaultValue: input.defaultValue as never,
        position: input.position,
        showInList: input.showInList,
      },
    });
  },

  async update(ctx: Ctx, input: UpdateCustomFieldInput) {
    const existing = await ctx.prisma.customFieldDef.findFirst({
      where: { id: input.id, workspaceId: ctx.workspace.id },
    });
    if (!existing) throw new TRPCError({ code: 'NOT_FOUND' });

    const { id, options, defaultValue, ...data } = input;
    return ctx.prisma.customFieldDef.update({
      where: { id },
      data: {
        ...data,
        ...(options !== undefined && { options: options as never }),
        ...(defaultValue !== undefined && { defaultValue: defaultValue as never }),
      },
    });
  },

  async delete(ctx: Ctx, id: string) {
    const existing = await ctx.prisma.customFieldDef.findFirst({
      where: { id, workspaceId: ctx.workspace.id },
    });
    if (!existing) throw new TRPCError({ code: 'NOT_FOUND' });
    await ctx.prisma.customFieldDef.delete({ where: { id } });
    return { ok: true };
  },
};
