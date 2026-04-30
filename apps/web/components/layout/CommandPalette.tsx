'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Home, Settings, Sparkles, Users } from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';

/**
 * Phase 0: nav-only command palette. Phase 1 adds entity search via tRPC.
 */
export function CommandPalette({
  open,
  onOpenChange,
  workspaceSlug,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceSlug: string;
}) {
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onOpenChange]);

  const go = (href: string) => {
    onOpenChange(false);
    router.push(href);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command or search…" />
      <CommandList>
        <CommandEmpty>No results.</CommandEmpty>
        <CommandGroup heading="Navigate">
          <CommandItem onSelect={() => go(`/${workspaceSlug}`)}>
            <Home /> Dashboard
          </CommandItem>
          <CommandItem onSelect={() => go(`/${workspaceSlug}/settings/team`)}>
            <Users /> Team
          </CommandItem>
          <CommandItem onSelect={() => go(`/${workspaceSlug}/settings`)}>
            <Settings /> Settings
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Coming later">
          <CommandItem disabled>
            <Sparkles /> Ask Moe (Phase 10)
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
