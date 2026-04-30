'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { tag as tagSchemas } from '@chiefos/shared';
import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';

const PRESET_COLORS = [
  '#7c3aed',
  '#2563eb',
  '#0891b2',
  '#10b981',
  '#65a30d',
  '#f59e0b',
  '#ef4444',
  '#ec4899',
  '#a855f7',
  '#94a3b8',
];

export function TagsManager() {
  const utils = trpc.useUtils();
  const list = trpc.tags.list.useQuery();

  const create = trpc.tags.create.useMutation({
    onSuccess: () => {
      toast.success('Tag created');
      reset({ name: '', color: '#7c3aed', scope: 'CONTACT' });
      void utils.tags.list.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const remove = trpc.tags.delete.useMutation({
    onSuccess: () => {
      toast.success('Tag deleted');
      void utils.tags.list.invalidate();
      void utils.contacts.list.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<tagSchemas.CreateTagInput>({
    resolver: zodResolver(tagSchemas.createTagSchema),
    defaultValues: { name: '', color: '#7c3aed', scope: 'CONTACT' },
  });

  const color = watch('color');

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSubmit((v) => create.mutate(v))}
        className="flex flex-wrap items-end gap-3 rounded-lg border bg-card p-4"
      >
        <div className="flex-1 min-w-[200px] space-y-1.5">
          <Label htmlFor="tag-name">Name</Label>
          <Input id="tag-name" placeholder="VIP, Partner, …" {...register('name')} />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Scope</Label>
          <select
            className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm"
            {...register('scope')}
          >
            {tagSchemas.TAG_SCOPES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label>Color</Label>
          <ColorPicker value={color} onChange={(c) => setValue('color', c, { shouldValidate: true })} />
        </div>
        <Button type="submit" disabled={create.isPending}>
          {create.isPending ? 'Adding…' : 'Add tag'}
        </Button>
      </form>

      {list.isLoading ? (
        <Skeleton className="h-32 w-full" />
      ) : !list.data || list.data.length === 0 ? (
        <p className="rounded-lg border bg-card p-6 text-center text-sm text-muted-foreground">
          No tags yet.
        </p>
      ) : (
        <ul className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
          {list.data.map((t) => (
            <li
              key={t.id}
              className="flex items-center gap-3 rounded-lg border bg-card px-3 py-2"
            >
              <span
                aria-hidden
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: t.color }}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.scope.toLowerCase()}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                disabled={remove.isPending}
                onClick={() => {
                  if (confirm(`Delete tag "${t.name}"?`)) remove.mutate({ id: t.id });
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

function ColorPicker({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  return (
    <div className="flex items-center gap-1">
      {PRESET_COLORS.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          className={
            'h-6 w-6 rounded-full border-2 transition-transform ' +
            (value === c ? 'scale-110 border-foreground' : 'border-transparent')
          }
          style={{ backgroundColor: c }}
          aria-label={c}
        />
      ))}
    </div>
  );
}
