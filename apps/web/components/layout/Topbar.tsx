'use client';

import { useState } from 'react';
import { UserButton } from '@clerk/nextjs';
import { Bell, Search } from 'lucide-react';
import type { User } from '@chiefos/db';
import { Button } from '@/components/ui/button';
import { CommandPalette } from './CommandPalette';
import type { SidebarWorkspace } from './Sidebar';

export function Topbar({ user, workspace }: { user: User; workspace: SidebarWorkspace }) {
  const [paletteOpen, setPaletteOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur md:px-6">
      <Button
        variant="outline"
        size="sm"
        className="w-72 justify-start text-muted-foreground"
        onClick={() => setPaletteOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        <span className="flex-1 text-left">Search…</span>
        <kbd className="rounded border bg-muted px-1.5 text-[10px] font-medium">⌘K</kbd>
      </Button>
      <div className="flex-1" />
      <Button variant="ghost" size="icon" aria-label="Notifications">
        <Bell className="h-4 w-4" />
      </Button>
      <UserButton afterSignOutUrl="/" />
      <CommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        workspaceSlug={workspace.slug}
      />
      {/* user prop is reserved for future avatar/menu surfaces */}
      <span className="sr-only">Signed in as {user.email}</span>
    </header>
  );
}
