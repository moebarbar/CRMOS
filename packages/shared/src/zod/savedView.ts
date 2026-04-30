import { z } from 'zod';

export const SAVED_VIEW_ENTITIES = ['contact', 'company', 'deal', 'project', 'task'] as const;
export const savedViewEntitySchema = z.enum(SAVED_VIEW_ENTITIES);

export const createSavedViewSchema = z.object({
  entity: savedViewEntitySchema,
  name: z.string().trim().min(1).max(60),
  filters: z.record(z.unknown()).default({}),
  sort: z.string().optional(),
  columns: z.array(z.string()).default([]),
  isShared: z.boolean().default(false),
});
export type CreateSavedViewInput = z.infer<typeof createSavedViewSchema>;

export const updateSavedViewSchema = createSavedViewSchema.partial().extend({
  id: z.string().cuid(),
});
export type UpdateSavedViewInput = z.infer<typeof updateSavedViewSchema>;
