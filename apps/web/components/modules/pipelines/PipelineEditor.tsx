'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const PRESET_COLORS = [
  '#94a3b8',
  '#7c3aed',
  '#2563eb',
  '#0891b2',
  '#10b981',
  '#65a30d',
  '#f59e0b',
  '#ef4444',
];

export function PipelineEditor({ pipelineId }: { pipelineId: string }) {
  const utils = trpc.useUtils();
  const pipeline = trpc.pipelines.get.useQuery({ id: pipelineId });

  const addStage = trpc.pipelines.addStage.useMutation({
    onSuccess: () => {
      toast.success('Stage added');
      reset();
      void utils.pipelines.get.invalidate({ id: pipelineId });
      void utils.pipelines.list.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const updateStage = trpc.pipelines.updateStage.useMutation({
    onSuccess: () => {
      void utils.pipelines.get.invalidate({ id: pipelineId });
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteStage = trpc.pipelines.deleteStage.useMutation({
    onSuccess: () => {
      toast.success('Stage removed');
      void utils.pipelines.get.invalidate({ id: pipelineId });
    },
    onError: (err) => toast.error(err.message),
  });

  const [name, setName] = useState('');
  const [probability, setProbability] = useState(0.5);
  const [color, setColor] = useState('#94a3b8');

  function reset() {
    setName('');
    setProbability(0.5);
    setColor('#94a3b8');
  }

  if (pipeline.isLoading || !pipeline.data) return null;

  return (
    <div className="space-y-4">
      <ul className="divide-y rounded-lg border bg-card">
        {pipeline.data.stages.map((s) => (
          <li key={s.id} className="flex items-center gap-3 px-4 py-3">
            <input
              type="color"
              value={s.color}
              onChange={(e) =>
                updateStage.mutate({ id: s.id, color: e.target.value })
              }
              className="h-6 w-6 rounded border"
              aria-label="Stage color"
            />
            <Input
              defaultValue={s.name}
              onBlur={(e) => {
                const v = e.target.value.trim();
                if (v && v !== s.name) updateStage.mutate({ id: s.id, name: v });
              }}
              className="flex-1"
            />
            <div className="flex items-center gap-1.5">
              <Label className="text-xs text-muted-foreground" htmlFor={`prob-${s.id}`}>
                P
              </Label>
              <Input
                id={`prob-${s.id}`}
                type="number"
                step="0.05"
                min={0}
                max={1}
                defaultValue={s.probability}
                className="w-20"
                onBlur={(e) => {
                  const v = Number(e.target.value);
                  if (!Number.isNaN(v) && v !== s.probability) {
                    updateStage.mutate({ id: s.id, probability: Math.max(0, Math.min(1, v)) });
                  }
                }}
              />
            </div>
            {s.isWon && <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-700">Won</span>}
            {s.isLost && <span className="rounded-md bg-destructive/10 px-2 py-0.5 text-xs text-destructive">Lost</span>}
            <Button
              variant="ghost"
              size="icon"
              disabled={s.isWon || s.isLost || deleteStage.isPending}
              onClick={() => {
                if (confirm(`Remove stage "${s.name}"?`)) deleteStage.mutate({ id: s.id });
              }}
              aria-label="Delete stage"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </li>
        ))}
      </ul>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          addStage.mutate({
            pipelineId,
            stage: {
              name: name.trim(),
              position: pipeline.data!.stages.length,
              probability,
              color,
              isWon: false,
              isLost: false,
            },
          });
        }}
        className="flex items-end gap-3 rounded-lg border bg-card p-4"
      >
        <div className="flex-1 space-y-1.5">
          <Label htmlFor="new-stage-name">New stage name</Label>
          <Input
            id="new-stage-name"
            placeholder="Negotiation"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Probability</Label>
          <Input
            type="number"
            step="0.05"
            min={0}
            max={1}
            value={probability}
            onChange={(e) => setProbability(Math.max(0, Math.min(1, Number(e.target.value))))}
            className="w-24"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Color</Label>
          <div className="flex items-center gap-1">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={
                  'h-6 w-6 rounded-full border-2 ' +
                  (color === c ? 'border-foreground' : 'border-transparent')
                }
                style={{ backgroundColor: c }}
                aria-label={c}
              />
            ))}
          </div>
        </div>
        <Button type="submit" disabled={!name.trim() || addStage.isPending}>
          <Plus className="mr-1 h-4 w-4" />
          Add stage
        </Button>
      </form>
    </div>
  );
}
