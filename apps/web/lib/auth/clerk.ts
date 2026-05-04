import 'server-only';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';
import type { User } from '@chiefos/db';

/**
 * Get the ChiefOS User row for the currently signed-in Clerk user.
 * Lazily upserts on first call so DB and Clerk stay in sync even if a
 * webhook delivery is delayed.
 */
export async function getCurrentUser(): Promise<User | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const existing = await prisma.user.findUnique({ where: { clerkUserId: userId } });
  if (existing) return existing;

  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const primaryEmail =
    clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId)?.emailAddress ??
    clerkUser.emailAddresses[0]?.emailAddress;

  if (!primaryEmail) return null;

  return prisma.user.upsert({
    where: { clerkUserId: userId },
    update: {
      email: primaryEmail,
      firstName: clerkUser.firstName ?? null,
      lastName: clerkUser.lastName ?? null,
      avatarUrl: clerkUser.imageUrl ?? null,
    },
    create: {
      clerkUserId: userId,
      email: primaryEmail,
      firstName: clerkUser.firstName ?? null,
      lastName: clerkUser.lastName ?? null,
      avatarUrl: clerkUser.imageUrl ?? null,
    },
  });
}
