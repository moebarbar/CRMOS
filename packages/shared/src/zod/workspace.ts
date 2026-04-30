import { z } from 'zod';
import { RESERVED_WORKSPACE_SLUGS, WORKSPACE_SLUG_REGEX } from '../constants';

export const slugSchema = z
  .string()
  .min(2, 'At least 2 characters')
  .max(32, 'At most 32 characters')
  .regex(WORKSPACE_SLUG_REGEX, 'Lowercase letters, numbers, and dashes only')
  .refine((s) => !RESERVED_WORKSPACE_SLUGS.has(s), { message: 'That slug is reserved' });

export const createWorkspaceSchema = z.object({
  name: z.string().min(1, 'Name is required').max(80),
  slug: slugSchema,
  defaultCurrency: z.string().length(3).default('USD'),
  timezone: z.string().default('UTC'),
});
export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;

export const updateWorkspaceSchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(1).max(80).optional(),
  logoUrl: z.string().url().nullable().optional(),
  faviconUrl: z.string().url().nullable().optional(),
  brandPrimary: z
    .string()
    .regex(/^#[0-9a-f]{6}$/i)
    .optional(),
  brandAccent: z
    .string()
    .regex(/^#[0-9a-f]{6}$/i)
    .optional(),
  defaultCurrency: z.string().length(3).optional(),
  timezone: z.string().optional(),
  locale: z.string().optional(),
  weekStart: z.number().int().min(0).max(6).optional(),
  dateFormat: z.string().optional(),
  fromEmail: z.string().email().nullable().optional(),
  fromName: z.string().nullable().optional(),
});
export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceSchema>;
