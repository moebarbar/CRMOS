import { z } from 'zod';

export const CUSTOM_FIELD_ENTITIES = [
  'CONTACT',
  'COMPANY',
  'DEAL',
  'PROJECT',
  'TASK',
  'INVOICE',
  'PROPOSAL',
] as const;
export const customFieldEntitySchema = z.enum(CUSTOM_FIELD_ENTITIES);
export type CustomFieldEntity = z.infer<typeof customFieldEntitySchema>;

export const CUSTOM_FIELD_TYPES = [
  'TEXT',
  'TEXTAREA',
  'NUMBER',
  'CURRENCY',
  'DATE',
  'DATETIME',
  'BOOLEAN',
  'SELECT',
  'MULTI_SELECT',
  'EMAIL',
  'PHONE',
  'URL',
  'ADDRESS',
  'USER',
  'CONTACT',
  'FILE',
] as const;
export const customFieldTypeSchema = z.enum(CUSTOM_FIELD_TYPES);
export type CustomFieldType = z.infer<typeof customFieldTypeSchema>;

const optionSchema = z.object({
  value: z.string().min(1),
  label: z.string().min(1),
  color: z.string().optional(),
});

export const createCustomFieldSchema = z.object({
  entity: customFieldEntitySchema,
  key: z
    .string()
    .trim()
    .min(1)
    .max(40)
    .regex(/^[a-z][a-z0-9_]*$/, 'Use snake_case: lowercase letters, numbers, underscores'),
  label: z.string().trim().min(1).max(60),
  type: customFieldTypeSchema,
  options: z.array(optionSchema).optional(),
  required: z.boolean().default(false),
  defaultValue: z.unknown().optional(),
  position: z.number().int().min(0).default(0),
  showInList: z.boolean().default(false),
});
export type CreateCustomFieldInput = z.infer<typeof createCustomFieldSchema>;

export const updateCustomFieldSchema = createCustomFieldSchema.partial().extend({
  id: z.string().cuid(),
});
export type UpdateCustomFieldInput = z.infer<typeof updateCustomFieldSchema>;

/**
 * Validate a customFields JSON value against a list of definitions.
 * Returns coerced values + an array of issues.
 */
export function validateCustomFields(
  defs: Pick<CreateCustomFieldInput, 'key' | 'type' | 'required' | 'options'>[],
  values: Record<string, unknown>,
) {
  const out: Record<string, unknown> = {};
  const issues: { key: string; message: string }[] = [];

  for (const def of defs) {
    const raw = values[def.key];
    if (raw === undefined || raw === null || raw === '') {
      if (def.required) issues.push({ key: def.key, message: `${def.key} is required` });
      continue;
    }

    switch (def.type) {
      case 'TEXT':
      case 'TEXTAREA':
      case 'PHONE':
      case 'ADDRESS':
        if (typeof raw !== 'string') issues.push({ key: def.key, message: 'must be a string' });
        else out[def.key] = raw;
        break;
      case 'NUMBER':
      case 'CURRENCY': {
        const n = typeof raw === 'number' ? raw : Number(raw);
        if (Number.isNaN(n)) issues.push({ key: def.key, message: 'must be a number' });
        else out[def.key] = n;
        break;
      }
      case 'BOOLEAN':
        out[def.key] = Boolean(raw);
        break;
      case 'DATE':
      case 'DATETIME': {
        const d = raw instanceof Date ? raw : new Date(String(raw));
        if (Number.isNaN(d.getTime())) issues.push({ key: def.key, message: 'invalid date' });
        else out[def.key] = d.toISOString();
        break;
      }
      case 'EMAIL': {
        const s = String(raw);
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s))
          issues.push({ key: def.key, message: 'invalid email' });
        else out[def.key] = s.toLowerCase();
        break;
      }
      case 'URL': {
        try {
          out[def.key] = new URL(String(raw)).toString();
        } catch {
          issues.push({ key: def.key, message: 'invalid url' });
        }
        break;
      }
      case 'SELECT': {
        const allowed = (def.options ?? []).map((o) => o.value);
        if (!allowed.includes(String(raw))) {
          issues.push({ key: def.key, message: 'value not allowed' });
        } else {
          out[def.key] = String(raw);
        }
        break;
      }
      case 'MULTI_SELECT': {
        const arr = Array.isArray(raw) ? raw.map(String) : [];
        const allowed = new Set((def.options ?? []).map((o) => o.value));
        const filtered = arr.filter((v) => allowed.has(v));
        out[def.key] = filtered;
        break;
      }
      case 'USER':
      case 'CONTACT':
      case 'FILE':
        // FK ids — basic shape check; deep auth check happens at the service.
        if (typeof raw !== 'string') issues.push({ key: def.key, message: 'must be an id' });
        else out[def.key] = raw;
        break;
    }
  }

  return { values: out, issues };
}
