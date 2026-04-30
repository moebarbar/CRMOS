import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/server/trpc/routers/_app';
import { createTRPCContext } from '@/server/trpc/context';

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => createTRPCContext(),
    onError({ error, path }) {
      if (error.code === 'INTERNAL_SERVER_ERROR') {
        console.error(`[trpc] ${path ?? '<no path>'}`, error);
      }
    },
  });

export { handler as GET, handler as POST };