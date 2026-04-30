'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { deal as dealSchemas } from '@chiefos/shared';
import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Props {
  workspaceSlug: string;
  mode: 'create' | 'edit';
  initialPipelineId?: string;
  initial?: Partial<dealSchemas.CreateDealInput> & { id?: string };
}

export function DealForm({ workspaceSlug, mode, initialPipelineId, initial }: Props) {
  const router = useRouter();
  const utils = trpc.useUtils();
  const pipelines = trpc.pipelines.list.useQuery();

  const create = trpc.deals.create.useMutation({
    onSuccess: (d) => {
      toast.success('Deal created');
      void utils.deals.list.invalidate();
      router.push(`/${workspaceSlug}/deals/${d.id}`);
    },
    onError: (err) => toast.error(err.message),
  });

  const update = trpc.deals.update.useMutation({
    onSuccess: () => {
      toast.success('Saved');
      if (initial?.id) void utils.deals.get.invalidate({ id: initial.id });
      void utils.deals.list.invalidate();
      router.push(`/${workspaceSlug}/deals/${initial?.id}`);
    },
    onError: (err) => toast.error(err.message),
  });

  const form = useForm<dealSchemas.CreateDealInput>({
    resolver: zodResolver(dealSchemas.createDealSchema),
    defaultValues: {
      title: initial?.title ?? '',
      pipelineId: initial?.pipelineId ?? initialPipelineId ?? '',
      stageId: initial?.stageId ?? '',
      value: Number(initial?.value ?? 0),
      currency: initial?.currency ?? 'USD',
      expectedCloseDate: initial?.expectedCloseDate ?? null,
      contactId: initial?.contactId ?? null,
      companyId: initial?.companyId ?? null,
      ownerId: initial?.ownerId ?? null,
      source: initial?.source ?? '',
      description: initial?.description ?? '',
      customFields: initial?.customFields ?? {},
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = form;

  const selectedPipelineId = watch('pipelineId');
  const selectedStageId = watch('stageId');
  const selectedPipeline = pipelines.data?.find((p) => p.id === selectedPipelineId);

  // Auto-pick first stage when switching pipeline.
  useEffect(() => {
    if (selectedPipeline && !selectedStageId) {
      const first = selectedPipeline.stages[0];
      if (first) setValue('stageId', first.id);
    }
  }, [selectedPipeline, selectedStageId, setValue]);

  // Auto-pick default pipeline if none selected.
  useEffect(() => {
    if (!selectedPipelineId && pipelines.data) {
      const def = pipelines.data.find((p) => p.isDefault) ?? pipelines.data[0];
      if (def) {
        setValue('pipelineId', def.id);
        const first = def.stages[0];
        if (first) setValue('stageId', first.id);
      }
    }
  }, [selectedPipelineId, pipelines.data, setValue]);

  const onSubmit = handleSubmit((values) => {
    if (mode === 'create') return create.mutate(values);
    if (initial?.id) update.mutate({ id: initial.id, ...values });
  });

  const pending = create.isPending || update.isPending || isSubmitting;

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid gap-4 rounded-lg border bg-card p-6 md:grid-cols-2">
        <div className="md:col-span-2">
          <Field label="Title" error={errors.title?.message}>
            <Input {...register('title')} autoFocus placeholder="Acme Q4 retainer" />
          </Field>
        </div>
        <Field label="Pipeline">
          <select
            className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm"
            {...register('pipelineId')}
          >
            <option value="">—</option>
            {pipelines.data?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Stage">
          <select
            className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm"
            {...register('stageId')}
            disabled={!selectedPipeline}
          >
            <option value="">—</option>
            {selectedPipeline?.stages.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Value">
          <Input type="number" step="0.01" {...register('value', { valueAsNumber: true })} />
        </Field>
        <Field label="Currency">
          <Input {...register('currency')} />
        </Field>
        <Field label="Expected close">
          <Input
            type="date"
            {...register('expectedCloseDate', {
              setValueAs: (v) => (v ? new Date(v) : null),
            })}
          />
        </Field>
        <Field label="Source">
          <Input {...register('source')} placeholder="Referral, inbound, …" />
        </Field>
        <div className="md:col-span-2">
          <Field label="Description">
            <Textarea rows={3} {...register('description')} />
          </Field>
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? 'Saving…' : mode === 'create' ? 'Create deal' : 'Save changes'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
