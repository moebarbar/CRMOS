'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Phone, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { fullName, initials } from '@/lib/utils/format';

interface Contact {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  avatarUrl: string | null;
  jobTitle: string | null;
  lifecycleStage: string;
  company: { id: string; name: string; logoUrl: string | null } | null;
  tags: { tagId: string; tag: { id: string; name: string; color: string } }[];
}

export function ContactDetailHeader({
  workspaceSlug,
  contact,
}: {
  workspaceSlug: string;
  contact: Contact;
}) {
  const router = useRouter();
  const utils = trpc.useUtils();
  const remove = trpc.contacts.delete.useMutation({
    onSuccess: () => {
      toast.success('Contact moved to trash');
      void utils.contacts.list.invalidate();
      router.push(`/${workspaceSlug}/contacts`);
    },
    onError: (err) => toast.error(err.message),
  });

  const name = fullName(contact) || contact.email || 'Untitled contact';

  return (
    <div className="bg-card flex items-start gap-4 rounded-lg border p-6">
      <Avatar className="h-16 w-16">
        {contact.avatarUrl && <AvatarImage src={contact.avatarUrl} alt="" />}
        <AvatarFallback className="text-lg">{initials(contact)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">{name}</h1>
          <Badge variant="secondary">{contact.lifecycleStage}</Badge>
        </div>
        {(contact.jobTitle || contact.company) && (
          <p className="text-muted-foreground text-sm">
            {contact.jobTitle}
            {contact.jobTitle && contact.company && ' at '}
            {contact.company && (
              <Link
                href={`/${workspaceSlug}/companies/${contact.company.id}`}
                className="text-foreground font-medium hover:underline"
              >
                {contact.company.name}
              </Link>
            )}
          </p>
        )}
        <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-sm">
          {contact.email && (
            <a
              href={`mailto:${contact.email}`}
              className="hover:text-foreground inline-flex items-center gap-1.5"
            >
              <Mail className="h-3.5 w-3.5" /> {contact.email}
            </a>
          )}
          {contact.phone && (
            <a
              href={`tel:${contact.phone}`}
              className="hover:text-foreground inline-flex items-center gap-1.5"
            >
              <Phone className="h-3.5 w-3.5" /> {contact.phone}
            </a>
          )}
        </div>
        {contact.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {contact.tags.map((ct) => (
              <Badge
                key={ct.tagId}
                variant="outline"
                style={{ borderColor: ct.tag.color, color: ct.tag.color }}
              >
                {ct.tag.name}
              </Badge>
            ))}
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href={`/${workspaceSlug}/contacts/${contact.id}/edit`}>
            <Pencil className="h-3.5 w-3.5" /> Edit
          </Link>
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={remove.isPending}
          onClick={() => {
            if (confirm(`Delete ${name}?`)) remove.mutate({ id: contact.id });
          }}
        >
          <Trash2 className="h-3.5 w-3.5" /> Delete
        </Button>
      </div>
    </div>
  );
}
