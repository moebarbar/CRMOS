import { notFound } from 'next/navigation';
import { TRPCError } from '@trpc/server';
import { getServerCaller } from '@/lib/trpc/server';
import { DealForm } from '@/components/modules/deals/DealForm';

export const metadata = { title: 'Edit deal' };

export default async function EditDealPage({
  params,
}: {
  params: { workspace: string; id: string };
}) {
  const caller = await getServerCaller(params.workspace);
  let deal: Awaited<ReturnType<typeof caller.deals.get>>;
  try {
    deal = await caller.deals.get({ id: params.id });
  } catch (err) {
    if (err instanceof TRPCError && err.code === 'NOT_FOUND') notFound();
    throw err;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Edit deal</h1>
      <DealForm
        workspaceSlug={params.workspace}
        mode="edit"
        initial={{
          id: deal.id,
          title: deal.title,
          pipelineId: deal.pipelineId,
          stageId: deal.stageId,
          contactId: deal.contactId,
          companyId: deal.companyId,
          ownerId: deal.ownerId,
          value: Number(deal.value),
          currency: deal.currency,
          expectedCloseDate: deal.expectedCloseDate,
          source: deal.source ?? '',
          description: deal.description ?? '',
        }}
      />
    </div>
  );
}
