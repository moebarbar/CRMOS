import { notFound } from 'next/navigation';
import { TRPCError } from '@trpc/server';
import { getServerCaller } from '@/lib/trpc/server';
import { ContactForm } from '@/components/modules/contacts/ContactForm';

export const metadata = { title: 'Edit contact' };

export default async function EditContactPage({
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
      <h1 className="text-2xl font-semibold tracking-tight">Edit contact</h1>
      <ContactForm
        workspaceSlug={params.workspace}
        mode="edit"
        initial={{
          id: contact.id,
          firstName: contact.firstName ?? '',
          lastName: contact.lastName ?? '',
          email: contact.email ?? '',
          phone: contact.phone ?? '',
          jobTitle: contact.jobTitle ?? '',
          websiteUrl: contact.websiteUrl ?? '',
          linkedinUrl: contact.linkedinUrl ?? '',
          city: contact.city ?? '',
          country: contact.country ?? '',
          lifecycleStage: contact.lifecycleStage,
          leadScore: contact.leadScore,
          doNotEmail: contact.doNotEmail,
          doNotCall: contact.doNotCall,
          tagIds: contact.tags.map((t) => t.tagId),
        }}
      />
    </div>
  );
}
