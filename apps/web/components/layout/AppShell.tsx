import type { User } from '@chiefos/db';
import { Sidebar, type SidebarWorkspace } from './Sidebar';
import { Topbar } from './Topbar';

export interface AppShellProps {
  user: User;
  workspace: SidebarWorkspace;
  workspaces: SidebarWorkspace[];
  children: React.ReactNode;
}

export function AppShell({ user, workspace, workspaces, children }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-muted/20">
      <Sidebar workspace={workspace} workspaces={workspaces} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar user={user} workspace={workspace} />
        <main className="flex-1 px-6 py-6 md:px-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}