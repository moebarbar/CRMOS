/**
 * Seed — demo workspace + sample CRM + a Sales pipeline with deals.
 *
 * Run with: pnpm db:seed
 */
import { DealStatus, LifecycleStage, PrismaClient, Role, TagScope } from '@prisma/client';

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

  // ── Pipeline + Stages + Deals ──────────────────────────────────────────
  let pipeline = await prisma.pipeline.findFirst({
    where: { workspaceId: workspace.id, isDefault: true },
    include: { stages: { orderBy: { position: 'asc' } } },
  });

  if (!pipeline) {
    pipeline = await prisma.pipeline.create({
      data: {
        workspaceId: workspace.id,
        name: 'Sales',
        isDefault: true,
        stages: {
          create: [
            { name: 'Lead', position: 0, probability: 0.1, color: '#94a3b8' },
            { name: 'Qualified', position: 1, probability: 0.25, color: '#7c3aed' },
            { name: 'Demo', position: 2, probability: 0.5, color: '#2563eb' },
            { name: 'Proposal', position: 3, probability: 0.7, color: '#0891b2' },
            { name: 'Won', position: 4, probability: 1, color: '#10b981', isWon: true },
            { name: 'Lost', position: 5, probability: 0, color: '#ef4444', isLost: true },
          ],
        },
      },
      include: { stages: { orderBy: { position: 'asc' } } },
    });
  }

  const stageBy = (name: string) => pipeline!.stages.find((s) => s.name === name)!;
  const sarah = await prisma.contact.findFirst({
    where: { workspaceId: workspace.id, email: 'sarah@acme.com' },
  });
  const priya = await prisma.contact.findFirst({
    where: { workspaceId: workspace.id, email: 'priya@orbitlabs.io' },
  });

  const seedDeals = [
    {
      title: 'Acme Q4 retainer',
      value: 12000,
      stageId: stageBy('Demo').id,
      contactId: sarah?.id ?? null,
      companyId: acme.id,
      status: DealStatus.OPEN,
    },
    {
      title: 'Orbit kickoff package',
      value: 8500,
      stageId: stageBy('Proposal').id,
      contactId: priya?.id ?? null,
      companyId: orbit.id,
      status: DealStatus.OPEN,
    },
    {
      title: 'Acme platform refresh',
      value: 24000,
      stageId: stageBy('Qualified').id,
      contactId: sarah?.id ?? null,
      companyId: acme.id,
      status: DealStatus.OPEN,
    },
  ];

  for (const d of seedDeals) {
    const existing = await prisma.deal.findFirst({
      where: { workspaceId: workspace.id, title: d.title, deletedAt: null },
    });
    if (existing) continue;
    await prisma.deal.create({
      data: {
        workspaceId: workspace.id,
        ownerId: owner.id,
        pipelineId: pipeline.id,
        stageId: d.stageId,
        contactId: d.contactId,
        companyId: d.companyId,
        title: d.title,
        value: d.value,
        currency: 'USD',
        status: d.status,
      },
    });
  }

  console.log(`✓ workspace: ${workspace.slug} (owner: ${owner.email})`);
  console.log(`✓ ${seedContacts.length} contacts, 2 companies, 2 tags`);
  console.log(`✓ pipeline: Sales (${pipeline.stages.length} stages), ${seedDeals.length} deals`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
