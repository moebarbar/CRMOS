import { z } from 'zod';
import { contact as contactSchemas } from '@chiefos/shared';
import { createTRPCRouter, workspaceProcedure } from '../trpc';
import { contactService } from '@/server/services/contact.service';

const bulkImportInputSchema = z.object({
  rows: z
    .array(
      z.object({
        firstName: z.string().nullable().optional(),
        lastName: z.string().nullable().optional(),
        email: z.string().nullable().optional(),
        phone: z.string().nullable().optional(),
        jobTitle: z.string().nullable().optional(),
        city: z.string().nullable().optional(),
        country: z.string().nullable().optional(),
      }),
    )
    .min(1)
    .max(2000),
});

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

  bulkImport: workspaceProcedure
    .input(bulkImportInputSchema)
    .mutation(({ ctx, input }) => contactService.bulkImport(ctx, input.rows)),
});
