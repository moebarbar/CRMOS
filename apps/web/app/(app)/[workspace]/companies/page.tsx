import { CompaniesList } from '@/components/modules/companies/CompaniesList';

export const metadata = { title: 'Companies' };

export default function CompaniesPage({ params }: { params: { workspace: string } }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Companies</h1>
        <p className="text-muted-foreground text-sm">Organizations your contacts work for.</p>
      </div>
      <CompaniesList workspaceSlug={params.workspace} />
    </div>
  );
}
