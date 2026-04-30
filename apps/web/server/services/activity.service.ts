import 'server-only';
import type { ActivityTargetType } from '@chiefos/db';
import type { Context } from '@/server/trpc/context';

export interface LogActivityInput {
  verb: string;
  targetType: ActivityTargetType;
  targetId: string;
  payload?: Record<string, unknown>;
  actorType?: 'user' | 'system' | 'moe' | 'integration';
}

type ActivityCtx = Context & {
  workspace: { id: string };
};

export const activityService = {
  async log(ctx: ActivityCtx, input: LogActivityInput) {
    return ctx.prisma.activity.create({
      data: {
        workspaceId: ctx.workspace.id,
        actorId: ctx.user?.id ?? null,
        actorType: input.actorType ?? (ctx.user ? 'user' : 'system'),
        verb: input.verb,
        targetType: input.targetType,
        targetId: input.targetId,
        payload: input.payload ?? undefined,
      },
    });
  },
};
