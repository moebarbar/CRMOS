import { createTRPCRouter } from '../trpc';
import { workspaceRouter } from './workspace';
import { membershipRouter } from './membership';

export const appRouter = createTRPCRouter({
  workspace: workspaceRouter,
  membership: membershipRouter,
});

export type AppRouter = typeof appRouter;
