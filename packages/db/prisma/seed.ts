/**
 * Phase 0 seed — minimal demo workspace + owner.
 * Later phases extend this (5 contacts, 2 companies, 1 pipeline, etc).
 *
 * Run with: pnpm db:seed
 */
import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('seeding…');

  const owner = await prisma.user.upsert({
    where: { email: 'demo@chiefos.app' },
    update: {},
    create: {
      clerkUserId: 'seed_user_demo',
      email: 'demo@chiefos.app',
      firstName: 'Demo',
      lastName: 'Owner',
      timezone: 'America/New_York',
    },
  });

  const workspace = await prisma.workspace.upsert({
    where: { slug: 'demo' },
    update: {},
    create: {
      name: 'Demo Agency',
      slug: 'demo',
      ownerId: owner.id,
      defaultCurrency: 'USD',
      timezone: 'America/New_York',
    },
  });

  await prisma.membership.upsert({
    where: { userId_workspaceId: { userId: owner.id, workspaceId: workspace.id } },
    update: { role: Role.OWNER, acceptedAt: new Date() },
    create: {
      userId: owner.id,
      workspaceId: workspace.id,
      role: Role.OWNER,
      acceptedAt: new Date(),
    },
  });

  console.log(`✓ workspace: ${workspace.slug} (owner: ${owner.email})`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
