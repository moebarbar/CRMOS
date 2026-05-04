import { ContactsList } from '@/components/modules/contacts/ContactsList';

export const metadata = { title: 'Contacts' };

export default function ContactsPage({ params }: { params: { workspace: string } }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Contacts</h1>
        <p className="text-muted-foreground text-sm">People you do business with.</p>
      </div>
      <ContactsList workspaceSlug={params.workspace} />
    </div>
  );
}
