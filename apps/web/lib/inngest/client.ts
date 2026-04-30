import { EventSchemas, Inngest } from 'inngest';

/**
 * Strongly-typed event registry. Add new events here as phases land.
 * Workflows in `lib/inngest/functions.ts` consume them.
 */
type Events = {
  'app/health.ping': { data: { at: string } };
  'app/workspace.created': {
    data: { workspaceId: string; ownerUserId: string };
  };
  'app/deal.won': {
    data: { dealId: string; workspaceId: string };
  };
  'app/deal.lost': {
    data: { dealId: string; workspaceId: string; reason: string | null };
  };
};

export const inngest = new Inngest({
  id: 'chiefos',
  schemas: new EventSchemas().fromRecord<Events>(),
});
