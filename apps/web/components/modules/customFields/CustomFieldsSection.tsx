'use client';

import { useFormContext } from 'react-hook-form';
import { trpc } from '@/lib/trpc/client';
import { CustomFieldRenderer } from './CustomFieldRenderer';
import type { CustomFieldEntity } from '@chiefos/shared/zod/customField';

/**
 * Renders custom fields for a given entity inside any react-hook-form context.
 * Reads/writes against `customFields.<key>` on the form values.
 */
export function CustomFieldsSection({ entity }: { entity: CustomFieldEntity }) {
  const { watch, setValue, formState } = useFormContext<{
    customFields: Record<string, unknown>;
  }>();
  const list = trpc.customFields.list.useQuery({ entity });
  const values = watch('customFields') ?? {};

  if (!list.data || list.data.length === 0) return null;

  return (
    <div className="space-y-1">
      <h3 className="text-muted-foreground text-sm font-semibold uppercase tracking-wider">
        Custom fields
      </h3>
      <div className="bg-card grid gap-4 rounded-lg border p-6 md:grid-cols-2">
        {list.data.map((def) => (
          <CustomFieldRenderer
            key={def.id}
            def={{
              id: def.id,
              key: def.key,
              label: def.label,
              type: def.type,
              required: def.required,
              options: (def.options as { value: string; label: string }[] | null) ?? null,
            }}
            value={values[def.key]}
            onChange={(v) =>
              setValue(`customFields.${def.key}` as never, v as never, { shouldDirty: true })
            }
            error={
              formState.errors.customFields && typeof formState.errors.customFields === 'object'
                ? undefined
                : undefined
            }
          />
        ))}
      </div>
    </div>
  );
}
