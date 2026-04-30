'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { company as companySchemas } from '@chiefos/shared';
import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Props {
  workspaceSlug: string;
  mode: 'create' | 'edit';
  initial?: Partial<companySchemas.CreateCompanyInput> & { id?: string };
}

export function CompanyForm({ workspaceSlug, mode, initial }: Props) {
  const router = useRouter();
  const utils = trpc.useUtils();

  const create = trpc.companies.create.useMutation({
    onSuccess: (c) => {
      toast.success('Company created');
      void utils.companies.list.invalidate();
      router.push(`/${workspaceSlug}/companies/${c.id}`);
    },
    onError: (err) => toast.error(err.message),
  });

  const update = trpc.companies.update.useMutation({
    onSuccess: () => {
      toast.success('Saved');
      void utils.companies.list.invalidate();
      if (initial?.id) void utils.companies.get.invalidate({ id: initial.id });
      router.push(`/${workspaceSlug}/companies/${initial?.id}`);
    },
    onError: (err) => toast.error(err.message),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<companySchemas.CreateCompanyInput>({
    resolver: zodResolver(companySchemas.createCompanySchema),
    defaultValues: {
      name: initial?.name ?? '',
      domain: initial?.domain ?? '',
      industry: initial?.industry ?? '',
      size: initial?.size ?? '',
      description: initial?.description ?? '',
      websiteUrl: initial?.websiteUrl ?? '',
      linkedinUrl: initial?.linkedinUrl ?? '',
      city: initial?.city ?? '',
      country: initial?.country ?? '',
      customFields: initial?.customFields ?? {},
    },
  });

  const onSubmit = handleSubmit((values) => {
    if (mode === 'create') return create.mutate(values);
    if (initial?.id) update.mutate({ id: initial.id, ...values });
  });

  const pending = create.isPending || update.isPending || isSubmitting;

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid gap-4 rounded-lg border bg-card p-6 md:grid-cols-2">
        <Field label="Name" error={errors.name?.message}>
          <Input {...register('name')} autoFocus />
        </Field>
        <Field label="Domain" error={errors.domain?.message}>
          <Input {...register('domain')} placeholder="acme.com" />
        </Field>
        <Field label="Industry">
          <Input {...register('industry')} />
        </Field>
        <Field label="Size">
          <select
            className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm"
            {...register('size')}
          >
            <option value="">—</option>
            <option value="1-10">1–10</option>
            <option value="11-50">11–50</option>
            <option value="51-200">51–200</option>
            <option value="201-500">201–500</option>
            <option value="501-1000">501–1000</option>
            <option value="1000+">1000+</option>
          </select>
        </Field>
        <Field label="Website" error={errors.websiteUrl?.message}>
          <Input {...register('websiteUrl')} placeholder="https://" />
        </Field>
        <Field label="LinkedIn" error={errors.linkedinUrl?.message}>
          <Input {...register('linkedinUrl')} placeholder="https://" />
        </Field>
        <Field label="City">
          <Input {...register('city')} />
        </Field>
        <Field label="Country">
          <Input {...register('country')} />
        </Field>
        <div className="md:col-span-2">
          <Field label="Description">
            <Textarea rows={3} {...register('description')} />
          </Field>
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? 'Saving…' : mode === 'create' ? 'Create company' : 'Save changes'}
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
