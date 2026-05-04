import { PipelinesManager } from '@/components/modules/pipelines/PipelinesManager';

export const metadata = { title: 'Pipelines' };

export default function PipelinesPage({ params }: { params: { workspace: string } }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Pipelines</h1>
        <p className="text-muted-foreground text-sm">
          Multiple pipelines work in parallel. Set one as default for the kanban.
        </p>
      </div>
      <PipelinesManager workspaceSlug={params.workspace} />
    </div>
  );
}
