import 'server-only';
import { Resend } from 'resend';
import type { ReactElement } from 'react';
import { log } from '@/lib/observability/logger';

const apiKey = process.env.RESEND_API_KEY;
const fromAddress = process.env.RESEND_FROM_EMAIL ?? 'ChiefOS <hello@chiefos.app>';

const client = apiKey ? new Resend(apiKey) : null;

export interface SendEmailInput {
  to: string;
  subject: string;
  react: ReactElement;
  replyTo?: string;
}

export async function sendEmail(input: SendEmailInput) {
  if (!client) {
    log.warn('email.send.skipped', { reason: 'RESEND_API_KEY missing', subject: input.subject });
    return { id: null };
  }
  const result = await client.emails.send({
    from: fromAddress,
    to: input.to,
    subject: input.subject,
    react: input.react,
    replyTo: input.replyTo,
  });
  if (result.error) {
    log.error('email.send.failed', { error: result.error.message, subject: input.subject });
    throw new Error(result.error.message);
  }
  log.info('email.send.ok', { subject: input.subject, to: input.to, id: result.data?.id });
  return { id: result.data?.id ?? null };
}