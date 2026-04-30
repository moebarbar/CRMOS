import { EventSchemas, Inngest } from 'inngest';

/**
 * Strongly-typed event registry. Add new events here as phases land
 * (e.g. `app/deal.won`, `app/invoice.paid`). Workflows in
 * `lib/inngest/functions.ts` consume them.
 */
type Events = {
  'app/workspace.created': {
    data: { workspaceId: string; ownerUserId: string };
  };
  'app/health.ping': { data: { at: string } };
};

export const inngest = new Inngest({
  id: 'chiefos',
  schemas: new EventSchemas().fromRecord<Events>(),
});
