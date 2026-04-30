'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export function WonLostDialog({
  dealId,
  defaultValue,
  variant,
  trigger,
}: {
  dealId: string;
  defaultValue?: string | number;
  variant: 'won' | 'lost';
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [actualValue, setActualValue] = useState<string>(String(defaultValue ?? ''));
  const [reason, setReason] = useState('');
  const utils = trpc.useUtils();

  const won = trpc.deals.markWon.useMutation({
    onSuccess: () => {
      toast.success('Marked won');
      void utils.deals.get.invalidate({ id: dealId });
      void utils.deals.list.invalidate();
      void utils.deals.forecast.invalidate();
      setOpen(false);
    },
    onError: (err) => toast.error(err.message),
  });

  const lost = trpc.deals.markLost.useMutation({
    onSuccess: () => {
      toast.success('Marked lost');
      void utils.deals.get.invalidate({ id: dealId });
      void utils.deals.list.invalidate();
      void utils.deals.forecast.invalidate();
      setOpen(false);
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{variant === 'won' ? 'Mark deal won' : 'Mark deal lost'}</DialogTitle>
          <DialogDescription>
            {variant === 'won'
              ? 'Confirm the actual value and we’ll close the deal.'
              : 'Capture the reason so the team learns from it.'}
          </DialogDescription>
        </DialogHeader>
        {variant === 'won' ? (
          <div className="space-y-1.5">
            <Label htmlFor="actual-value">Actual value</Label>
            <Input
              id="actual-value"
              type="number"
              step="0.01"
              value={actualValue}
              onChange={(e) => setActualValue(e.target.value)}
            />
          </div>
        ) : (
          <div className="space-y-1.5">
            <Label htmlFor="lost-reason">Reason</Label>
            <Textarea
              id="lost-reason"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Lost on price, no budget, chose competitor, …"
            />
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          {variant === 'won' ? (
            <Button
              disabled={won.isPending}
              onClick={() =>
                won.mutate({
                  id: dealId,
                  actualValue: actualValue ? Number(actualValue) : undefined,
                })
              }
            >
              {won.isPending ? 'Saving…' : 'Mark won'}
            </Button>
          ) : (
            <Button
              variant="destructive"
              disabled={lost.isPending || !reason.trim()}
              onClick={() => lost.mutate({ id: dealId, reason: reason.trim() })}
            >
              {lost.isPending ? 'Saving…' : 'Mark lost'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
