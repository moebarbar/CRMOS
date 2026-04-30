import { z } from 'zod';
import { note as noteSchemas } from '@chiefos/shared';
import { createTRPCRouter, workspaceProcedure } from '../trpc';
import { noteService } from '@/server/services/note.service';

export const notesRouter = createTRPCRouter({
  listFor: workspaceProcedure
    .input(
      z.object({
        targetType: noteSchemas.activityTargetTypeSchema,
        targetId: z.string().cuid(),
      }),
    )
    .query(({ ctx, input }) => noteService.listFor(ctx, input.targetType, input.targetId)),

  create: workspaceProcedure
    .input(noteSchemas.createNoteSchema)
    .mutation(({ ctx, input }) => noteService.create(ctx, input)),

  update: workspaceProcedure
    .input(noteSchemas.updateNoteSchema)
    .mutation(({ ctx, input }) => noteService.update(ctx, input)),

  delete: workspaceProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(({ ctx, input }) => noteService.delete(ctx, input.id)),
});
