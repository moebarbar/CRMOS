'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';

export function DeleteCompanyButton({
  id,
  workspaceSlug,
  name,
  children,
}: {
  id: string;
  workspaceSlug: string;
  name: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const utils = trpc.useUtils();
  const remove = trpc.companies.delete.useMutation({
    onSuccess: () => {
      toast.success('Company moved to trash');
      void utils.companies.list.invalidate();
      router.push(`/${workspaceSlug}/companies`);
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={remove.isPending}
      onClick={() => {
        if (confirm(`Delete ${name}?`)) remove.mutate({ id });
      }}
    >
      {children}
    </Button>
  );
}
