import { z } from 'zod';

export const TAG_SCOPES = ['CONTACT', 'COMPANY', 'DEAL', 'PROJECT', 'TASK', 'FILE'] as const;
export const tagScopeSchema = z.enum(TAG_SCOPES);
export type TagScope = z.infer<typeof tagScopeSchema>;

const colorSchema = z
  .string()
  .regex(/^#[0-9a-f]{6}$/i, 'Use a hex color like #7c3aed')
  .default('#7c3aed');

export const createTagSchema = z.object({
  name: z.string().trim().min(1).max(40),
  color: colorSchema,
  scope: tagScopeSchema.default('CONTACT'),
});
export type CreateTagInput = z.infer<typeof createTagSchema>;

export const attachTagSchema = z.object({
  contactId: z.string().cuid(),
  tagId: z.string().cuid(),
});
export type AttachTagInput = z.infer<typeof attachTagSchema>;
