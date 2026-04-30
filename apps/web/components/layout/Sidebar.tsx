'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Briefcase,
  Building2,
  CalendarClock,
  CheckSquare,
  ChevronsUpDown,
  FileSignature,
  FileText,
  Folder,
  Home,
  Inbox,
  Plus,
  Receipt,
  Settings,
  Sparkles,
  Timer,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface SidebarWorkspace {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  brandPrimary?: string;
  brandAccent?: string;
}

interface NavSection {
  heading?: string;
  items: { label: string; href: string; icon: React.ComponentType<{ className?: string }>; phase?: number }[];
}

function navFor(slug: string): NavSection[] {
  return [
    {
      items: [{ label: 'Home', href: `/${slug}`, icon: Home }],
    },
    {
      heading: 'CRM',
      items: [
        { label: 'Contacts', href: `/${slug}/contacts`, icon: Users },
        { label: 'Companies', href: `/${slug}/companies`, icon: Building2 },
        { label: 'Deals', href: `/${slug}/deals`, icon: Briefcase, phase: 2 },
      ],
    },
    {
      heading: 'Delivery',
      items: [
        { label: 'Projects', href: `/${slug}/projects`, icon: Folder, phase: 3 },
        { label: 'Tasks', href: `/${slug}/tasks`, icon: CheckSquare, phase: 3 },
        { label: 'Time', href: `/${slug}/time`, icon: Timer, phase: 7 },
      ],
    },
    {
      heading: 'Sales',
      items: [
        { label: 'Proposals', href: `/${slug}/proposals`, icon: FileText, phase: 4 },
        { label: 'Contracts', href: `/${slug}/contracts`, icon: FileSignature, phase: 4 },
        { label: 'Invoices', href: `/${slug}/invoices`, icon: Receipt, phase: 5 },
      ],
    },
    {
      heading: 'Engage',
      items: [
        { label: 'Forms', href: `/${slug}/forms`, icon: FileText, phase: 6 },
        { label: 'Schedulers', href: `/${slug}/schedulers`, icon: CalendarClock, phase: 6 },
        { label: 'Inbox', href: `/${slug}/inbox`, icon: Inbox, phase: 7 },
      ],
    },
    {
      items: [
        { label: 'Moe', href: `/${slug}/moe`, icon: Sparkles, phase: 10 },
        { label: 'Settings', href: `/${slug}/settings`, icon: Settings },
      ],
    },
  ];
}

export function Sidebar({
  workspace,
  workspaces,
}: {
  workspace: SidebarWorkspace;
  workspaces: SidebarWorkspace[];
}) {
  const pathname = usePathname();
  const sections = navFor(workspace.slug);

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r bg-background md:flex">
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 px-4 py-3 text-left text-sm font-medium hover:bg-accent">
          <span
            aria-hidden
            className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-xs font-semibold text-white"
            style={{ background: workspace.brandPrimary ?? '#7c3aed' }}
          >
            {workspace.name.slice(0, 1)}
          </span>
          <span className="flex-1 truncate">{workspace.name}</span>
          <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
          {workspaces.map((w) => (
            <DropdownMenuItem key={w.id} asChild>
              <Link href={`/${w.slug}`}>{w.name}</Link>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/onboarding" className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> New workspace
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <nav className="flex-1 space-y-4 overflow-y-auto px-2 py-3">
        {sections.map((section, i) => (
          <div key={i}>
            {section.heading && (
              <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {section.heading}
              </p>
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
                const locked = typeof item.phase === 'number';
                return (
                  <li key={item.href}>
                    <Link
                      href={locked ? '#' : item.href}
                      aria-disabled={locked}
                      onClick={(e) => locked && e.preventDefault()}
                      className={cn(
                        'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors',
                        active && 'bg-accent text-accent-foreground',
                        !active && !locked && 'text-foreground hover:bg-accent/60',
                        locked && 'cursor-not-allowed text-muted-foreground/70',
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="flex-1 truncate">{item.label}</span>
                      {locked && (
                        <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">
                          P{item.phase}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
