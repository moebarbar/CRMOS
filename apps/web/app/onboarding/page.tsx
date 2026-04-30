import { redirect } from 'next/navigation';
import { getServerCaller } from '@/lib/trpc/server';
import { getCurrentUser } from '@/lib/auth/clerk';
import { CreateWorkspaceForm } from '@/components/onboarding/CreateWorkspaceForm';

export const metadata = { title: 'Get started' };

export default async function OnboardingPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/sign-in');

  // Already a member somewhere? Send them to their default workspace.
  const caller = await getServerCaller();
  const workspaces = await caller.workspace.listMine();
  if (workspaces.length > 0) {
    redirect(`/${workspaces[0]!.slug}`);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Create your workspace</h1>
          <p className="text-sm text-muted-foreground">
            Welcome{user.firstName ? `, ${user.firstName}` : ''}. One last step before you're in.
          </p>
        </div>
        <CreateWorkspaceForm />
      </div>
    </main>
  );
}
