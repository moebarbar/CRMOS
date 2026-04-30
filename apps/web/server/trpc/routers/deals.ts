import { z } from 'zod';
import { deal as dealSchemas } from '@chiefos/shared';
import { createTRPCRouter, workspaceProcedure } from '../trpc';
import { dealService } from '@/server/services/deal.service';

export const dealsRouter = createTRPCRouter({
  list: workspaceProcedure
    .input(dealSchemas.listDealsSchema)
    .query(({ ctx, input }) => dealService.list(ctx, input)),

  get: workspaceProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(({ ctx, input }) => dealService.get(ctx, input.id)),

  create: workspaceProcedure
    .input(dealSchemas.createDealSchema)
    .mutation(({ ctx, input }) => dealService.create(ctx, input)),

  update: workspaceProcedure
    .input(dealSchemas.updateDealSchema)
    .mutation(({ ctx, input }) => dealService.update(ctx, input)),

  move: workspaceProcedure
    .input(dealSchemas.moveDealSchema)
    .mutation(({ ctx, input }) => dealService.move(ctx, input)),

  markWon: workspaceProcedure
    .input(dealSchemas.markWonSchema)
    .mutation(({ ctx, input }) => dealService.markWon(ctx, input)),

  markLost: workspaceProcedure
    .input(dealSchemas.markLostSchema)
    .mutation(({ ctx, input }) => dealService.markLost(ctx, input)),

  delete: workspaceProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(({ ctx, input }) => dealService.softDelete(ctx, input.id)),

  forecast: workspaceProcedure
    .input(z.object({ pipelineId: z.string().cuid().optional() }).optional())
    .query(({ ctx, input }) => dealService.forecast(ctx, input?.pipelineId)),
});
