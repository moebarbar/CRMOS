import { ContactImportWizard } from '@/components/modules/import/ContactImportWizard';

export const metadata = { title: 'Import contacts' };

export default function ImportContactsPage({
  params,
}: {
  params: { workspace: string };
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Import contacts</h1>
        <p className="text-sm text-muted-foreground">
          Upload a CSV. We'll dedupe by email and auto-link contacts to companies by domain.
        </p>
      </div>
      <ContactImportWizard workspaceSlug={params.workspace} />
    </div>
  );
}
