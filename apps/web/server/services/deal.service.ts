import 'server-only';
import { TRPCError } from '@trpc/server';
import { Prisma } from '@chiefos/db';
import type {
  CreateDealInput,
  ListDealsInput,
  MarkLostInput,
  MarkWonInput,
  MoveDealInput,
  UpdateDealInput,
} from '@chiefos/shared/zod/deal';
import type { Context } from '@/server/trpc/context';
import { inngest } from '@/lib/inngest/client';
import { activityService } from './activity.service';

type Ctx = Context & {
  workspace: { id: string };
  user: NonNullable<Context['user']>;
};

const DEAL_INCLUDE = {
  stage: true,
  pipeline: { select: { id: true, name: true } },
  contact: { select: { id: true, firstName: true, lastName: true, email: true } },
  company: { select: { id: true, name: true, logoUrl: true } },
} as const;

export const dealService = {
  async list(ctx: Ctx, input: ListDealsInput) {
    const where: Prisma.DealWhereInput = {
      workspaceId: ctx.workspace.id,
      deletedAt: null,
      ...(input.pipelineId && { pipelineId: input.pipelineId }),
      ...(input.stageId && { stageId: input.stageId }),
      ...(input.ownerId && { ownerId: input.ownerId }),
      ...(input.status && { status: input.status }),
      ...(input.contactId && { contactId: input.contactId }),
      ...(input.companyId && { companyId: input.companyId }),
      ...(input.search && {
        title: { contains: input.search, mode: 'insensitive' },
      }),
    };

    const rows = await ctx.prisma.deal.findMany({
      where,
      take: input.limit + 1,
      ...(input.cursor && { skip: 1, cursor: { id: input.cursor } }),
      orderBy: [{ updatedAt: 'desc' }],
      include: DEAL_INCLUDE,
    });

    const hasMore = rows.length > input.limit;
    const items = hasMore ? rows.slice(0, input.limit) : rows;
    return { items, nextCursor: hasMore ? (items[items.length - 1]?.id ?? null) : null };
  },

  async get(ctx: Ctx, id: string) {
    const deal = await ctx.prisma.deal.findFirst({
      where: { id, workspaceId: ctx.workspace.id, deletedAt: null },
      include: {
        ...DEAL_INCLUDE,
        pipeline: { include: { stages: { orderBy: { position: 'asc' } } } },
      },
    });
    if (!deal) throw new TRPCError({ code: 'NOT_FOUND' });
    return deal;
  },

  async create(ctx: Ctx, input: CreateDealInput) {
    await this.assertStageBelongsToPipeline(ctx, input.pipelineId, input.stageId);

    const deal = await ctx.prisma.deal.create({
      data: {
        ...input,
        workspaceId: ctx.workspace.id,
        ownerId: input.ownerId ?? ctx.user.id,
        customFields: input.customFields as Prisma.InputJsonValue,
      },
      include: DEAL_INCLUDE,
    });

    await activityService.log(ctx, {
      verb: 'created',
      targetType: 'DEAL',
      targetId: deal.id,
      payload: { title: deal.title, value: deal.value.toString() },
    });

    return deal;
  },

  async update(ctx: Ctx, input: UpdateDealInput) {
    const existing = await ctx.prisma.deal.findFirst({
      where: { id: input.id, workspaceId: ctx.workspace.id, deletedAt: null },
    });
    if (!existing) throw new TRPCError({ code: 'NOT_FOUND' });

    if (input.pipelineId && input.stageId) {
      await this.assertStageBelongsToPipeline(ctx, input.pipelineId, input.stageId);
    }

    const { id, customFields, ...data } = input;
    const updated = await ctx.prisma.deal.update({
      where: { id },
      data: {
        ...data,
        ...(customFields !== undefined && {
          customFields: customFields as Prisma.InputJsonValue,
        }),
      },
      include: DEAL_INCLUDE,
    });

    await activityService.log(ctx, {
      verb: 'updated',
      targetType: 'DEAL',
      targetId: id,
      payload: { fields: Object.keys(data) },
    });

    return updated;
  },

  /** Drag a deal between stages in the kanban. Records `moved` activity. */
  async move(ctx: Ctx, input: MoveDealInput) {
    const deal = await ctx.prisma.deal.findFirst({
      where: { id: input.id, workspaceId: ctx.workspace.id, deletedAt: null },
      include: { stage: true, pipeline: true },
    });
    if (!deal) throw new TRPCError({ code: 'NOT_FOUND' });

    const targetStage = await ctx.prisma.pipelineStage.findUnique({
      where: { id: input.stageId },
    });
    if (!targetStage || targetStage.pipelineId !== deal.pipelineId) {
      throw new TRPCError({ code: 'BAD_REQUEST', message: 'Stage is not on this pipeline.' });
    }
    if (targetStage.id === deal.stageId) {
      return deal;
    }

    const updates: Prisma.DealUpdateInput = { stage: { connect: { id: targetStage.id } } };
    if (targetStage.isWon) {
      updates.status = 'WON';
      updates.closedAt = new Date();
    } else if (targetStage.isLost) {
      updates.status = 'LOST';
      updates.closedAt = new Date();
    } else if (deal.status !== 'OPEN') {
      // Moving back to a non-terminal stage reopens the deal.
      updates.status = 'OPEN';
      updates.closedAt = null;
    }

    const updated = await ctx.prisma.deal.update({
      where: { id: deal.id },
      data: updates,
      include: DEAL_INCLUDE,
    });

    await activityService.log(ctx, {
      verb: 'moved',
      targetType: 'DEAL',
      targetId: deal.id,
      payload: {
        fromStage: deal.stage.name,
        toStage: targetStage.name,
      },
    });

    if (targetStage.isWon && deal.status !== 'WON') {
      await inngest.send({
        name: 'app/deal.won',
        data: { dealId: deal.id, workspaceId: ctx.workspace.id },
      });
    } else if (targetStage.isLost && deal.status !== 'LOST') {
      await inngest.send({
        name: 'app/deal.lost',
        data: { dealId: deal.id, workspaceId: ctx.workspace.id, reason: null },
      });
    }

    return updated;
  },

  async markWon(ctx: Ctx, input: MarkWonInput) {
    const deal = await ctx.prisma.deal.findFirst({
      where: { id: input.id, workspaceId: ctx.workspace.id, deletedAt: null },
      include: { pipeline: { include: { stages: true } } },
    });
    if (!deal) throw new TRPCError({ code: 'NOT_FOUND' });

    const wonStage = deal.pipeline.stages.find((s) => s.isWon);
    if (!wonStage) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Pipeline has no Won stage configured.',
      });
    }

    const updated = await ctx.prisma.deal.update({
      where: { id: deal.id },
      data: {
        status: 'WON',
        stageId: wonStage.id,
        closedAt: input.closedAt ?? new Date(),
        ...(input.actualValue !== undefined && { value: input.actualValue }),
      },
      include: DEAL_INCLUDE,
    });

    await activityService.log(ctx, {
      verb: 'won',
      targetType: 'DEAL',
      targetId: deal.id,
      payload: { value: updated.value.toString() },
    });

    await inngest.send({
      name: 'app/deal.won',
      data: { dealId: deal.id, workspaceId: ctx.workspace.id },
    });

    return updated;
  },

  async markLost(ctx: Ctx, input: MarkLostInput) {
    const deal = await ctx.prisma.deal.findFirst({
      where: { id: input.id, workspaceId: ctx.workspace.id, deletedAt: null },
      include: { pipeline: { include: { stages: true } } },
    });
    if (!deal) throw new TRPCError({ code: 'NOT_FOUND' });

    const lostStage = deal.pipeline.stages.find((s) => s.isLost);
    if (!lostStage) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Pipeline has no Lost stage configured.',
      });
    }

    const updated = await ctx.prisma.deal.update({
      where: { id: deal.id },
      data: {
        status: 'LOST',
        stageId: lostStage.id,
        closedAt: input.closedAt ?? new Date(),
        lostReason: input.reason,
      },
      include: DEAL_INCLUDE,
    });

    await activityService.log(ctx, {
      verb: 'lost',
      targetType: 'DEAL',
      targetId: deal.id,
      payload: { reason: input.reason },
    });

    await inngest.send({
      name: 'app/deal.lost',
      data: { dealId: deal.id, workspaceId: ctx.workspace.id, reason: input.reason },
    });

    return updated;
  },

  async softDelete(ctx: Ctx, id: string) {
    const existing = await ctx.prisma.deal.findFirst({
      where: { id, workspaceId: ctx.workspace.id, deletedAt: null },
    });
    if (!existing) throw new TRPCError({ code: 'NOT_FOUND' });

    await ctx.prisma.deal.update({ where: { id }, data: { deletedAt: new Date() } });
    await activityService.log(ctx, { verb: 'deleted', targetType: 'DEAL', targetId: id });
    return { ok: true };
  },

  async forecast(ctx: Ctx, pipelineId?: string) {
    const where: Prisma.DealWhereInput = {
      workspaceId: ctx.workspace.id,
      deletedAt: null,
      status: 'OPEN',
      ...(pipelineId && { pipelineId }),
    };
    const deals = await ctx.prisma.deal.findMany({
      where,
      include: { stage: true },
    });
    let weighted = 0;
    let raw = 0;
    for (const d of deals) {
      const v = Number(d.value);
      raw += v;
      weighted += v * d.stage.probability;
    }
    return { weighted, raw, count: deals.length };
  },

  async assertStageBelongsToPipeline(ctx: Ctx, pipelineId: string, stageId: string) {
    const stage = await ctx.prisma.pipelineStage.findUnique({
      where: { id: stageId },
      select: { pipelineId: true, pipeline: { select: { workspaceId: true } } },
    });
    if (
      !stage ||
      stage.pipelineId !== pipelineId ||
      stage.pipeline.workspaceId !== ctx.workspace.id
    ) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Stage is not on this pipeline.',
      });
    }
  },
};
