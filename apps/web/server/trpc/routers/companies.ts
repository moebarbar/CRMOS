import { z } from 'zod';
import { company as companySchemas } from '@chiefos/shared';
import { createTRPCRouter, workspaceProcedure } from '../trpc';
import { companyService } from '@/server/services/company.service';

export const companiesRouter = createTRPCRouter({
  list: workspaceProcedure
    .input(companySchemas.listCompaniesSchema)
    .query(({ ctx, input }) => companyService.list(ctx, input)),

  get: workspaceProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(({ ctx, input }) => companyService.get(ctx, input.id)),

  create: workspaceProcedure
    .input(companySchemas.createCompanySchema)
    .mutation(({ ctx, input }) => companyService.create(ctx, input)),

  update: workspaceProcedure
    .input(companySchemas.updateCompanySchema)
    .mutation(({ ctx, input }) => companyService.update(ctx, input)),

  delete: workspaceProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(({ ctx, input }) => companyService.softDelete(ctx, input.id)),
});
