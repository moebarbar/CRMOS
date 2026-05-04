'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  DndContext,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils/cn';
import { formatMoney } from '@/lib/utils/money';
import { DealCard, type DealCardData } from './DealCard';
import { ForecastWidget } from './ForecastWidget';

interface Stage {
  id: string;
  name: string;
  position: number;
  color: string;
  probability: number;
  isWon: boolean;
  isLost: boolean;
}

export function DealsKanban({ workspaceSlug }: { workspaceSlug: string }) {
  const utils = trpc.useUtils();
  const pipelines = trpc.pipelines.list.useQuery();
  const ensureDefault = trpc.pipelines.ensureDefault.useMutation({
    onSuccess: () => {
      void utils.pipelines.list.invalidate();
    },
  });

  const [pipelineId, setPipelineId] = useState<string | null>(null);

  const activePipeline = useMemo(() => {
    if (!pipelines.data) return null;
    if (pipelineId) {
      return pipelines.data.find((p) => p.id === pipelineId) ?? null;
    }
    return pipelines.data.find((p) => p.isDefault) ?? pipelines.data[0] ?? null;
  }, [pipelines.data, pipelineId]);

  const dealsQ = trpc.deals.list.useQuery(
    {
      pipelineId: activePipeline?.id ?? '',
      limit: 200,
    },
    { enabled: !!activePipeline?.id, staleTime: 5_000 },
  );

  const move = trpc.deals.move.useMutation({
    onMutate: async ({ id, stageId }) => {
      if (!activePipeline) return;
      await utils.deals.list.cancel({ pipelineId: activePipeline.id, limit: 200 });
      const prev = utils.deals.list.getData({ pipelineId: activePipeline.id, limit: 200 });
      utils.deals.list.setData({ pipelineId: activePipeline.id, limit: 200 }, (old) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((d) => (d.id === id ? { ...d, stageId } : d)),
        };
      });
      return { prev };
    },
    onError: (err, _vars, ctx) => {
      toast.error(err.message);
      if (ctx?.prev && activePipeline) {
        utils.deals.list.setData({ pipelineId: activePipeline.id, limit: 200 }, ctx.prev);
      }
    },
    onSettled: () => {
      void utils.deals.list.invalidate();
      void utils.deals.forecast.invalidate();
    },
  });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  if (pipelines.isLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  if (!activePipeline) {
    return (
      <div className="bg-card rounded-lg border p-12 text-center">
        <p className="text-sm font-medium">No pipelines yet.</p>
        <p className="text-muted-foreground mt-1 text-sm">
          Create a default Sales pipeline to get started.
        </p>
        <Button
          className="mt-4"
          disabled={ensureDefault.isPending}
          onClick={() => ensureDefault.mutate()}
        >
          {ensureDefault.isPending ? 'Creating…' : 'Create Sales pipeline'}
        </Button>
      </div>
    );
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const dealId = event.active.id as string;
    const fromStageId = event.active.data.current?.stageId as string | undefined;
    const toStageId = event.over?.id as string | undefined;
    if (!toStageId || toStageId === fromStageId) return;

    const targetStage = activePipeline.stages.find((s) => s.id === toStageId);
    if (!targetStage) return;

    if (targetStage.isWon || targetStage.isLost) {
      const verb = targetStage.isWon ? 'won' : 'lost';
      const ok = confirm(`Mark this deal as ${verb}?`);
      if (!ok) return;
    }

    move.mutate({ id: dealId, stageId: toStageId });
  };

  const dealsByStage = new Map<string, DealCardData[]>();
  for (const stage of activePipeline.stages) dealsByStage.set(stage.id, []);
  for (const d of dealsQ.data?.items ?? []) {
    const list = dealsByStage.get(d.stageId);
    const card: DealCardData = {
      id: d.id,
      title: d.title,
      value: d.value.toString(),
      currency: d.currency,
      status: d.status,
      stageId: d.stageId,
      contact: d.contact,
      company: d.company,
      expectedCloseDate: d.expectedCloseDate,
    };
    if (list) list.push(card);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={activePipeline.id}
          onChange={(e) => setPipelineId(e.target.value)}
          className="border-input h-9 rounded-md border bg-transparent px-3 text-sm shadow-sm"
        >
          {pipelines.data!.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
              {p.isDefault ? ' (default)' : ''}
            </option>
          ))}
        </select>
        <Button asChild variant="outline" size="sm">
          <Link href={`/${workspaceSlug}/pipelines`}>Manage pipelines</Link>
        </Button>
        <div className="flex-1" />
        <ForecastWidget pipelineId={activePipeline.id} />
        <Button asChild>
          <Link href={`/${workspaceSlug}/deals/new?pipelineId=${activePipeline.id}`}>
            <Plus className="mr-1 h-4 w-4" />
            New deal
          </Link>
        </Button>
      </div>

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {activePipeline.stages.map((stage) => {
            const stageDeals = dealsByStage.get(stage.id) ?? [];
            const sum = stageDeals.reduce((acc, d) => acc + Number(d.value), 0);
            return (
              <StageColumn
                key={stage.id}
                stage={stage}
                workspaceSlug={workspaceSlug}
                deals={stageDeals}
                totalValue={sum}
                isLoading={dealsQ.isLoading}
              />
            );
          })}
        </div>
      </DndContext>
    </div>
  );
}

function StageColumn({
  stage,
  deals,
  workspaceSlug,
  totalValue,
  isLoading,
}: {
  stage: Stage;
  deals: DealCardData[];
  workspaceSlug: string;
  totalValue: number;
  isLoading: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'bg-muted/30 flex w-72 shrink-0 flex-col gap-2 rounded-lg border p-2 transition-colors',
        isOver && 'ring-primary ring-2',
      )}
    >
      <div className="flex items-center gap-2 px-1">
        <span
          aria-hidden
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: stage.color }}
        />
        <p className="flex-1 text-sm font-semibold">{stage.name}</p>
        <span className="text-muted-foreground text-xs">{deals.length}</span>
      </div>
      <p className="text-muted-foreground px-1 text-xs tabular-nums">
        {formatMoney(totalValue, deals[0]?.currency ?? 'USD')}
      </p>
      <div className="flex flex-1 flex-col gap-2">
        {isLoading
          ? Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)
          : deals.map((d) => <DealCard key={d.id} deal={d} workspaceSlug={workspaceSlug} />)}
        {!isLoading && deals.length === 0 && (
          <p className="bg-background/50 text-muted-foreground rounded-md border border-dashed p-3 text-center text-xs">
            Drop here
          </p>
        )}
      </div>
    </div>
  );
}
