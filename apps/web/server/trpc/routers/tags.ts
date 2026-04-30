import { z } from 'zod';
import { tag as tagSchemas } from '@chiefos/shared';
import { createTRPCRouter, workspaceProcedure } from '../trpc';
import { tagService } from '@/server/services/tag.service';

export const tagsRouter = createTRPCRouter({
  list: workspaceProcedure
    .input(z.object({ scope: tagSchemas.tagScopeSchema.optional() }).optional())
    .query(({ ctx, input }) => tagService.list(ctx, input?.scope)),

  create: workspaceProcedure
    .input(tagSchemas.createTagSchema)
    .mutation(({ ctx, input }) => tagService.create(ctx, input)),

  delete: workspaceProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(({ ctx, input }) => tagService.delete(ctx, input.id)),

  attach: workspaceProcedure
    .input(tagSchemas.attachTagSchema)
    .mutation(({ ctx, input }) => tagService.attach(ctx, input.contactId, input.tagId)),

  detach: workspaceProcedure
    .input(tagSchemas.attachTagSchema)
    .mutation(({ ctx, input }) => tagService.detach(ctx, input.contactId, input.tagId)),
});
