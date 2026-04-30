import { notFound, redirect } from 'next/navigation';
import { TRPCError } from '@trpc/server';
import { getCurrentUser } from '@/lib/auth/clerk';
import { getServerCaller } from '@/lib/trpc/server';
import { TRPCProvider } from '@/lib/trpc/client';
import { AppShell } from '@/components/layout/AppShell';

interface Props {
  children: React.ReactNode;
  params: { workspace: string };
}

export default async function WorkspaceLayout({ children, params }: Props) {
  const user = await getCurrentUser();
  if (!user) redirect('/sign-in');

  const slug = params.workspace;
  const caller = await getServerCaller(slug);

  let workspace: Awaited<ReturnType<typeof caller.workspace.current>>;
  try {
    workspace = await caller.workspace.current();
  } catch (err) {
    if (err instanceof TRPCError) {
      if (err.code === 'NOT_FOUND') notFound();
      if (err.code === 'FORBIDDEN' || err.code === 'BAD_REQUEST') {
        redirect('/onboarding');
      }
    }
    throw err;
  }

  const workspaces = await caller.workspace.listMine();

  return (
    <TRPCProvider workspaceSlug={slug}>
      <AppShell workspace={workspace} workspaces={workspaces} user={user}>
        {children}
      </AppShell>
    </TRPCProvider>
  );
}
