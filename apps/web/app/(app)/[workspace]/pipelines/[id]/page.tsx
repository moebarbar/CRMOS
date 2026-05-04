import Link from 'next/link';
import { notFound } from 'next/navigation';
import { TRPCError } from '@trpc/server';
import { getServerCaller } from '@/lib/trpc/server';
import { Button } from '@/components/ui/button';
import { PipelineEditor } from '@/components/modules/pipelines/PipelineEditor';

export const metadata = { title: 'Pipeline' };

export default async function PipelineDetailPage({
  params,
}: {
  params: { workspace: string; id: string };
}) {
  const caller = await getServerCaller(params.workspace);
  let pipeline: Awaited<ReturnType<typeof caller.pipelines.get>>;
  try {
    pipeline = await caller.pipelines.get({ id: params.id });
  } catch (err) {
    if (err instanceof TRPCError && err.code === 'NOT_FOUND') notFound();
    throw err;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{pipeline.name}</h1>
          <p className="text-muted-foreground text-sm">
            {pipeline.stages.length} stages
            {pipeline.isDefault && ' · default pipeline'}
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={`/${params.workspace}/pipelines`}>Back to pipelines</Link>
        </Button>
      </div>
      <PipelineEditor pipelineId={pipeline.id} />
    </div>
  );
}
