import { CompanyForm } from '@/components/modules/companies/CompanyForm';

export const metadata = { title: 'New company' };

export default function NewCompanyPage({ params }: { params: { workspace: string } }) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">New company</h1>
      <CompanyForm workspaceSlug={params.workspace} mode="create" />
    </div>
  );
}
