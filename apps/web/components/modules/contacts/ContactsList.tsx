'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Search } from 'lucide-react';
import { contact as contactSchemas } from '@chiefos/shared';
import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { fullName, initials, relativeTime } from '@/lib/utils/format';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const stages = ['', ...contactSchemas.LIFECYCLE_STAGES] as const;

export function ContactsList({ workspaceSlug }: { workspaceSlug: string }) {
  const [search, setSearch] = useState('');
  const [stage, setStage] = useState<(typeof stages)[number]>('');

  const query = trpc.contacts.list.useQuery(
    {
      search: search.trim() || undefined,
      lifecycleStage: stage ? (stage as contactSchemas.LifecycleStage) : undefined,
      limit: 50,
      sort: 'createdAt:desc',
    },
    { staleTime: 10_000 },
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email"
            className="pl-9"
          />
        </div>
        <select
          value={stage}
          onChange={(e) => setStage(e.target.value as (typeof stages)[number])}
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm"
        >
          <option value="">All stages</option>
          {contactSchemas.LIFECYCLE_STAGES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <Button asChild>
          <Link href={`/${workspaceSlug}/contacts/new`}>New contact</Link>
        </Button>
      </div>

      {query.isLoading ? (
        <ListSkeleton />
      ) : query.error ? (
        <div className="rounded-lg border bg-card p-8 text-center text-sm text-destructive">
          {query.error.message}
        </div>
      ) : !query.data || query.data.items.length === 0 ? (
        <EmptyState workspaceSlug={workspaceSlug} hasFilter={Boolean(search || stage)} />
      ) : (
        <ul className="divide-y rounded-lg border bg-card">
          {query.data.items.map((c) => (
            <li key={c.id}>
              <Link
                href={`/${workspaceSlug}/contacts/${c.id}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-accent/40"
              >
                <Avatar>
                  {c.avatarUrl && <AvatarImage src={c.avatarUrl} alt="" />}
                  <AvatarFallback>{initials(c)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {fullName(c) || c.email || 'Untitled contact'}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {[c.jobTitle, c.company?.name, c.email].filter(Boolean).join(' · ')}
                  </p>
                </div>
                <div className="hidden items-center gap-1.5 md:flex">
                  {c.tags.slice(0, 3).map((ct) => (
                    <Badge
                      key={ct.tagId}
                      variant="outline"
                      style={{ borderColor: ct.tag.color, color: ct.tag.color }}
                    >
                      {ct.tag.name}
                    </Badge>
                  ))}
                </div>
                <Badge variant="secondary" className="hidden sm:inline-flex">
                  {c.lifecycleStage}
                </Badge>
                <span className="hidden text-xs text-muted-foreground sm:block">
                  {relativeTime(c.lastContactedAt ?? c.createdAt)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ListSkeleton() {
  return (
    <ul className="divide-y rounded-lg border bg-card">
      {Array.from({ length: 6 }).map((_, i) => (
        <li key={i} className="flex items-center gap-3 px-4 py-3">
          <Skeleton className="h-9 w-9 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </li>
      ))}
    </ul>
  );
}

function EmptyState({
  workspaceSlug,
  hasFilter,
}: {
  workspaceSlug: string;
  hasFilter: boolean;
}) {
  return (
    <div className="rounded-lg border bg-card p-12 text-center">
      <p className="text-sm font-medium">
        {hasFilter ? 'No contacts match those filters.' : 'No contacts yet.'}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        {hasFilter ? 'Clear filters or' : 'Get started by'} adding your first contact.
      </p>
      <Button asChild className="mt-4">
        <Link href={`/${workspaceSlug}/contacts/new`}>New contact</Link>
      </Button>
    </div>
  );
}
