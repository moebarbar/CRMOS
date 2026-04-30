import 'server-only';
import { createTRPCContext } from '@/server/trpc/context';
import { appRouter } from '@/server/trpc/routers/_app';

/**
 * Server-side tRPC caller. Use from Server Components / Route Handlers.
 * Pass `workspaceSlug` when fetching workspace-scoped data so the
 * `workspaceProcedure` middleware can resolve membership.
 */
export async function getServerCaller(workspaceSlug?: string) {
  const ctx = await createTRPCContext({ workspaceSlug });
  return appRouter.createCaller(ctx);
}