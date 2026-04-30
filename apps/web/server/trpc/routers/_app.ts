import { createTRPCRouter } from '../trpc';
import { workspaceRouter } from './workspace';
import { membershipRouter } from './membership';
import { contactsRouter } from './contacts';
import { companiesRouter } from './companies';
import { tagsRouter } from './tags';
import { notesRouter } from './notes';
import { activityRouter } from './activity';
import { customFieldsRouter } from './customFields';
import { savedViewsRouter } from './savedViews';
import { pipelinesRouter } from './pipelines';
import { dealsRouter } from './deals';

export const appRouter = createTRPCRouter({
  workspace: workspaceRouter,
  membership: membershipRouter,
  contacts: contactsRouter,
  companies: companiesRouter,
  tags: tagsRouter,
  notes: notesRouter,
  activity: activityRouter,
  customFields: customFieldsRouter,
  savedViews: savedViewsRouter,
  pipelines: pipelinesRouter,
  deals: dealsRouter,
});

export type AppRouter = typeof appRouter;
