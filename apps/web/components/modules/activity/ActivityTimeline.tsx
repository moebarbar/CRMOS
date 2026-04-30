'use client';

import { useMemo } from 'react';
import { CheckCircle2, Pencil, Plus, Sparkles, Trash2, UserPlus } from 'lucide-react';
import { trpc } from '@/lib/trpc/client';
import { Skeleton } from '@/components/ui/skeleton';
import { fullName, relativeTime } from '@/lib/utils/format';

const VERB_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  created: Plus,
  updated: Pencil,
  deleted: Trash2,
  invited: UserPlus,
  accepted: CheckCircle2,
  commented: Pencil,
  removed: Trash2,
};

interface Props {
  targetType:
    | 'CONTACT'
    | 'COMPANY'
    | 'DEAL'
    | 'PROJECT'
    | 'TASK'
    | 'PROPOSAL'
    | 'CONTRACT'
    | 'INVOICE'
    | 'PAYMENT'
    | 'FORM'
    | 'FORM_SUBMISSION'
    | 'BOOKING'
    | 'FILE'
    | 'CHANNEL'
    | 'WIKI_PAGE'
    | 'WORKFLOW'
    | 'WORKSPACE'
    | 'USER';
  targetId: string;
}

export function ActivityTimeline({ targetType, targetId }: Props) {
  const query = trpc.activity.forTarget.useQuery({ targetType, targetId, limit: 50 });

  const grouped = useMemo(() => {
    if (!query.data) return [];
    return query.data;
  }, [query.data]);

  if (query.isLoading) return <Skeleton className="h-32 w-full" />;
  if (!grouped.length) {
    return (
      <p className="rounded-lg border bg-card p-6 text-center text-sm text-muted-foreground">
        No activity yet.
      </p>
    );
  }

  return (
    <ol className="space-y-3">
      {grouped.map((a) => {
        const Icon = VERB_ICONS[a.verb] ?? Pencil;
        const actorName = a.actor
          ? fullName(a.actor) || a.actor.email
          : a.actorType === 'moe'
            ? 'Moe'
            : 'System';
        return (
          <li key={a.id} className="flex gap-3 rounded-lg border bg-card p-3">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-muted">
              {a.actorType === 'moe' ? (
                <Sparkles className="h-4 w-4" />
              ) : (
                <Icon className="h-4 w-4" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm">
                <span className="font-medium">{actorName}</span>{' '}
                <span className="text-muted-foreground">{a.verb}</span>{' '}
                <span className="text-muted-foreground">{a.targetType.toLowerCase()}</span>
              </p>
              <p className="text-xs text-muted-foreground">{relativeTime(a.createdAt)}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
