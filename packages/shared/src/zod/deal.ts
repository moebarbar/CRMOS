import { z } from 'zod';

export const DEAL_STATUSES = ['OPEN', 'WON', 'LOST'] as const;
export const dealStatusSchema = z.enum(DEAL_STATUSES);
export type DealStatus = z.infer<typeof dealStatusSchema>;

const optionalString = z
  .string()
  .trim()
  .optional()
  .or(z.literal('').transform(() => undefined));

export const createDealSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(120),
  pipelineId: z.string().cuid(),
  stageId: z.string().cuid(),
  contactId: z.string().cuid().nullable().optional(),
  companyId: z.string().cuid().nullable().optional(),
  ownerId: z.string().cuid().nullable().optional(),
  value: z.coerce.number().min(0).default(0),
  currency: z.string().length(3).default('USD'),
  expectedCloseDate: z.coerce.date().nullable().optional(),
  source: optionalString,
  description: optionalString,
  customFields: z.record(z.unknown()).default({}),
});
export type CreateDealInput = z.infer<typeof createDealSchema>;

export const updateDealSchema = createDealSchema.partial().extend({
  id: z.string().cuid(),
});
export type UpdateDealInput = z.infer<typeof updateDealSchema>;

export const moveDealSchema = z.object({
  id: z.string().cuid(),
  stageId: z.string().cuid(),
});
export type MoveDealInput = z.infer<typeof moveDealSchema>;

export const markWonSchema = z.object({
  id: z.string().cuid(),
  actualValue: z.coerce.number().min(0).optional(),
  closedAt: z.coerce.date().optional(),
});
export type MarkWonInput = z.infer<typeof markWonSchema>;

export const markLostSchema = z.object({
  id: z.string().cuid(),
  reason: z.string().trim().min(1, 'A reason is required').max(200),
  closedAt: z.coerce.date().optional(),
});
export type MarkLostInput = z.infer<typeof markLostSchema>;

export const listDealsSchema = z.object({
  pipelineId: z.string().cuid().optional(),
  stageId: z.string().cuid().optional(),
  ownerId: z.string().cuid().optional(),
  status: dealStatusSchema.optional(),
  contactId: z.string().cuid().optional(),
  companyId: z.string().cuid().optional(),
  search: optionalString,
  cursor: z.string().cuid().optional(),
  limit: z.number().int().min(1).max(200).default(100),
});
export type ListDealsInput = z.infer<typeof listDealsSchema>;
