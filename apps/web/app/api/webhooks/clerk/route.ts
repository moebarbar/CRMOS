import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import type { WebhookEvent } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    console.error('CLERK_WEBHOOK_SECRET missing');
    return new NextResponse('Server misconfigured', { status: 500 });
  }

  const h = await headers();
  const id = h.get('svix-id');
  const ts = h.get('svix-timestamp');
  const sig = h.get('svix-signature');
  if (!id || !ts || !sig) {
    return new NextResponse('Missing svix headers', { status: 400 });
  }

  const body = await req.text();
  const wh = new Webhook(secret);

  let event: WebhookEvent;
  try {
    event = wh.verify(body, {
      'svix-id': id,
      'svix-timestamp': ts,
      'svix-signature': sig,
    }) as WebhookEvent;
  } catch (err) {
    console.error('clerk webhook verify failed', err);
    return new NextResponse('Bad signature', { status: 400 });
  }

  switch (event.type) {
    case 'user.created':
    case 'user.updated': {
      const u = event.data;
      const primaryEmail =
        u.email_addresses.find((e) => e.id === u.primary_email_address_id)?.email_address ??
        u.email_addresses[0]?.email_address;
      if (!primaryEmail) break;

      await prisma.user.upsert({
        where: { clerkUserId: u.id },
        update: {
          email: primaryEmail,
          firstName: u.first_name,
          lastName: u.last_name,
          avatarUrl: u.image_url,
        },
        create: {
          clerkUserId: u.id,
          email: primaryEmail,
          firstName: u.first_name,
          lastName: u.last_name,
          avatarUrl: u.image_url,
        },
      });
      break;
    }
    case 'user.deleted': {
      if (event.data.id) {
        await prisma.user.deleteMany({ where: { clerkUserId: event.data.id } });
      }
      break;
    }
    default:
      // ignore other event types
      break;
  }

  return NextResponse.json({ ok: true });
}
