import 'server-only';
import { TRPCError } from '@trpc/server';
import { validateCustomFields } from '@chiefos/shared/zod/customField';
import type { CustomFieldEntity } from '@chiefos/db';
import type { Context } from '@/server/trpc/context';

type Ctx = Context & { workspace: { id: string } };

/**
 * Server-side gate: validate `customFields` against the workspace's
 * defs. Throws BAD_REQUEST on issues; returns coerced values to persist.
 */
export async function validateAndCoerceCustomFields(
  ctx: Ctx,
  entity: CustomFieldEntity,
  values: Record<string, unknown> | null | undefined,
): Promise<Record<string, unknown>> {
  if (!values || Object.keys(values).length === 0) {
    // Even empty payloads must satisfy `required` defs.
    const requiredDefs = await ctx.prisma.customFieldDef.findMany({
      where: { workspaceId: ctx.workspace.id, entity, required: true },
      select: { key: true, type: true, required: true, options: true },
    });
    if (requiredDefs.length === 0) return {};
    const { issues } = validateCustomFields(
      requiredDefs.map((d) => ({
        key: d.key,
        type: d.type,
        required: d.required,
        options: (d.options as { value: string; label: string }[] | null) ?? undefined,
      })),
      {},
    );
    if (issues.length > 0) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: issues.map((i) => `${i.key}: ${i.message}`).join('; '),
      });
    }
    return {};
  }

  const defs = await ctx.prisma.customFieldDef.findMany({
    where: { workspaceId: ctx.workspace.id, entity },
    select: { key: true, type: true, required: true, options: true },
  });

  const { values: coerced, issues } = validateCustomFields(
    defs.map((d) => ({
      key: d.key,
      type: d.type,
      required: d.required,
      options: (d.options as { value: string; label: string }[] | null) ?? undefined,
    })),
    values,
  );

  if (issues.length > 0) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: issues.map((i) => `${i.key}: ${i.message}`).join('; '),
    });
  }

  return coerced;
}
