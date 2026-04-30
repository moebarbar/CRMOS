'use client';

import { useRouter } from 'next/navigation';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { contact as contactSchemas } from '@chiefos/shared';
import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CustomFieldsSection } from '@/components/modules/customFields/CustomFieldsSection';

type Mode = 'create' | 'edit';

interface Props {
  workspaceSlug: string;
  mode: Mode;
  initial?: Partial<contactSchemas.CreateContactInput> & { id?: string };
}

export function ContactForm({ workspaceSlug, mode, initial }: Props) {
  const router = useRouter();
  const utils = trpc.useUtils();

  const create = trpc.contacts.create.useMutation({
    onSuccess: (c) => {
      toast.success('Contact created');
      void utils.contacts.list.invalidate();
      router.push(`/${workspaceSlug}/contacts/${c.id}`);
    },
    onError: (err) => toast.error(err.message),
  });

  const update = trpc.contacts.update.useMutation({
    onSuccess: () => {
      toast.success('Saved');
      void utils.contacts.list.invalidate();
      if (initial?.id) void utils.contacts.get.invalidate({ id: initial.id });
      router.push(`/${workspaceSlug}/contacts/${initial?.id}`);
    },
    onError: (err) => toast.error(err.message),
  });

  const form = useForm<contactSchemas.CreateContactInput>({
    resolver: zodResolver(contactSchemas.createContactSchema),
    defaultValues: {
      firstName: initial?.firstName ?? '',
      lastName: initial?.lastName ?? '',
      email: initial?.email ?? '',
      phone: initial?.phone ?? '',
      jobTitle: initial?.jobTitle ?? '',
      websiteUrl: initial?.websiteUrl ?? '',
      linkedinUrl: initial?.linkedinUrl ?? '',
      city: initial?.city ?? '',
      country: initial?.country ?? '',
      lifecycleStage: initial?.lifecycleStage ?? 'LEAD',
      leadScore: initial?.leadScore ?? 0,
      doNotEmail: initial?.doNotEmail ?? false,
      doNotCall: initial?.doNotCall ?? false,
      tagIds: initial?.tagIds ?? [],
      customFields: initial?.customFields ?? {},
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  const onSubmit = handleSubmit((values) => {
    if (mode === 'create') return create.mutate(values);
    if (initial?.id) update.mutate({ id: initial.id, ...values });
  });

  const pending = create.isPending || update.isPending || isSubmitting;

  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid gap-4 rounded-lg border bg-card p-6 md:grid-cols-2">
          <Field label="First name" error={errors.firstName?.message}>
            <Input {...register('firstName')} autoFocus />
          </Field>
          <Field label="Last name" error={errors.lastName?.message}>
            <Input {...register('lastName')} />
          </Field>
          <Field label="Email" error={errors.email?.message}>
            <Input type="email" {...register('email')} />
          </Field>
          <Field label="Phone" error={errors.phone?.message}>
            <Input {...register('phone')} />
          </Field>
          <Field label="Job title">
            <Input {...register('jobTitle')} />
          </Field>
          <Field label="Lifecycle stage">
            <select
              className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:ring-1 focus-visible:ring-ring"
              {...register('lifecycleStage')}
            >
              {contactSchemas.LIFECYCLE_STAGES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
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

          <label className="flex items-center gap-2 text-sm md:col-span-2">
            <input type="checkbox" {...register('doNotEmail')} />
            Do not email
          </label>
          <label className="flex items-center gap-2 text-sm md:col-span-2">
            <input type="checkbox" {...register('doNotCall')} />
            Do not call
          </label>
        </div>

        <CustomFieldsSection entity="CONTACT" />

        <div className="flex gap-2">
          <Button type="submit" disabled={pending}>
            {pending ? 'Saving…' : mode === 'create' ? 'Create contact' : 'Save changes'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </FormProvider>
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
