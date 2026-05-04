'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Star } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function PipelinesManager({ workspaceSlug }: { workspaceSlug: string }) {
  const utils = trpc.useUtils();
  const list = trpc.pipelines.list.useQuery();
  const [name, setName] = useState('');

  const create = trpc.pipelines.create.useMutation({
    onSuccess: () => {
      toast.success('Pipeline created');
      setName('');
      void utils.pipelines.list.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const update = trpc.pipelines.update.useMutation({
    onSuccess: () => void utils.pipelines.list.invalidate(),
    onError: (err) => toast.error(err.message),
  });

  const remove = trpc.pipelines.delete.useMutation({
    onSuccess: () => {
      toast.success('Pipeline deleted');
      void utils.pipelines.list.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <div className="space-y-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim()) create.mutate({ name: name.trim(), isDefault: false });
        }}
        className="bg-card flex items-end gap-3 rounded-lg border p-4"
      >
        <div className="flex-1 space-y-1.5">
          <Label htmlFor="pipeline-name">New pipeline name</Label>
          <Input
            id="pipeline-name"
            placeholder="Renewals, Inbound demos, …"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={!name.trim() || create.isPending}>
          <Plus className="mr-1 h-4 w-4" />
          {create.isPending ? 'Creating…' : 'Create'}
        </Button>
      </form>

      {list.isLoading ? (
        <Skeleton className="h-32 w-full" />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {list.data?.map((p) => (
            <Card key={p.id}>
              <CardHeader className="flex-row items-start justify-between gap-2 pb-2">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {p.name}
                    {p.isDefault && <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />}
                  </CardTitle>
                  <p className="text-muted-foreground text-xs">
                    {p.stages.length} stages · {p._count.deals} deals
                  </p>
                </div>
                <div className="flex gap-1">
                  {!p.isDefault && (
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={update.isPending}
                      onClick={() => update.mutate({ id: p.id, isDefault: true })}
                    >
                      Set default
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="flex flex-wrap gap-1.5">
                  {p.stages.map((s) => (
                    <li
                      key={s.id}
                      className="bg-background flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs"
                    >
                      <span
                        aria-hidden
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: s.color }}
                      />
                      {s.name}
                    </li>
                  ))}
                </ul>
                <div className="flex gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/${workspaceSlug}/pipelines/${p.id}`}>Edit stages</Link>
                  </Button>
                  {!p.isDefault && p._count.deals === 0 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={remove.isPending}
                      onClick={() => {
                        if (confirm(`Delete pipeline "${p.name}"?`)) remove.mutate({ id: p.id });
                      }}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
