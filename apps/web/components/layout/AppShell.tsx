import type { User } from '@chiefos/db';
import { Sidebar, type SidebarWorkspace } from './Sidebar';
import { Topbar } from './Topbar';
import { MoePanel } from '@/components/moe/MoePanel';

export interface AppShellProps {
  user: User;
  workspace: SidebarWorkspace;
  workspaces: SidebarWorkspace[];
  children: React.ReactNode;
}

export function AppShell({ user, workspace, workspaces, children }: AppShellProps) {
  return (
    <div className="app">
      <Sidebar workspace={workspace} workspaces={workspaces} user={user} />
      <div className="main">
        <Topbar user={user} workspace={workspace} />
        <div className="main-body">{children}</div>
      </div>
      <MoePanel />
    </div>
  );
}
