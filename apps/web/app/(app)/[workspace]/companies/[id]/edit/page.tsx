import { notFound } from 'next/navigation';
import { TRPCError } from '@trpc/server';
import { getServerCaller } from '@/lib/trpc/server';
import { CompanyForm } from '@/components/modules/companies/CompanyForm';

export const metadata = { title: 'Edit company' };

export default async function EditCompanyPage({
  params,
}: {
  params: { workspace: string; id: string };
}) {
  const caller = await getServerCaller(params.workspace);
  let company: Awaited<ReturnType<typeof caller.companies.get>>;
  try {
    company = await caller.companies.get({ id: params.id });
  } catch (err) {
    if (err instanceof TRPCError && err.code === 'NOT_FOUND') notFound();
    throw err;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Edit company</h1>
      <CompanyForm
        workspaceSlug={params.workspace}
        mode="edit"
        initial={{
          id: company.id,
          name: company.name,
          domain: company.domain ?? '',
          industry: company.industry ?? '',
          size: company.size ?? '',
          description: company.description ?? '',
          websiteUrl: company.websiteUrl ?? '',
          linkedinUrl: company.linkedinUrl ?? '',
          city: company.city ?? '',
          country: company.country ?? '',
        }}
      />
    </div>
  );
}
