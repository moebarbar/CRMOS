'use client';

import { TrendingUp } from 'lucide-react';
import { trpc } from '@/lib/trpc/client';
import { formatMoney } from '@/lib/utils/money';
import { Skeleton } from '@/components/ui/skeleton';

export function ForecastWidget({ pipelineId }: { pipelineId?: string }) {
  const q = trpc.deals.forecast.useQuery({ pipelineId }, { staleTime: 10_000 });

  if (q.isLoading) return <Skeleton className="h-9 w-44" />;
  if (!q.data) return null;

  return (
    <div
      title={`${q.data.count} open deals · raw ${formatMoney(q.data.raw)}`}
      className="bg-card flex h-9 items-center gap-2 rounded-md border px-3 text-sm shadow-sm"
    >
      <TrendingUp className="text-muted-foreground h-3.5 w-3.5" />
      <span className="text-muted-foreground">Forecast</span>
      <span className="font-semibold tabular-nums">{formatMoney(q.data.weighted)}</span>
    </div>
  );
}
