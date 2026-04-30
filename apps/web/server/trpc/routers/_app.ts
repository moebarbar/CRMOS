import { createTRPCRouter } from '../trpc';
import { workspaceRouter } from './workspace';
import { membershipRouter } from './membership';
import { contactsRouter } from './contacts';
import { companiesRouter } from './companies';
import { tagsRouter } from './tags';
import { notesRouter } from './notes';
import { activityRouter } from './activity';

export const appRouter = createTRPCRouter({
  workspace: workspaceRouter,
  membership: membershipRouter,
  contacts: contactsRouter,
  companies: companiesRouter,
  tags: tagsRouter,
  notes: notesRouter,
  activity: activityRouter,
});

export type AppRouter = typeof appRouter;
