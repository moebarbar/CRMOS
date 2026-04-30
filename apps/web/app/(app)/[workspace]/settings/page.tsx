import Link from 'next/link';
import { getServerCaller } from '@/lib/trpc/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata = { title: 'Settings' };

export default async function SettingsPage({
  params,
}: {
  params: { workspace: string };
}) {
  const caller = await getServerCaller(params.workspace);
  const workspace = await caller.workspace.current();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage {workspace.name}.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>General</CardTitle>
            <CardDescription>Name, branding, locale</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">Name: </span>
              <span>{workspace.name}</span>
            </div>
            <div>
              <span className="text-muted-foreground">URL: </span>
              <span>chiefos.app/{workspace.slug}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Currency: </span>
              <span>{workspace.defaultCurrency}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Time zone: </span>
              <span>{workspace.timezone}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team</CardTitle>
            <CardDescription>Invite and manage members</CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              className="text-sm font-medium text-primary hover:underline"
              href={`/${params.workspace}/settings/team`}
            >
              Manage team →
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
