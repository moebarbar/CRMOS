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
import { SavedViewsPicker } from '@/components/modules/savedViews/SavedViewsPicker';

interface Filters {
  search: string;
  stage: '' | contactSchemas.LifecycleStage;
  tagId: string;
}

const EMPTY: Filters = { search: '', stage: '', tagId: '' };

export function ContactsList({ workspaceSlug }: { workspaceSlug: string }) {
  const [filters, setFilters] = useState<Filters>(EMPTY);

  const tags = trpc.tags.list.useQuery({ scope: 'CONTACT' }, { staleTime: 60_000 });

  const query = trpc.contacts.list.useQuery(
    {
      search: filters.search.trim() || undefined,
      lifecycleStage: filters.stage || undefined,
      tagId: filters.tagId || undefined,
      limit: 50,
      sort: 'createdAt:desc',
    },
    { staleTime: 10_000 },
  );

  const hasFilter = Boolean(filters.search || filters.stage || filters.tagId);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            placeholder="Search by name or email"
            className="pl-9"
          />
        </div>
        <select
          value={filters.stage}
          onChange={(e) =>
            setFilters((f) => ({ ...f, stage: e.target.value as Filters['stage'] }))
          }
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm"
        >
          <option value="">All stages</option>
          {contactSchemas.LIFECYCLE_STAGES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={filters.tagId}
          onChange={(e) => setFilters((f) => ({ ...f, tagId: e.target.value }))}
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm"
          disabled={!tags.data || tags.data.length === 0}
        >
          <option value="">All tags</option>
          {tags.data?.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <SavedViewsPicker
          entity="contact"
          filters={filters as unknown as Record<string, unknown>}
          onApply={(f) => setFilters({ ...EMPTY, ...(f as Partial<Filters>) })}
        />
        {hasFilter && (
          <Button variant="ghost" size="sm" onClick={() => setFilters(EMPTY)}>
            Clear
          </Button>
        )}
        <div className="flex-1" />
        <Button asChild variant="outline">
          <Link href={`/${workspaceSlug}/contacts/import`}>Import CSV</Link>
        </Button>
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
        <EmptyState workspaceSlug={workspaceSlug} hasFilter={hasFilter} />
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
        {hasFilter
          ? 'Clear filters or add a new contact.'
          : 'Get started by adding your first contact or importing a CSV.'}
      </p>
      <div className="mt-4 flex justify-center gap-2">
        <Button asChild>
          <Link href={`/${workspaceSlug}/contacts/new`}>New contact</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={`/${workspaceSlug}/contacts/import`}>Import CSV</Link>
        </Button>
      </div>
    </div>
  );
}
