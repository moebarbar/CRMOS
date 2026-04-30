'use client';

import { useState } from 'react';
import { Bookmark, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type SavedViewEntity = 'contact' | 'company' | 'deal' | 'project' | 'task';

export interface SavedViewsPickerProps<TFilters extends Record<string, unknown>> {
  entity: SavedViewEntity;
  filters: TFilters;
  onApply: (filters: TFilters) => void;
}

export function SavedViewsPicker<TFilters extends Record<string, unknown>>({
  entity,
  filters,
  onApply,
}: SavedViewsPickerProps<TFilters>) {
  const utils = trpc.useUtils();
  const list = trpc.savedViews.listFor.useQuery({ entity });
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');

  const create = trpc.savedViews.create.useMutation({
    onSuccess: () => {
      toast.success('View saved');
      setName('');
      setCreating(false);
      void utils.savedViews.listFor.invalidate({ entity });
    },
    onError: (err) => toast.error(err.message),
  });

  const remove = trpc.savedViews.delete.useMutation({
    onSuccess: () => {
      void utils.savedViews.listFor.invalidate({ entity });
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Bookmark className="h-3.5 w-3.5" />
          Views
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72">
        <DropdownMenuLabel>Saved views</DropdownMenuLabel>
        {list.data && list.data.length > 0 ? (
          list.data.map((v) => (
            <DropdownMenuItem
              key={v.id}
              className="flex items-center gap-2"
              onSelect={(e) => {
                e.preventDefault();
                onApply((v.filters as TFilters) ?? ({} as TFilters));
              }}
            >
              <span className="flex-1 truncate">{v.name}</span>
              <button
                type="button"
                aria-label="Delete view"
                className="text-muted-foreground hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`Delete "${v.name}"?`)) remove.mutate({ id: v.id });
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </DropdownMenuItem>
          ))
        ) : (
          <DropdownMenuItem disabled>No saved views</DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        {creating ? (
          <form
            className="flex items-center gap-2 px-2 py-1.5"
            onSubmit={(e) => {
              e.preventDefault();
              if (!name.trim()) return;
              create.mutate({
                entity,
                name: name.trim(),
                filters,
                columns: [],
              });
            }}
          >
            <Input
              autoFocus
              placeholder="View name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-7 text-xs"
            />
            <Button type="submit" size="sm" className="h-7 px-2 text-xs" disabled={create.isPending}>
              Save
            </Button>
          </form>
        ) : (
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              setCreating(true);
            }}
          >
            <Plus className="mr-2 h-3.5 w-3.5" /> Save current view
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
