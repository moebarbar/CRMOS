import { ContactForm } from '@/components/modules/contacts/ContactForm';

export const metadata = { title: 'New contact' };

export default function NewContactPage({ params }: { params: { workspace: string } }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">New contact</h1>
        <p className="text-sm text-muted-foreground">Add someone to your CRM.</p>
      </div>
      <ContactForm workspaceSlug={params.workspace} mode="create" />
    </div>
  );
}
