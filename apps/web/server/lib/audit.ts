import 'server-only';
import { headers } from 'next/headers';
import { Prisma } from '@chiefos/db';
import type { Context } from '@/server/trpc/context';

export interface AuditInput {
  action: string;
  resource: string;
  resourceId?: string;
  diff?: Record<string, unknown>;
}

/**
 * Append-only audit trail for compliance-relevant events
 * (financial, permission changes, deletions). Never edited.
 */
export async function writeAudit(ctx: Context & { workspace: { id: string } }, input: AuditInput) {
  const reqHeaders = await headers();
  const ip = reqHeaders.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null;
  const userAgent = reqHeaders.get('user-agent') ?? null;

  return ctx.prisma.auditLog.create({
    data: {
      workspaceId: ctx.workspace.id,
      userId: ctx.user?.id ?? null,
      action: input.action,
      resource: input.resource,
      resourceId: input.resourceId ?? null,
      ip,
      userAgent,
      diff: (input.diff ?? undefined) as Prisma.InputJsonValue | undefined,
    },
  });
}
