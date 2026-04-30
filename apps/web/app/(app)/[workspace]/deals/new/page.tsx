import { DealForm } from '@/components/modules/deals/DealForm';

export const metadata = { title: 'New deal' };

export default function NewDealPage({
  params,
  searchParams,
}: {
  params: { workspace: string };
  searchParams: { pipelineId?: string };
}) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">New deal</h1>
      <DealForm
        workspaceSlug={params.workspace}
        mode="create"
        initialPipelineId={searchParams.pipelineId}
      />
    </div>
  );
}
