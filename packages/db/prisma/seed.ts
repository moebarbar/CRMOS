/**
 * Seed — minimal demo workspace + Phase 1 sample CRM data.
 * Adds: 5 contacts, 2 companies, a few tags. No deals/projects yet.
 *
 * Run with: pnpm db:seed
 */
import { LifecycleStage, PrismaClient, Role, TagScope } from '@prisma/client';

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

  const acme = await prisma.company.upsert({
    where: { workspaceId_domain: { workspaceId: workspace.id, domain: 'acme.com' } },
    update: {},
    create: {
      workspaceId: workspace.id,
      name: 'Acme Inc',
      domain: 'acme.com',
      industry: 'SaaS',
      size: '51-200',
      websiteUrl: 'https://acme.com',
      ownerId: owner.id,
    },
  });

  const orbit = await prisma.company.upsert({
    where: { workspaceId_domain: { workspaceId: workspace.id, domain: 'orbitlabs.io' } },
    update: {},
    create: {
      workspaceId: workspace.id,
      name: 'Orbit Labs',
      domain: 'orbitlabs.io',
      industry: 'AI',
      size: '11-50',
      websiteUrl: 'https://orbitlabs.io',
      ownerId: owner.id,
    },
  });

  const vipTag = await prisma.tag.upsert({
    where: {
      workspaceId_name_scope: {
        workspaceId: workspace.id,
        name: 'VIP',
        scope: TagScope.CONTACT,
      },
    },
    update: {},
    create: {
      workspaceId: workspace.id,
      name: 'VIP',
      color: '#f59e0b',
      scope: TagScope.CONTACT,
    },
  });

  const partnerTag = await prisma.tag.upsert({
    where: {
      workspaceId_name_scope: {
        workspaceId: workspace.id,
        name: 'Partner',
        scope: TagScope.CONTACT,
      },
    },
    update: {},
    create: {
      workspaceId: workspace.id,
      name: 'Partner',
      color: '#10b981',
      scope: TagScope.CONTACT,
    },
  });

  const seedContacts = [
    {
      firstName: 'Sarah',
      lastName: 'Chen',
      email: 'sarah@acme.com',
      jobTitle: 'VP Marketing',
      companyId: acme.id,
      lifecycleStage: LifecycleStage.CUSTOMER,
      tagIds: [vipTag.id],
    },
    {
      firstName: 'Diego',
      lastName: 'Ramirez',
      email: 'diego@acme.com',
      jobTitle: 'CTO',
      companyId: acme.id,
      lifecycleStage: LifecycleStage.OPPORTUNITY,
      tagIds: [],
    },
    {
      firstName: 'Priya',
      lastName: 'Patel',
      email: 'priya@orbitlabs.io',
      jobTitle: 'Founder',
      companyId: orbit.id,
      lifecycleStage: LifecycleStage.CUSTOMER,
      tagIds: [vipTag.id, partnerTag.id],
    },
    {
      firstName: 'Marcus',
      lastName: 'Johnson',
      email: 'marcus@gmail.com',
      jobTitle: 'Independent designer',
      companyId: null,
      lifecycleStage: LifecycleStage.LEAD,
      tagIds: [],
    },
    {
      firstName: 'Elena',
      lastName: 'Rossi',
      email: 'elena@orbitlabs.io',
      jobTitle: 'Head of Design',
      companyId: orbit.id,
      lifecycleStage: LifecycleStage.MQL,
      tagIds: [partnerTag.id],
    },
  ];

  for (const c of seedContacts) {
    const existing = await prisma.contact.findFirst({
      where: { workspaceId: workspace.id, email: c.email! },
    });
    if (existing) continue;

    await prisma.contact.create({
      data: {
        workspaceId: workspace.id,
        ownerId: owner.id,
        firstName: c.firstName,
        lastName: c.lastName,
        email: c.email,
        jobTitle: c.jobTitle,
        companyId: c.companyId,
        lifecycleStage: c.lifecycleStage,
        tags: { create: c.tagIds.map((tagId) => ({ tagId })) },
      },
    });
  }

  console.log(`✓ workspace: ${workspace.slug} (owner: ${owner.email})`);
  console.log(`✓ ${seedContacts.length} contacts, 2 companies, 2 tags`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
