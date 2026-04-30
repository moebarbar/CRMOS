import { z } from 'zod';

export const ACTIVITY_TARGET_TYPES = [
  'CONTACT',
  'COMPANY',
  'DEAL',
  'PROJECT',
  'TASK',
  'PROPOSAL',
  'CONTRACT',
  'INVOICE',
  'PAYMENT',
  'FORM',
  'FORM_SUBMISSION',
  'BOOKING',
  'FILE',
  'CHANNEL',
  'WIKI_PAGE',
  'WORKFLOW',
  'WORKSPACE',
  'USER',
] as const;
export const activityTargetTypeSchema = z.enum(ACTIVITY_TARGET_TYPES);
export type ActivityTargetType = z.infer<typeof activityTargetTypeSchema>;

export const createNoteSchema = z.object({
  targetType: activityTargetTypeSchema,
  targetId: z.string().cuid(),
  body: z.string().trim().min(1, 'Note is empty').max(20_000),
  bodyJson: z.unknown().optional(),
  isPrivate: z.boolean().default(false),
});
export type CreateNoteInput = z.infer<typeof createNoteSchema>;

export const updateNoteSchema = z.object({
  id: z.string().cuid(),
  body: z.string().trim().min(1).max(20_000).optional(),
  bodyJson: z.unknown().optional(),
  isPrivate: z.boolean().optional(),
});
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
