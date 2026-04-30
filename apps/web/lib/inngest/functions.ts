import { WelcomeEmail } from '@chiefos/emails';
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

export const functions = [healthPing, workspaceCreated];
