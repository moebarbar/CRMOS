'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { customField as customFieldSchemas } from '@chiefos/shared';
import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';

type FormValues = customFieldSchemas.CreateCustomFieldInput;

export function CustomFieldsManager({ entity }: { entity: customFieldSchemas.CustomFieldEntity }) {
  const utils = trpc.useUtils();
  const list = trpc.customFields.list.useQuery({ entity });
  const [optionsText, setOptionsText] = useState('');

  const create = trpc.customFields.create.useMutation({
    onSuccess: () => {
      toast.success('Field added');
      reset(defaultValues(entity));
      setOptionsText('');
      void utils.customFields.list.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const remove = trpc.customFields.delete.useMutation({
    onSuccess: () => {
      toast.success('Field deleted');
      void utils.customFields.list.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(customFieldSchemas.createCustomFieldSchema),
    defaultValues: defaultValues(entity),
  });

  const fieldType = watch('type');
  const needsOptions = fieldType === 'SELECT' || fieldType === 'MULTI_SELECT';

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSubmit((values) => {
          if (needsOptions) {
            values.options = optionsText
              .split('\n')
              .map((line) => line.trim())
              .filter(Boolean)
              .map((label) => ({
                value: label
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, '_')
                  .replace(/^_|_$/g, ''),
                label,
              }));
          } else {
            values.options = undefined;
          }
          create.mutate(values);
        })}
        className="bg-card grid gap-3 rounded-lg border p-4 md:grid-cols-2"
      >
        <div className="space-y-1.5">
          <Label>Label</Label>
          <Input placeholder="Budget tier" {...register('label')} />
          {errors.label && <p className="text-destructive text-xs">{errors.label.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Key (snake_case)</Label>
          <Input placeholder="budget_tier" {...register('key')} />
          {errors.key && <p className="text-destructive text-xs">{errors.key.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Type</Label>
          <select
            className="border-input h-9 w-full rounded-md border bg-transparent px-3 text-sm shadow-sm"
            {...register('type')}
          >
            {customFieldSchemas.CUSTOM_FIELD_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-2 self-end pb-1 text-sm">
          <input type="checkbox" {...register('required')} />
          Required
        </label>

        {needsOptions && (
          <div className="space-y-1.5 md:col-span-2">
            <Label>Options (one per line)</Label>
            <textarea
              className="border-input min-h-[80px] w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm"
              placeholder={'Small\nMedium\nLarge'}
              value={optionsText}
              onChange={(e) => setOptionsText(e.target.value)}
            />
          </div>
        )}

        <div className="md:col-span-2">
          <Button type="submit" disabled={create.isPending}>
            {create.isPending ? 'Adding…' : 'Add field'}
          </Button>
        </div>
      </form>

      {list.isLoading ? (
        <Skeleton className="h-32 w-full" />
      ) : !list.data || list.data.length === 0 ? (
        <p className="bg-card text-muted-foreground rounded-lg border p-6 text-center text-sm">
          No custom fields for {entity.toLowerCase()} yet.
        </p>
      ) : (
        <ul className="bg-card divide-y rounded-lg border">
          {list.data.map((f) => (
            <li key={f.id} className="flex items-center gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{f.label}</p>
                <p className="text-muted-foreground text-xs">
                  {f.key} · {f.type}
                  {f.required && ' · required'}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                disabled={remove.isPending}
                onClick={() => {
                  if (confirm(`Delete field "${f.label}"?`)) remove.mutate({ id: f.id });
                }}
              >
                Delete
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function defaultValues(
  entity: customFieldSchemas.CustomFieldEntity,
): customFieldSchemas.CreateCustomFieldInput {
  return {
    entity,
    key: '',
    label: '',
    type: 'TEXT',
    required: false,
    position: 0,
    showInList: false,
  };
}
