'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc/client';
import { Skeleton } from '@/components/ui/skeleton';

export function AcceptInviteClient({
  token,
  workspaceName,
}: {
  token: string;
  workspaceName: string;
}) {
  const router = useRouter();
  const fired = useRef(false);
  const accept = trpc.membership.acceptInvite.useMutation({
    onSuccess: ({ workspaceSlug }) => {
      toast.success(`Welcome to ${workspaceName}.`);
      router.replace(`/${workspaceSlug}`);
    },
    onError: (err) => toast.error(err.message),
  });

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    accept.mutate({ token });
  }, [token, accept]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-md space-y-4 rounded-lg border bg-card p-8 text-center shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight">
          Joining {workspaceName}…
        </h1>
        <Skeleton className="mx-auto h-4 w-48" />
        {accept.error && (
          <p className="text-sm text-destructive">{accept.error.message}</p>
        )}
      </div>
    </main>
  );
}