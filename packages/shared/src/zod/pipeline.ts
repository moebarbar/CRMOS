import { z } from 'zod';

const colorSchema = z
  .string()
  .regex(/^#[0-9a-f]{6}$/i)
  .default('#94a3b8');

export const createStageSchema = z.object({
  name: z.string().trim().min(1).max(40),
  position: z.number().int().min(0),
  probability: z.number().min(0).max(1).default(0.5),
  color: colorSchema,
  rotInDays: z.number().int().min(1).nullable().optional(),
  isWon: z.boolean().default(false),
  isLost: z.boolean().default(false),
});
export type CreateStageInput = z.infer<typeof createStageSchema>;

export const updateStageSchema = createStageSchema.partial().extend({
  id: z.string().cuid(),
});
export type UpdateStageInput = z.infer<typeof updateStageSchema>;

export const reorderStagesSchema = z.object({
  pipelineId: z.string().cuid(),
  stageIds: z.array(z.string().cuid()).min(1),
});
export type ReorderStagesInput = z.infer<typeof reorderStagesSchema>;

export const createPipelineSchema = z.object({
  name: z.string().trim().min(1).max(60),
  description: z.string().trim().max(500).optional(),
  isDefault: z.boolean().default(false),
  stages: z.array(createStageSchema).min(2).optional(),
});
export type CreatePipelineInput = z.infer<typeof createPipelineSchema>;

export const updatePipelineSchema = z.object({
  id: z.string().cuid(),
  name: z.string().trim().min(1).max(60).optional(),
  description: z.string().trim().max(500).nullable().optional(),
  isDefault: z.boolean().optional(),
});
export type UpdatePipelineInput = z.infer<typeof updatePipelineSchema>;

export const DEFAULT_SALES_STAGES: CreateStageInput[] = [
  { name: 'Lead', position: 0, probability: 0.1, color: '#94a3b8', isWon: false, isLost: false },
  { name: 'Qualified', position: 1, probability: 0.25, color: '#7c3aed', isWon: false, isLost: false },
  { name: 'Demo', position: 2, probability: 0.5, color: '#2563eb', isWon: false, isLost: false },
  { name: 'Proposal', position: 3, probability: 0.7, color: '#0891b2', isWon: false, isLost: false },
  { name: 'Won', position: 4, probability: 1, color: '#10b981', isWon: true, isLost: false },
  { name: 'Lost', position: 5, probability: 0, color: '#ef4444', isWon: false, isLost: true },
];
