'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { workspace as workspaceSchemas } from '@chiefos/shared';
import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type FormValues = workspaceSchemas.CreateWorkspaceInput;

export function CreateWorkspaceForm() {
  const router = useRouter();
  const create = trpc.workspace.create.useMutation({
    onSuccess: (workspace) => {
      toast.success(`Welcome to ${workspace.name}.`);
      router.push(`/${workspace.slug}`);
    },
    onError: (err) => toast.error(err.message),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(workspaceSchemas.createWorkspaceSchema),
    defaultValues: {
      name: '',
      slug: '',
      defaultCurrency: 'USD',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    },
  });

  const name = watch('name');

  return (
    <form
      className="bg-card space-y-4 rounded-lg border p-6 shadow-sm"
      onSubmit={handleSubmit((values) => create.mutate(values))}
    >
      <div className="space-y-1.5">
        <Label htmlFor="name">Workspace name</Label>
        <Input
          id="name"
          autoFocus
          placeholder="Acme Studio"
          {...register('name', {
            onChange: (e) => {
              const slug = e.target.value
                .toLowerCase()
                .replace(/[^a-z0-9-\s]/g, '')
                .trim()
                .replace(/\s+/g, '-')
                .slice(0, 32);
              setValue('slug', slug, { shouldValidate: true });
            },
          })}
        />
        {errors.name && <p className="text-destructive text-xs">{errors.name.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="slug">URL</Label>
        <div className="bg-background focus-within:ring-ring flex items-center overflow-hidden rounded-md border focus-within:ring-1">
          <span className="text-muted-foreground px-3 text-xs">chiefos.app/</span>
          <input
            id="slug"
            className="flex-1 bg-transparent py-1.5 pr-3 text-sm outline-none"
            {...register('slug')}
          />
        </div>
        {errors.slug && <p className="text-destructive text-xs">{errors.slug.message}</p>}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting || create.isPending}>
        {create.isPending ? 'Creating…' : `Create ${name || 'workspace'}`}
      </Button>
    </form>
  );
}
