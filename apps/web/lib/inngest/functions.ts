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
    // Future fanout: send WelcomeEmail (Resend), seed defaults, etc.
    await step.run('log', () => ({
      msg: `workspace ${event.data.workspaceId} created by ${event.data.ownerUserId}`,
    }));
    return { ok: true };
  },
);

export const functions = [healthPing, workspaceCreated];
