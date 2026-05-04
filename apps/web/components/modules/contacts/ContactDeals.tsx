'use client';

import Link from 'next/link';
import { trpc } from '@/lib/trpc/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { formatMoney } from '@/lib/utils/money';

export function ContactDeals({
  workspaceSlug,
  contactId,
}: {
  workspaceSlug: string;
  contactId: string;
}) {
  const q = trpc.deals.list.useQuery({ contactId, limit: 50 }, { staleTime: 30_000 });

  if (q.isLoading) return <Skeleton className="h-24 w-full" />;
  if (!q.data || q.data.items.length === 0) {
    return (
      <p className="bg-card text-muted-foreground rounded-lg border p-6 text-center text-sm">
        No deals on this contact yet.
      </p>
    );
  }

  return (
    <ul className="bg-card divide-y rounded-lg border">
      {q.data.items.map((d) => (
        <li key={d.id}>
          <Link
            href={`/${workspaceSlug}/deals/${d.id}`}
            className="hover:bg-accent/40 flex items-center gap-3 px-4 py-2 text-sm"
          >
            <span className="min-w-0 flex-1 truncate">{d.title}</span>
            <Badge variant="outline">{d.stage.name}</Badge>
            <Badge
              variant={
                d.status === 'WON' ? 'default' : d.status === 'LOST' ? 'destructive' : 'secondary'
              }
            >
              {d.status}
            </Badge>
            <span className="font-semibold tabular-nums">{formatMoney(d.value, d.currency)}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
