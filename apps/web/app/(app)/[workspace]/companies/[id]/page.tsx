import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Building2, Pencil, Trash2 } from 'lucide-react';
import { TRPCError } from '@trpc/server';
import { getServerCaller } from '@/lib/trpc/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ActivityTimeline } from '@/components/modules/activity/ActivityTimeline';
import { DeleteCompanyButton } from '@/components/modules/companies/DeleteCompanyButton';
import { fullName } from '@/lib/utils/format';

export const metadata = { title: 'Company' };

export default async function CompanyDetailPage({
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
      <div className="bg-card flex items-start gap-4 rounded-lg border p-6">
        <div className="bg-muted grid h-14 w-14 shrink-0 place-items-center rounded-md">
          {company.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={company.logoUrl} alt="" className="h-14 w-14 rounded-md object-cover" />
          ) : (
            <Building2 className="text-muted-foreground h-6 w-6" />
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">{company.name}</h1>
          <p className="text-muted-foreground text-sm">
            {[company.domain, company.industry, company.size].filter(Boolean).join(' · ')}
          </p>
          {company.description && (
            <p className="text-muted-foreground text-sm">{company.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/${params.workspace}/companies/${company.id}/edit`}>
              <Pencil className="h-3.5 w-3.5" /> Edit
            </Link>
          </Button>
          <DeleteCompanyButton id={company.id} workspaceSlug={params.workspace} name={company.name}>
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </DeleteCompanyButton>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Contacts ({company.contacts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {company.contacts.length === 0 ? (
              <p className="text-muted-foreground text-sm">No contacts at this company yet.</p>
            ) : (
              <ul className="divide-y">
                {company.contacts.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/${params.workspace}/contacts/${c.id}`}
                      className="flex items-center justify-between py-2 text-sm hover:underline"
                    >
                      <span>{fullName(c) || c.email || 'Untitled'}</span>
                      <span className="text-muted-foreground text-xs">{c.jobTitle}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        <section className="space-y-3">
          <h2 className="text-muted-foreground text-sm font-semibold uppercase tracking-wider">
            Activity
          </h2>
          <ActivityTimeline targetType="COMPANY" targetId={company.id} />
        </section>
      </div>
    </div>
  );
}
