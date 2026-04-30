import { z } from 'zod';

export const LIFECYCLE_STAGES = [
  'SUBSCRIBER',
  'LEAD',
  'MQL',
  'SQL',
  'OPPORTUNITY',
  'CUSTOMER',
  'EVANGELIST',
  'OTHER',
] as const;
export const lifecycleStageSchema = z.enum(LIFECYCLE_STAGES);
export type LifecycleStage = z.infer<typeof lifecycleStageSchema>;

const optionalEmail = z
  .string()
  .trim()
  .toLowerCase()
  .email()
  .optional()
  .or(z.literal('').transform(() => undefined));

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

export const createContactSchema = z
  .object({
    firstName: optionalString,
    lastName: optionalString,
    email: optionalEmail,
    phone: optionalString,
    jobTitle: optionalString,
    companyId: z.string().cuid().nullable().optional(),
    avatarUrl: optionalUrl,
    websiteUrl: optionalUrl,
    linkedinUrl: optionalUrl,
    twitterUrl: optionalUrl,

    addressLine1: optionalString,
    addressLine2: optionalString,
    city: optionalString,
    region: optionalString,
    postalCode: optionalString,
    country: optionalString,

    ownerId: z.string().cuid().nullable().optional(),
    source: optionalString,
    lifecycleStage: lifecycleStageSchema.default('LEAD'),
    leadScore: z.number().int().min(0).max(100).default(0),
    doNotEmail: z.boolean().default(false),
    doNotCall: z.boolean().default(false),

    customFields: z.record(z.unknown()).default({}),
    tagIds: z.array(z.string().cuid()).default([]),
  })
  .refine(
    (data) =>
      Boolean(data.firstName) || Boolean(data.lastName) || Boolean(data.email) || Boolean(data.phone),
    { message: 'A contact needs at least a name, email, or phone.' },
  );
export type CreateContactInput = z.infer<typeof createContactSchema>;

export const updateContactSchema = createContactSchema._def.schema
  .partial()
  .extend({ id: z.string().cuid() });
export type UpdateContactInput = z.infer<typeof updateContactSchema>;

export const listContactsSchema = z.object({
  search: optionalString,
  lifecycleStage: lifecycleStageSchema.optional(),
  ownerId: z.string().cuid().optional(),
  companyId: z.string().cuid().optional(),
  tagId: z.string().cuid().optional(),
  cursor: z.string().cuid().optional(),
  limit: z.number().int().min(1).max(100).default(50),
  sort: z
    .enum(['createdAt:desc', 'createdAt:asc', 'lastName:asc', 'lastContactedAt:desc'])
    .default('createdAt:desc'),
});
export type ListContactsInput = z.infer<typeof listContactsSchema>;
