import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';
import { Button } from '@/components/ui/button';
import { AcceptInviteClient } from '@/components/invite/AcceptInviteClient';

export const metadata = { title: 'Accept invite' };

export default async function InvitePage({ params }: { params: { token: string } }) {
  const membership = await prisma.membership.findUnique({
    where: { inviteToken: params.token },
    include: { workspace: { select: { name: true, slug: true } } },
  });

  if (!membership) {
    return (
      <Shell title="Invite not found" description="This invite is invalid or has already been used.">
        <Button asChild>
          <Link href="/">Go home</Link>
        </Button>
      </Shell>
    );
  }

  if (membership.inviteExpiresAt && membership.inviteExpiresAt < new Date()) {
    return (
      <Shell title="Invite expired" description="Ask the workspace owner to send a new invite.">
        <Button asChild>
          <Link href="/">Go home</Link>
        </Button>
      </Shell>
    );
  }

  const { userId } = await auth();
  if (!userId) {
    const signUpUrl = `/sign-up?redirect_url=${encodeURIComponent(`/invite/${params.token}`)}${
      membership.inviteEmail ? `&email=${encodeURIComponent(membership.inviteEmail)}` : ''
    }`;
    return (
      <Shell
        title={`Join ${membership.workspace.name}`}
        description={
          membership.inviteEmail
            ? `Create your account with ${membership.inviteEmail} to accept.`
            : 'Create your account to accept.'
        }
      >
        <div className="flex gap-2">
          <Button asChild>
            <Link href={signUpUrl}>Create account</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/sign-in?redirect_url=/invite/${params.token}`}>I already have one</Link>
          </Button>
        </div>
      </Shell>
    );
  }

  // Signed in — redirect through the client-only accept handler.
  return <AcceptInviteClient token={params.token} workspaceName={membership.workspace.name} />;
}

function Shell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-md space-y-4 rounded-lg border bg-card p-8 text-center shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
        <div className="flex justify-center pt-2">{children}</div>
      </div>
    </main>
  );
}

