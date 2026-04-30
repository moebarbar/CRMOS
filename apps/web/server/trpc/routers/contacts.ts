import { z } from 'zod';
import { contact as contactSchemas } from '@chiefos/shared';
import { createTRPCRouter, workspaceProcedure } from '../trpc';
import { contactService } from '@/server/services/contact.service';

export const contactsRouter = createTRPCRouter({
  list: workspaceProcedure
    .input(contactSchemas.listContactsSchema)
    .query(({ ctx, input }) => contactService.list(ctx, input)),

  get: workspaceProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(({ ctx, input }) => contactService.get(ctx, input.id)),

  create: workspaceProcedure
    .input(contactSchemas.createContactSchema)
    .mutation(({ ctx, input }) => contactService.create(ctx, input)),

  update: workspaceProcedure
    .input(contactSchemas.updateContactSchema)
    .mutation(({ ctx, input }) => contactService.update(ctx, input)),

  delete: workspaceProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(({ ctx, input }) => contactService.softDelete(ctx, input.id)),

  restore: workspaceProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(({ ctx, input }) => contactService.restore(ctx, input.id)),
});
