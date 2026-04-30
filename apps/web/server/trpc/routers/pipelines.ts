import { z } from 'zod';
import { pipeline as pipelineSchemas } from '@chiefos/shared';
import { createTRPCRouter, workspaceProcedure } from '../trpc';
import { pipelineService } from '@/server/services/pipeline.service';

export const pipelinesRouter = createTRPCRouter({
  list: workspaceProcedure.query(({ ctx }) => pipelineService.list(ctx)),

  get: workspaceProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(({ ctx, input }) => pipelineService.get(ctx, input.id)),

  default: workspaceProcedure.query(({ ctx }) => pipelineService.getDefault(ctx)),

  ensureDefault: workspaceProcedure.mutation(({ ctx }) =>
    pipelineService.seedDefaultIfMissing(ctx),
  ),

  create: workspaceProcedure
    .input(pipelineSchemas.createPipelineSchema)
    .mutation(({ ctx, input }) => pipelineService.create(ctx, input)),

  update: workspaceProcedure
    .input(pipelineSchemas.updatePipelineSchema)
    .mutation(({ ctx, input }) => pipelineService.update(ctx, input)),

  delete: workspaceProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(({ ctx, input }) => pipelineService.delete(ctx, input.id)),

  addStage: workspaceProcedure
    .input(z.object({ pipelineId: z.string().cuid(), stage: pipelineSchemas.createStageSchema }))
    .mutation(({ ctx, input }) => pipelineService.addStage(ctx, input.pipelineId, input.stage)),

  updateStage: workspaceProcedure
    .input(pipelineSchemas.updateStageSchema)
    .mutation(({ ctx, input }) => pipelineService.updateStage(ctx, input)),

  deleteStage: workspaceProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(({ ctx, input }) => pipelineService.deleteStage(ctx, input.id)),

  reorderStages: workspaceProcedure
    .input(pipelineSchemas.reorderStagesSchema)
    .mutation(({ ctx, input }) => pipelineService.reorderStages(ctx, input)),
});
