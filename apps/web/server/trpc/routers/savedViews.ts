import { z } from 'zod';
import { savedView as savedViewSchemas } from '@chiefos/shared';
import { createTRPCRouter, workspaceProcedure } from '../trpc';
import { savedViewService } from '@/server/services/savedView.service';

export const savedViewsRouter = createTRPCRouter({
  listFor: workspaceProcedure
    .input(z.object({ entity: savedViewSchemas.savedViewEntitySchema }))
    .query(({ ctx, input }) => savedViewService.listFor(ctx, input.entity)),

  create: workspaceProcedure
    .input(savedViewSchemas.createSavedViewSchema)
    .mutation(({ ctx, input }) => savedViewService.create(ctx, input)),

  update: workspaceProcedure
    .input(savedViewSchemas.updateSavedViewSchema)
    .mutation(({ ctx, input }) => savedViewService.update(ctx, input)),

  delete: workspaceProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(({ ctx, input }) => savedViewService.delete(ctx, input.id)),
});
