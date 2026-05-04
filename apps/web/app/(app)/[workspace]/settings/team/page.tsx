import { getServerCaller } from '@/lib/trpc/server';
import { TeamMembersList } from '@/components/settings/TeamMembersList';
import { InviteMemberForm } from '@/components/settings/InviteMemberForm';

export const metadata = { title: 'Team' };

export default async function TeamSettingsPage({ params }: { params: { workspace: string } }) {
  const caller = await getServerCaller(params.workspace);
  const memberships = await caller.membership.list();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Team</h1>
        <p className="text-muted-foreground text-sm">Invite teammates to your workspace.</p>
      </div>
      <InviteMemberForm />
      <TeamMembersList memberships={memberships} />
    </div>
  );
}
