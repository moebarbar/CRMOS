'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon, type IconName } from '@/components/brand/Icon';
import { Logo } from '@/components/brand/Logo';
import { BrandAvatar } from '@/components/brand/Avatar';

export interface SidebarWorkspace {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  brandPrimary?: string;
  brandAccent?: string;
}

interface NavItem {
  label: string;
  href: string;
  icon: IconName;
  badge?: string;
  phase?: number;
}
interface NavSection {
  heading?: string;
  items: NavItem[];
}

function navFor(slug: string): NavSection[] {
  return [
    {
      heading: 'Workspace',
      items: [
        { label: 'Today', href: `/${slug}`, icon: 'home' },
        { label: 'Inbox', href: `/${slug}/inbox`, icon: 'inbox', phase: 7 },
        { label: 'Moe history', href: `/${slug}/moe`, icon: 'workflow', phase: 10 },
      ],
    },
    {
      heading: 'Sales',
      items: [
        { label: 'Pipeline', href: `/${slug}/deals`, icon: 'pipeline' },
        { label: 'Contacts', href: `/${slug}/contacts`, icon: 'users' },
        { label: 'Companies', href: `/${slug}/companies`, icon: 'globe' },
        { label: 'Proposals', href: `/${slug}/proposals`, icon: 'proposal', phase: 4 },
        { label: 'Contracts', href: `/${slug}/contracts`, icon: 'contract', phase: 4 },
        { label: 'Invoices', href: `/${slug}/invoices`, icon: 'invoice', phase: 5 },
      ],
    },
    {
      heading: 'Delivery',
      items: [
        { label: 'Projects', href: `/${slug}/projects`, icon: 'project', phase: 3 },
        { label: 'Tasks', href: `/${slug}/tasks`, icon: 'check', phase: 3 },
        { label: 'Time', href: `/${slug}/time`, icon: 'time', phase: 7 },
      ],
    },
    {
      heading: 'Connect',
      items: [
        { label: 'Scheduling', href: `/${slug}/schedulers`, icon: 'calendar', phase: 6 },
        { label: 'Forms', href: `/${slug}/forms`, icon: 'form', phase: 6 },
        { label: 'Client portal', href: `/${slug}/portal`, icon: 'portal', phase: 8 },
        { label: 'Automations', href: `/${slug}/workflows`, icon: 'workflow', phase: 9 },
      ],
    },
  ];
}

export function Sidebar({
  workspace,
  workspaces,
  user,
}: {
  workspace: SidebarWorkspace;
  workspaces: SidebarWorkspace[];
  user: { firstName: string | null; lastName: string | null; email: string };
}) {
  const pathname = usePathname();
  const sections = navFor(workspace.slug);
  const myName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || user.email;

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <Logo size={22} />
      </div>

      <div className="sidebar-search">
        <button type="button" className="search-bar" aria-label="Open command palette">
          <Icon name="search" size={14} />
          <span style={{ color: 'var(--text-2)', fontSize: 13 }}>Search or ask Moe…</span>
          <span className="kbd">⌘K</span>
        </button>
      </div>

      <nav className="sidebar-nav">
        {sections.map((section, i) => (
          <div key={i}>
            {section.heading && <div className="nav-section-title">{section.heading}</div>}
            {section.items.map((item) => {
              const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
              const locked = typeof item.phase === 'number';
              const className = `nav-item ${active ? 'active' : ''}`;
              const content = (
                <>
                  <Icon name={item.icon} size={16} />
                  <span>{item.label}</span>
                  {locked && <span className="badge mono">P{item.phase}</span>}
                  {!locked && item.badge && <span className="badge">{item.badge}</span>}
                </>
              );
              return locked ? (
                <span
                  key={item.href}
                  className={`${className} disabled`}
                  style={{ opacity: 0.55, cursor: 'not-allowed' }}
                  aria-disabled
                >
                  {content}
                </span>
              ) : (
                <Link key={item.href} href={item.href} className={className}>
                  {content}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <BrandAvatar name={myName} size={32} />
        <div className="me-info">
          <div className="me-name">{myName}</div>
          <div className="me-plan mono">{workspace.name}</div>
        </div>
        <Link href={`/${workspace.slug}/settings`} aria-label="Settings" className="icon-btn">
          <Icon name="settings" size={16} />
        </Link>
      </div>

      {workspaces.length > 1 && (
        <span className="sr-only">Switch workspace via the workspace switcher.</span>
      )}
    </aside>
  );
}
