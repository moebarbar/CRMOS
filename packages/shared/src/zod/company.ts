import { z } from 'zod';

const optionalUrl = z
  .string()
  .trim()
  .url()
  .optional()
  .or(z.literal('').transform(() => undefined));

const optionalString = z
  .string()
  .trim()
  .optional()
  .or(z.literal('').transform(() => undefined));

export const createCompanySchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120),
  domain: optionalString,
  industry: optionalString,
  size: optionalString,
  description: optionalString,
  websiteUrl: optionalUrl,
  linkedinUrl: optionalUrl,
  logoUrl: optionalUrl,

  addressLine1: optionalString,
  city: optionalString,
  region: optionalString,
  postalCode: optionalString,
  country: optionalString,

  ownerId: z.string().cuid().nullable().optional(),
  customFields: z.record(z.unknown()).default({}),
});
export type CreateCompanyInput = z.infer<typeof createCompanySchema>;

export const updateCompanySchema = createCompanySchema.partial().extend({
  id: z.string().cuid(),
});
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;

export const listCompaniesSchema = z.object({
  search: optionalString,
  cursor: z.string().cuid().optional(),
  limit: z.number().int().min(1).max(100).default(50),
});
export type ListCompaniesInput = z.infer<typeof listCompaniesSchema>;
