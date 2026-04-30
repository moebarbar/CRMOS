'use client';

import { UserButton } from '@clerk/nextjs';
import { Icon } from '@/components/brand/Icon';
import type { User } from '@chiefos/db';
import type { SidebarWorkspace } from './Sidebar';

export function Topbar({ user, workspace }: { user: User; workspace: SidebarWorkspace }) {
  return (
    <header className="main-header">
      <div className="crumbs">
        <span className="crumb mono" style={{ fontSize: 12 }}>
          {workspace.name}
        </span>
        <span className="sep">/</span>
        <span className="crumb crumb-current">Today</span>
      </div>
      <div className="main-actions">
        <button type="button" className="btn sm">
          <Icon name="sparkle" size={14} />
          Ask Moe
          <span className="kbd">⌘K</span>
        </button>
        <button
          type="button"
          className="icon-btn has-dot"
          aria-label="Notifications"
          title="Notifications"
        >
          <Icon name="bell" size={16} />
        </button>
        <UserButton afterSignOutUrl="/" />
      </div>
      <span className="sr-only">Signed in as {user.email}</span>
    </header>
  );
}
