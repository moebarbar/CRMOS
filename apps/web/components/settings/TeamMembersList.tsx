'use client';

import { toast } from 'sonner';
import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

type MembershipWithUser = {
  id: string;
  role: string;
  acceptedAt: Date | null;
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    avatarUrl: string | null;
  };
};

export function TeamMembersList({ memberships }: { memberships: MembershipWithUser[] }) {
  const utils = trpc.useUtils();
  const remove = trpc.membership.remove.useMutation({
    onSuccess: () => {
      toast.success('Member removed.');
      void utils.membership.list.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <ul className="bg-card divide-y rounded-lg border">
      {memberships.map((m) => {
        const name = [m.user.firstName, m.user.lastName].filter(Boolean).join(' ') || m.user.email;
        const initials = name
          .split(/\s+/)
          .map((p) => p[0])
          .join('')
          .slice(0, 2)
          .toUpperCase();
        return (
          <li key={m.id} className="flex items-center gap-3 px-4 py-3">
            <Avatar>
              {m.user.avatarUrl && <AvatarImage src={m.user.avatarUrl} alt="" />}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-medium">{name}</p>
              <p className="text-muted-foreground text-xs">{m.user.email}</p>
            </div>
            <Badge variant="secondary">{m.role}</Badge>
            {!m.acceptedAt && <Badge variant="outline">Pending</Badge>}
            {m.role !== 'OWNER' && (
              <Button
                variant="ghost"
                size="sm"
                disabled={remove.isPending}
                onClick={() => {
                  if (confirm(`Remove ${name}?`)) remove.mutate({ membershipId: m.id });
                }}
              >
                Remove
              </Button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
