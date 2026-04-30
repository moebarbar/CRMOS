import { notFound } from 'next/navigation';
import { TRPCError } from '@trpc/server';
import { getServerCaller } from '@/lib/trpc/server';
import { ContactDetailHeader } from '@/components/modules/contacts/ContactDetailHeader';
import { ContactNotes } from '@/components/modules/contacts/ContactNotes';
import { ContactDeals } from '@/components/modules/contacts/ContactDeals';
import { ActivityTimeline } from '@/components/modules/activity/ActivityTimeline';

export const metadata = { title: 'Contact' };

export default async function ContactDetailPage({
  params,
}: {
  params: { workspace: string; id: string };
}) {
  const caller = await getServerCaller(params.workspace);
  let contact: Awaited<ReturnType<typeof caller.contacts.get>>;
  try {
    contact = await caller.contacts.get({ id: params.id });
  } catch (err) {
    if (err instanceof TRPCError && err.code === 'NOT_FOUND') notFound();
    throw err;
  }

  return (
    <div className="space-y-6">
      <ContactDetailHeader workspaceSlug={params.workspace} contact={contact} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Deals
            </h2>
            <ContactDeals workspaceSlug={params.workspace} contactId={contact.id} />
          </section>
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Notes
            </h2>
            <ContactNotes contactId={contact.id} />
          </section>
        </div>
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Activity
          </h2>
          <ActivityTimeline targetType="CONTACT" targetId={contact.id} />
        </section>
      </div>
    </div>
  );
}
