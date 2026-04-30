import { WelcomeEmail } from '@chiefos/emails';
import { DEFAULT_SALES_STAGES } from '@chiefos/shared/zod/pipeline';
import { prisma } from '@/lib/db/prisma';
import { sendEmail } from '@/lib/integrations/resend';
import { log } from '@/lib/observability/logger';
import { inngest } from './client';

/** Phase 0 placeholder: proves the wire is connected end-to-end. */
export const healthPing = inngest.createFunction(
  { id: 'health-ping', name: 'Health ping' },
  { event: 'app/health.ping' },
  async ({ event, step }) => {
    await step.run('echo', () => ({ at: event.data.at }));
    return { ok: true };
  },
);

export const workspaceCreated = inngest.createFunction(
  { id: 'workspace-created', name: 'Workspace created — onboarding fanout' },
  { event: 'app/workspace.created' },
  async ({ event, step }) => {
    const ws = await step.run('load-workspace', () =>
      prisma.workspace.findUnique({
        where: { id: event.data.workspaceId },
        include: { owner: true },
      }),
    );
    if (!ws) {
      log.warn('workspace-created.missing', { workspaceId: event.data.workspaceId });
      return { ok: false };
    }

    await step.run('seed-default-pipeline', async () => {
      const existing = await prisma.pipeline.findFirst({
        where: { workspaceId: ws.id },
        select: { id: true },
      });
      if (existing) return { skipped: true };
      await prisma.pipeline.create({
        data: {
          workspaceId: ws.id,
          name: 'Sales',
          isDefault: true,
          stages: { create: DEFAULT_SALES_STAGES },
        },
      });
      return { created: true };
    });

    await step.run('send-welcome-email', () =>
      sendEmail({
        to: ws.owner.email,
        subject: `Welcome to ChiefOS — ${ws.name} is ready`,
        react: WelcomeEmail({
          firstName: ws.owner.firstName ?? undefined,
          workspaceName: ws.name,
          workspaceUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/${ws.slug}`,
        }),
      }),
    );

    return { ok: true };
  },
);

export const dealWon = inngest.createFunction(
  { id: 'deal-won', name: 'Deal won' },
  { event: 'app/deal.won' },
  async ({ event, step }) => {
    await step.run('log', () => ({ msg: `deal ${event.data.dealId} won` }));
    // Future: notify owner, create thank-you task, generate invoice draft.
    return { ok: true };
  },
);

export const dealLost = inngest.createFunction(
  { id: 'deal-lost', name: 'Deal lost' },
  { event: 'app/deal.lost' },
  async ({ event, step }) => {
    await step.run('log', () => ({
      msg: `deal ${event.data.dealId} lost`,
      reason: event.data.reason,
    }));
    return { ok: true };
  },
);

export const functions = [healthPing, workspaceCreated, dealWon, dealLost];
