'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Building2, Search } from 'lucide-react';
import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

export function CompaniesList({ workspaceSlug }: { workspaceSlug: string }) {
  const [search, setSearch] = useState('');
  const query = trpc.companies.list.useQuery(
    { search: search.trim() || undefined, limit: 50 },
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
            placeholder="Search companies"
            className="pl-9"
          />
        </div>
        <Button asChild>
          <Link href={`/${workspaceSlug}/companies/new`}>New company</Link>
        </Button>
      </div>

      {query.isLoading ? (
        <Skeleton className="h-48 w-full" />
      ) : !query.data || query.data.items.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center">
          <p className="text-sm font-medium">
            {search ? 'No companies match.' : 'No companies yet.'}
          </p>
          <Button asChild className="mt-4">
            <Link href={`/${workspaceSlug}/companies/new`}>New company</Link>
          </Button>
        </div>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {query.data.items.map((c) => (
            <li key={c.id}>
              <Link
                href={`/${workspaceSlug}/companies/${c.id}`}
                className="flex items-center gap-3 rounded-lg border bg-card p-4 hover:bg-accent/40"
              >
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-muted">
                  {c.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.logoUrl} alt="" className="h-10 w-10 rounded-md object-cover" />
                  ) : (
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{c.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {[c.domain, c.industry].filter(Boolean).join(' · ')}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {c._count.contacts} contact{c._count.contacts === 1 ? '' : 's'}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
