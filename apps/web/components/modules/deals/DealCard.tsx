'use client';

import Link from 'next/link';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Building2, User } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { formatMoney } from '@/lib/utils/money';
import { fullName } from '@/lib/utils/format';

export interface DealCardData {
  id: string;
  title: string;
  value: string | number;
  currency: string;
  status: 'OPEN' | 'WON' | 'LOST';
  stageId: string;
  contact: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
  } | null;
  company: { id: string; name: string; logoUrl: string | null } | null;
  expectedCloseDate: Date | null;
}

export function DealCard({
  deal,
  workspaceSlug,
  draggable = true,
}: {
  deal: DealCardData;
  workspaceSlug: string;
  draggable?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: deal.id,
    data: { stageId: deal.stageId },
    disabled: !draggable,
  });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  const contactLabel = deal.contact ? fullName(deal.contact) || deal.contact.email : null;

  return (
    <Link
      href={`/${workspaceSlug}/deals/${deal.id}`}
      className={cn(
        'bg-card hover:bg-accent/30 block rounded-md border p-3 text-left shadow-sm transition-colors',
        isDragging && 'ring-primary ring-2',
      )}
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
    >
      <p className="line-clamp-2 text-sm font-medium">{deal.title}</p>
      <p className="mt-1 text-sm font-semibold tabular-nums">
        {formatMoney(deal.value, deal.currency)}
      </p>
      {(deal.company || contactLabel) && (
        <div className="text-muted-foreground mt-2 space-y-0.5 text-xs">
          {deal.company && (
            <p className="flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              <span className="truncate">{deal.company.name}</span>
            </p>
          )}
          {contactLabel && (
            <p className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span className="truncate">{contactLabel}</span>
            </p>
          )}
        </div>
      )}
    </Link>
  );
}
