import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CheckCircle2, Pencil, XCircle } from 'lucide-react';
import { TRPCError } from '@trpc/server';
import { getServerCaller } from '@/lib/trpc/server';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ActivityTimeline } from '@/components/modules/activity/ActivityTimeline';
import { WonLostDialog } from '@/components/modules/deals/WonLostDialog';
import { fullName, relativeTime } from '@/lib/utils/format';
import { formatMoney } from '@/lib/utils/money';

export const metadata = { title: 'Deal' };

export default async function DealDetailPage({
  params,
}: {
  params: { workspace: string; id: string };
}) {
  const caller = await getServerCaller(params.workspace);
  let deal: Awaited<ReturnType<typeof caller.deals.get>>;
  try {
    deal = await caller.deals.get({ id: params.id });
  } catch (err) {
    if (err instanceof TRPCError && err.code === 'NOT_FOUND') notFound();
    throw err;
  }

  const isClosed = deal.status !== 'OPEN';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-lg border bg-card p-6 md:flex-row md:items-start">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">{deal.title}</h1>
            <Badge
              variant={deal.status === 'WON' ? 'default' : deal.status === 'LOST' ? 'destructive' : 'secondary'}
            >
              {deal.status}
            </Badge>
            <Badge variant="outline">{deal.stage.name}</Badge>
          </div>
          <p className="text-3xl font-semibold tabular-nums">
            {formatMoney(deal.value, deal.currency)}
          </p>
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            <span>Pipeline: {deal.pipeline.name}</span>
            {deal.expectedCloseDate && (
              <span>Expected close: {new Date(deal.expectedCloseDate).toLocaleDateString()}</span>
            )}
            {deal.closedAt && <span>Closed {relativeTime(deal.closedAt)}</span>}
          </div>
          {deal.lostReason && (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 p-2 text-sm">
              <strong>Lost reason:</strong> {deal.lostReason}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/${params.workspace}/deals/${deal.id}/edit`}>
              <Pencil className="h-3.5 w-3.5" /> Edit
            </Link>
          </Button>
          {!isClosed && (
            <>
              <WonLostDialog
                dealId={deal.id}
                variant="won"
                defaultValue={deal.value.toString()}
                trigger={
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Mark won
                  </Button>
                }
              />
              <WonLostDialog
                dealId={deal.id}
                variant="lost"
                trigger={
                  <Button size="sm" variant="outline">
                    <XCircle className="h-3.5 w-3.5" /> Mark lost
                  </Button>
                }
              />
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Details</CardTitle>
            {deal.description && <CardDescription>{deal.description}</CardDescription>}
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <DetailRow label="Contact">
              {deal.contact ? (
                <Link
                  href={`/${params.workspace}/contacts/${deal.contact.id}`}
                  className="text-foreground hover:underline"
                >
                  {fullName(deal.contact) || deal.contact.email}
                </Link>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </DetailRow>
            <DetailRow label="Company">
              {deal.company ? (
                <Link
                  href={`/${params.workspace}/companies/${deal.company.id}`}
                  className="text-foreground hover:underline"
                >
                  {deal.company.name}
                </Link>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </DetailRow>
            <DetailRow label="Source">
              <span>{deal.source ?? '—'}</span>
            </DetailRow>
          </CardContent>
        </Card>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Activity
          </h2>
          <ActivityTimeline targetType="DEAL" targetId={deal.id} />
        </section>
      </div>
    </div>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b py-2 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="min-w-0 truncate text-right">{children}</span>
    </div>
  );
}
