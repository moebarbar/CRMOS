import { z } from 'zod';
import { customField as customFieldSchemas } from '@chiefos/shared';
import { createTRPCRouter, workspaceProcedure } from '../trpc';
import { customFieldService } from '@/server/services/customField.service';

export const customFieldsRouter = createTRPCRouter({
  list: workspaceProcedure
    .input(z.object({ entity: customFieldSchemas.customFieldEntitySchema.optional() }).optional())
    .query(({ ctx, input }) => customFieldService.list(ctx, input?.entity)),

  create: workspaceProcedure
    .input(customFieldSchemas.createCustomFieldSchema)
    .mutation(({ ctx, input }) => customFieldService.create(ctx, input)),

  update: workspaceProcedure
    .input(customFieldSchemas.updateCustomFieldSchema)
    .mutation(({ ctx, input }) => customFieldService.update(ctx, input)),

  delete: workspaceProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(({ ctx, input }) => customFieldService.delete(ctx, input.id)),
});
