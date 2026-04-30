import 'server-only';
import { TRPCError } from '@trpc/server';
import { Prisma } from '@chiefos/db';
import {
  DEFAULT_SALES_STAGES,
  type CreatePipelineInput,
  type CreateStageInput,
  type ReorderStagesInput,
  type UpdatePipelineInput,
  type UpdateStageInput,
} from '@chiefos/shared/zod/pipeline';
import type { Context } from '@/server/trpc/context';
import { activityService } from './activity.service';

type Ctx = Context & {
  workspace: { id: string };
  user: NonNullable<Context['user']>;
};

type DbCtx = { prisma: Context['prisma']; workspace: { id: string } };

export const pipelineService = {
  async list(ctx: DbCtx) {
    return ctx.prisma.pipeline.findMany({
      where: { workspaceId: ctx.workspace.id },
      orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
      include: {
        stages: { orderBy: { position: 'asc' } },
        _count: { select: { deals: true } },
      },
    });
  },

  async get(ctx: DbCtx, id: string) {
    const p = await ctx.prisma.pipeline.findFirst({
      where: { id, workspaceId: ctx.workspace.id },
      include: { stages: { orderBy: { position: 'asc' } } },
    });
    if (!p) throw new TRPCError({ code: 'NOT_FOUND' });
    return p;
  },

  async getDefault(ctx: DbCtx) {
    const def = await ctx.prisma.pipeline.findFirst({
      where: { workspaceId: ctx.workspace.id, isDefault: true },
      include: { stages: { orderBy: { position: 'asc' } } },
    });
    if (def) return def;
    return ctx.prisma.pipeline.findFirst({
      where: { workspaceId: ctx.workspace.id },
      orderBy: { createdAt: 'asc' },
      include: { stages: { orderBy: { position: 'asc' } } },
    });
  },

  /** Idempotent: only seeds when the workspace has no pipelines. */
  async seedDefaultIfMissing(ctx: DbCtx) {
    const existing = await ctx.prisma.pipeline.findFirst({
      where: { workspaceId: ctx.workspace.id },
      select: { id: true },
    });
    if (existing) return existing;

    const created = await ctx.prisma.pipeline.create({
      data: {
        workspaceId: ctx.workspace.id,
        name: 'Sales',
        isDefault: true,
        stages: { create: DEFAULT_SALES_STAGES },
      },
    });
    return created;
  },

  async create(ctx: Ctx, input: CreatePipelineInput) {
    const stages = input.stages ?? DEFAULT_SALES_STAGES;

    if (input.isDefault) {
      await ctx.prisma.pipeline.updateMany({
        where: { workspaceId: ctx.workspace.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    const pipeline = await ctx.prisma.pipeline.create({
      data: {
        workspaceId: ctx.workspace.id,
        name: input.name,
        description: input.description ?? null,
        isDefault: input.isDefault,
        stages: { create: stages },
      },
      include: { stages: { orderBy: { position: 'asc' } } },
    });

    await activityService.log(ctx, {
      verb: 'created',
      targetType: 'WORKSPACE',
      targetId: pipeline.id,
      payload: { resource: 'pipeline', name: pipeline.name },
    });

    return pipeline;
  },

  async update(ctx: Ctx, input: UpdatePipelineInput) {
    const existing = await ctx.prisma.pipeline.findFirst({
      where: { id: input.id, workspaceId: ctx.workspace.id },
    });
    if (!existing) throw new TRPCError({ code: 'NOT_FOUND' });

    if (input.isDefault === true) {
      await ctx.prisma.pipeline.updateMany({
        where: { workspaceId: ctx.workspace.id, isDefault: true, id: { not: input.id } },
        data: { isDefault: false },
      });
    }

    const { id, ...data } = input;
    return ctx.prisma.pipeline.update({
      where: { id },
      data,
      include: { stages: { orderBy: { position: 'asc' } } },
    });
  },

  async delete(ctx: Ctx, id: string) {
    const existing = await ctx.prisma.pipeline.findFirst({
      where: { id, workspaceId: ctx.workspace.id },
      include: { _count: { select: { deals: true } } },
    });
    if (!existing) throw new TRPCError({ code: 'NOT_FOUND' });
    if (existing._count.deals > 0) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Move or delete the deals on this pipeline first.',
      });
    }
    if (existing.isDefault) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Set another pipeline as default before deleting this one.',
      });
    }
    await ctx.prisma.pipeline.delete({ where: { id } });
    return { ok: true };
  },

  async addStage(ctx: Ctx, pipelineId: string, input: CreateStageInput) {
    await this.assertOwnsPipeline(ctx, pipelineId);
    return ctx.prisma.pipelineStage.create({
      data: { ...input, pipelineId },
    });
  },

  async updateStage(ctx: Ctx, input: UpdateStageInput) {
    const stage = await ctx.prisma.pipelineStage.findUnique({
      where: { id: input.id },
      include: { pipeline: true },
    });
    if (!stage || stage.pipeline.workspaceId !== ctx.workspace.id) {
      throw new TRPCError({ code: 'NOT_FOUND' });
    }
    const { id, ...data } = input;
    return ctx.prisma.pipelineStage.update({ where: { id }, data });
  },

  async deleteStage(ctx: Ctx, id: string) {
    const stage = await ctx.prisma.pipelineStage.findUnique({
      where: { id },
      include: { pipeline: true, _count: { select: { deals: true } } },
    });
    if (!stage || stage.pipeline.workspaceId !== ctx.workspace.id) {
      throw new TRPCError({ code: 'NOT_FOUND' });
    }
    if (stage._count.deals > 0) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Move the deals out of this stage first.',
      });
    }
    await ctx.prisma.pipelineStage.delete({ where: { id } });
    return { ok: true };
  },

  async reorderStages(ctx: Ctx, input: ReorderStagesInput) {
    await this.assertOwnsPipeline(ctx, input.pipelineId);
    await ctx.prisma.$transaction(
      input.stageIds.map((id, i) =>
        ctx.prisma.pipelineStage.update({
          where: { id },
          data: { position: i },
        }),
      ),
    );
    return { ok: true };
  },

  async assertOwnsPipeline(ctx: { prisma: Context['prisma']; workspace: { id: string } }, pipelineId: string) {
    const exists = await ctx.prisma.pipeline.findFirst({
      where: { id: pipelineId, workspaceId: ctx.workspace.id },
      select: { id: true },
    });
    if (!exists) throw new TRPCError({ code: 'NOT_FOUND' });
  },

  // Re-exported for typing convenience.
  _Prisma: Prisma,
};
