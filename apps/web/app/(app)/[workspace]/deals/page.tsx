import { DealsKanban } from '@/components/modules/deals/DealsKanban';

export const metadata = { title: 'Deals' };

export default function DealsPage({ params }: { params: { workspace: string } }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Deals</h1>
        <p className="text-muted-foreground text-sm">
          Drag a card across stages. The forecast updates live.
        </p>
      </div>
      <DealsKanban workspaceSlug={params.workspace} />
    </div>
  );
}
