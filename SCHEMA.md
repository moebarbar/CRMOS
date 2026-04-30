# SCHEMA.md

> Single source of truth for the ChiefOS data model.
> When this file and `prisma/schema.prisma` disagree, **this file is authoritative** until updated. Always migrate the schema file to match before building features.

---

## Conventions (non-negotiable)

- Every multi-tenant table has `workspaceId` indexed.
- Money: `Decimal(12, 2)` always paired with a 3-letter `currency` field.
- Timestamps: UTC, ISO 8601, `createdAt` + `updatedAt` on every mutable table.
- Soft delete: `deletedAt` nullable timestamp on user-data tables (Contact, Deal, Project, Invoice, etc.). Hard delete only via explicit admin tooling.
- IDs: `cuid()` everywhere except Webhook/Activity which use `cuid2()` for shorter, sortable IDs.
- JSON columns for flexible/custom data (`customFields`, `blocks`, `payload`); typed at the application boundary via zod.
- All enums defined at bottom of file.

Row-Level Security is implemented in Supabase as a defense-in-depth layer. Application code is the primary enforcement point.

---

## 1. Identity & Tenancy

```prisma
model User {
  id              String        @id @default(cuid())
  clerkUserId     String        @unique
  email           String        @unique
  firstName       String?
  lastName        String?
  avatarUrl       String?
  timezone        String        @default("UTC")
  locale          String        @default("en")
  defaultWorkspaceId String?
  
  memberships     Membership[]
  ownedWorkspaces Workspace[]   @relation("WorkspaceOwner")
  notifications   Notification[]
  aiConversations AiConversation[]
  apiKeys         ApiKey[]
  
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  
  @@index([clerkUserId])
}

model Workspace {
  id              String        @id @default(cuid())
  name            String
  slug            String        @unique
  ownerId         String
  
  // Branding
  logoUrl         String?
  faviconUrl      String?
  brandPrimary    String        @default("#7c3aed")
  brandAccent     String        @default("#10b981")
  hideBranding    Boolean       @default(false)
  customCss       String?       @db.Text
  
  // Localization
  defaultCurrency String        @default("USD")
  timezone        String        @default("UTC")
  locale          String        @default("en")
  weekStart       Int           @default(1) // 0 = Sun, 1 = Mon
  dateFormat      String        @default("yyyy-MM-dd")
  
  // Email
  fromEmail       String?
  fromName        String?
  emailDomainVerified Boolean   @default(false)
  
  // Plan
  planId          String        @default("free")
  trialEndsAt     DateTime?
  subscriptionId  String?       // stripe subscription id
  aiCreditsUsed   Int           @default(0)
  aiCreditsLimit  Int           @default(50)
  storageUsedMb   Int           @default(0)
  storageLimitMb  Int           @default(500)
  
  // Settings
  settings        Json          @default("{}")
  
  owner           User          @relation("WorkspaceOwner", fields: [ownerId], references: [id])
  memberships     Membership[]
  domains         WorkspaceDomain[]
  contacts        Contact[]
  companies       Company[]
  pipelines       Pipeline[]
  deals           Deal[]
  projects        Project[]
  tasks           Task[]
  proposals       Proposal[]
  contracts       Contract[]
  invoices        Invoice[]
  payments        Payment[]
  forms           Form[]
  schedulers      Scheduler[]
  bookings        Booking[]
  timeEntries     TimeEntry[]
  files           File[]
  folders         Folder[]
  channels        Channel[]
  wikiPages       WikiPage[]
  workflows       Workflow[]
  activities      Activity[]
  auditLogs       AuditLog[]
  customFieldDefs CustomFieldDef[]
  tags            Tag[]
  notes           Note[]
  emailTemplates  EmailTemplate[]
  emailCampaigns  EmailCampaign[]
  sequences       Sequence[]
  webhookEndpoints WebhookEndpoint[]
  integrations    Integration[]
  taxRates        TaxRate[]
  
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  deletedAt       DateTime?
  
  @@index([slug])
  @@index([ownerId])
}

model WorkspaceDomain {
  id              String        @id @default(cuid())
  workspaceId     String
  hostname        String        @unique // app.youragency.com
  type            DomainType
  verified        Boolean       @default(false)
  sslIssued       Boolean       @default(false)
  
  workspace       Workspace     @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  
  createdAt       DateTime      @default(now())
  
  @@index([workspaceId])
}

model Membership {
  id              String        @id @default(cuid())
  userId          String
  workspaceId     String
  role            Role
  customRoleId    String?
  
  // Per-member settings
  notificationsEmail Boolean    @default(true)
  notificationsPush  Boolean    @default(true)
  cost            Decimal?      @db.Decimal(12, 2) // internal cost rate (for profitability)
  bill            Decimal?      @db.Decimal(12, 2) // default billable rate
  
  // For CONTRACTOR role: scoped to specific projects
  scopedProjectIds String[]     @default([])
  
  // For CLIENT role: tied to a contact
  contactId       String?

  // Invite handshake — opaque token emailed to invitee, cleared on accept
  inviteToken     String?       @unique
  inviteEmail     String?
  inviteExpiresAt DateTime?

  user            User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  workspace       Workspace     @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  customRole      CustomRole?   @relation(fields: [customRoleId], references: [id])
  
  invitedAt       DateTime      @default(now())
  acceptedAt      DateTime?
  
  @@unique([userId, workspaceId])
  @@index([workspaceId, role])
}

model CustomRole {
  id              String        @id @default(cuid())
  workspaceId     String
  name            String
  permissions     String[]      // ["contacts:read", "deals:write", ...]
  
  memberships     Membership[]
  
  createdAt       DateTime      @default(now())
  
  @@index([workspaceId])
}

model ApiKey {
  id              String        @id @default(cuid())
  workspaceId     String
  userId          String
  name            String
  prefix          String        // first 8 chars for display
  hash            String        @unique // sha-256 of full key
  scopes          String[]
  lastUsedAt      DateTime?
  expiresAt       DateTime?
  
  user            User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  createdAt       DateTime      @default(now())
  revokedAt       DateTime?
  
  @@index([workspaceId])
  @@index([hash])
}

model WebhookEndpoint {
  id              String        @id @default(cuid())
  workspaceId     String
  url             String
  secret          String        // for HMAC signature
  events          String[]      // ['contact.created', 'invoice.paid', '*']
  enabled         Boolean       @default(true)
  
  workspace       Workspace     @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  deliveries      WebhookDelivery[]
  
  createdAt       DateTime      @default(now())
  
  @@index([workspaceId])
}

model WebhookDelivery {
  id              String        @id @default(cuid())
  endpointId      String
  event           String
  payload         Json
  status          Int?          // HTTP status
  responseBody    String?       @db.Text
  attemptCount    Int           @default(0)
  succeededAt     DateTime?
  
  endpoint        WebhookEndpoint @relation(fields: [endpointId], references: [id], onDelete: Cascade)
  
  createdAt       DateTime      @default(now())
  
  @@index([endpointId])
}
```

---

## 2. CRM (Contacts, Companies, Tags, Notes)

```prisma
model Contact {
  id              String        @id @default(cuid())
  workspaceId     String
  
  // Identity
  firstName       String?
  lastName        String?
  email           String?
  phone           String?
  alternateEmails String[]      @default([])
  alternatePhones String[]      @default([])
  
  // Profile
  jobTitle        String?
  companyId       String?
  avatarUrl       String?
  websiteUrl      String?
  linkedinUrl     String?
  twitterUrl      String?
  
  // Address
  addressLine1    String?
  addressLine2    String?
  city            String?
  region          String?
  postalCode      String?
  country         String?
  
  // CRM
  ownerId         String?       // userId who owns the relationship
  source          String?       // 'form', 'manual', 'import', 'integration:hubspot', etc.
  lifecycleStage  LifecycleStage @default(LEAD)
  leadScore       Int           @default(0)
  doNotEmail      Boolean       @default(false)
  doNotCall       Boolean       @default(false)
  
  // Custom + flexible
  customFields    Json          @default("{}")
  
  // Counters (denormalized for performance, recomputed by jobs)
  totalRevenue    Decimal       @db.Decimal(12, 2) @default(0)
  openDealsValue  Decimal       @db.Decimal(12, 2) @default(0)
  lastContactedAt DateTime?
  
  workspace       Workspace     @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  company         Company?      @relation(fields: [companyId], references: [id])
  
  tags            ContactTag[]
  deals           Deal[]
  projects        Project[]
  proposals       Proposal[]
  contracts       Contract[]
  invoices        Invoice[]
  bookings        Booking[]
  formSubmissions FormSubmission[]
  notes           Note[]
  activities      Activity[]
  emailRecipients EmailRecipient[]
  sequenceEnrollments SequenceEnrollment[]
  
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  deletedAt       DateTime?
  
  @@index([workspaceId])
  @@index([workspaceId, email])
  @@index([workspaceId, ownerId])
  @@index([workspaceId, companyId])
  @@index([workspaceId, lifecycleStage])
}

model Company {
  id              String        @id @default(cuid())
  workspaceId     String
  name            String
  domain          String?       // 'acme.com'
  industry        String?
  size            String?       // '1-10', '11-50', etc.
  description     String?       @db.Text
  websiteUrl      String?
  linkedinUrl     String?
  logoUrl         String?
  
  // Address
  addressLine1    String?
  city            String?
  region          String?
  postalCode      String?
  country         String?
  
  ownerId         String?
  customFields    Json          @default("{}")
  
  // Counters
  totalRevenue    Decimal       @db.Decimal(12, 2) @default(0)
  
  workspace       Workspace     @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  contacts        Contact[]
  deals           Deal[]
  projects        Project[]
  
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  deletedAt       DateTime?
  
  @@unique([workspaceId, domain])
  @@index([workspaceId])
  @@index([workspaceId, name])
}

model Tag {
  id              String        @id @default(cuid())
  workspaceId     String
  name            String
  color           String        @default("#7c3aed")
  scope           TagScope      @default(CONTACT)
  
  workspace       Workspace     @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  contactTags     ContactTag[]
  
  createdAt       DateTime      @default(now())
  
  @@unique([workspaceId, name, scope])
  @@index([workspaceId])
}

model ContactTag {
  contactId       String
  tagId           String
  
  contact         Contact       @relation(fields: [contactId], references: [id], onDelete: Cascade)
  tag             Tag           @relation(fields: [tagId], references: [id], onDelete: Cascade)
  
  createdAt       DateTime      @default(now())
  
  @@id([contactId, tagId])
}

model Note {
  id              String        @id @default(cuid())
  workspaceId     String
  authorId        String
  
  // Polymorphic target
  targetType      ActivityTargetType
  targetId        String
  
  body            String        @db.Text
  bodyJson        Json?         // Tiptap doc for rich rendering
  isPrivate       Boolean       @default(false)
  
  contactId       String?
  contact         Contact?      @relation(fields: [contactId], references: [id], onDelete: Cascade)
  workspace       Workspace     @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  
  @@index([workspaceId, targetType, targetId])
  @@index([workspaceId, authorId])
}

model CustomFieldDef {
  id              String        @id @default(cuid())
  workspaceId     String
  
  entity          CustomFieldEntity // CONTACT, COMPANY, DEAL, PROJECT, etc.
  key             String        // machine name, e.g. 'budget_tier'
  label           String        // display name, e.g. 'Budget tier'
  type            CustomFieldType   // TEXT, NUMBER, DATE, SELECT, MULTI_SELECT, etc.
  options         Json?         // for SELECT/MULTI_SELECT: [{value, label, color}]
  required        Boolean       @default(false)
  defaultValue    Json?
  position        Int           @default(0)
  showInList      Boolean       @default(false)
  
  workspace       Workspace     @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  
  @@unique([workspaceId, entity, key])
  @@index([workspaceId, entity])
}
```

---

## 3. Sales Pipelines & Deals

```prisma
model Pipeline {
  id              String        @id @default(cuid())
  workspaceId     String
  name            String
  description     String?
  isDefault       Boolean       @default(false)
  position        Int           @default(0)
  
  workspace       Workspace     @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  stages          PipelineStage[]
  deals           Deal[]
  
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  
  @@index([workspaceId])
}

model PipelineStage {
  id              String        @id @default(cuid())
  pipelineId      String
  name            String
  position        Int
  probability     Float         @default(0.5) // 0..1, used for forecast
  color           String        @default("#94a3b8")
  rotInDays       Int?          // alert if a deal sits this long
  isWon           Boolean       @default(false)
  isLost          Boolean       @default(false)
  
  pipeline        Pipeline      @relation(fields: [pipelineId], references: [id], onDelete: Cascade)
  deals           Deal[]
  
  @@index([pipelineId])
}

model Deal {
  id              String        @id @default(cuid())
  workspaceId     String
  pipelineId      String
  stageId         String
  contactId       String?
  companyId       String?
  ownerId         String?
  
  title           String
  value           Decimal       @db.Decimal(12, 2)
  currency        String        @default("USD")
  expectedCloseDate DateTime?
  status          DealStatus    @default(OPEN)
  lostReason      String?
  source          String?
  description     String?       @db.Text
  
  customFields    Json          @default("{}")
  
  closedAt        DateTime?
  
  workspace       Workspace     @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  pipeline        Pipeline      @relation(fields: [pipelineId], references: [id])
  stage           PipelineStage @relation(fields: [stageId], references: [id])
  contact         Contact?      @relation(fields: [contactId], references: [id])
  company         Company?      @relation(fields: [companyId], references: [id])
  
  proposals       Proposal[]
  projects        Project[]
  invoices        Invoice[]
  
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  deletedAt       DateTime?
  
  @@index([workspaceId, status])
  @@index([workspaceId, pipelineId, stageId])
  @@index([workspaceId, ownerId])
}
```

---

## 4. Projects, Milestones, Tasks

```prisma
model Project {
  id              String        @id @default(cuid())
  workspaceId     String
  contactId       String?
  companyId       String?
  dealId          String?
  ownerId         String?
  templateId      String?
  
  name            String
  description     String?       @db.Text
  status          ProjectStatus @default(NEW)
  priority        Priority      @default(NORMAL)
  startDate       DateTime?
  dueDate         DateTime?
  completedAt     DateTime?
  
  // Budget
  budgetAmount    Decimal?      @db.Decimal(12, 2)
  budgetCurrency  String        @default("USD")
  budgetHours     Float?
  
  // Counters (denormalized)
  taskCount       Int           @default(0)
  completedTaskCount Int        @default(0)
  hoursLogged     Float         @default(0)
  amountInvoiced  Decimal       @db.Decimal(12, 2) @default(0)
  amountPaid      Decimal       @db.Decimal(12, 2) @default(0)
  
  customFields    Json          @default("{}")
  color           String        @default("#7c3aed")
  
  workspace       Workspace     @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  contact         Contact?      @relation(fields: [contactId], references: [id])
  company         Company?      @relation(fields: [companyId], references: [id])
  template        ProjectTemplate? @relation(fields: [templateId], references: [id])
  
  milestones      Milestone[]
  tasks           Task[]
  files           File[]
  invoices        Invoice[]
  timeEntries     TimeEntry[]
  
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  deletedAt       DateTime?
  
  @@index([workspaceId, status])
  @@index([workspaceId, ownerId])
  @@index([workspaceId, contactId])
}

model ProjectTemplate {
  id              String        @id @default(cuid())
  workspaceId     String
  name            String
  description     String?
  durationDays    Int?
  data            Json          // structured: milestones, tasks, default fields
  
  projects        Project[]
  
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  
  @@index([workspaceId])
}

model Milestone {
  id              String        @id @default(cuid())
  workspaceId     String
  projectId       String
  name            String
  position        Int
  dueDate         DateTime?
  completedAt     DateTime?
  
  project         Project       @relation(fields: [projectId], references: [id], onDelete: Cascade)
  tasks           Task[]
  
  createdAt       DateTime      @default(now())
  
  @@index([projectId])
}

model Task {
  id              String        @id @default(cuid())
  workspaceId     String
  projectId       String?
  milestoneId     String?
  parentTaskId    String?
  
  title           String
  description     String?       @db.Text
  descriptionJson Json?         // Tiptap
  status          TaskStatus    @default(TODO)
  priority        Priority      @default(NORMAL)
  
  assigneeId      String?
  reporterId      String?
  
  dueDate         DateTime?
  startDate       DateTime?
  completedAt     DateTime?
  estimateMinutes Int?
  
  position        Float         // for kanban ordering, use floats so we can insert between
  
  customFields    Json          @default("{}")
  recurrenceRule  String?       // RRULE format
  recurrenceParentId String?    // if this is an instance, points to template
  
  workspace       Workspace     @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  project         Project?      @relation(fields: [projectId], references: [id], onDelete: Cascade)
  milestone       Milestone?    @relation(fields: [milestoneId], references: [id])
  parentTask      Task?         @relation("Subtasks", fields: [parentTaskId], references: [id], onDelete: Cascade)
  subtasks        Task[]        @relation("Subtasks")
  
  dependsOn       TaskDependency[] @relation("DependentTask")
  blocks          TaskDependency[] @relation("BlockingTask")
  
  timeEntries     TimeEntry[]
  
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  deletedAt       DateTime?
  
  @@index([workspaceId, status])
  @@index([workspaceId, assigneeId, status])
  @@index([projectId, status, position])
}

model TaskDependency {
  id              String        @id @default(cuid())
  blockingTaskId  String        // must be done first
  dependentTaskId String        // is blocked
  
  blockingTask    Task          @relation("BlockingTask", fields: [blockingTaskId], references: [id], onDelete: Cascade)
  dependentTask   Task          @relation("DependentTask", fields: [dependentTaskId], references: [id], onDelete: Cascade)
  
  @@unique([blockingTaskId, dependentTaskId])
  @@index([dependentTaskId])
}
```

---

## 5. Proposals

```prisma
model Proposal {
  id              String        @id @default(cuid())
  workspaceId     String
  contactId       String?
  dealId          String?
  templateId      String?
  
  number          String        // PRP-0001
  title           String
  status          ProposalStatus @default(DRAFT)
  
  blocks          Json          // Tiptap document JSON
  variables       Json          @default("{}")  // resolved variable values
  
  publicSlug      String        @unique
  passwordHash    String?       // optional protection
  
  total           Decimal       @db.Decimal(12, 2) @default(0)
  currency        String        @default("USD")
  
  // Lifecycle
  sentAt          DateTime?
  firstViewedAt   DateTime?
  lastViewedAt    DateTime?
  viewCount       Int           @default(0)
  approvedAt      DateTime?
  declinedAt      DateTime?
  declinedReason  String?
  expiresAt       DateTime?
  
  // Signature
  signedByName    String?
  signedByEmail   String?
  signatureSvg    String?       @db.Text
  signedIp        String?
  signedAt        DateTime?
  
  // Branding override
  brandPrimary    String?
  logoUrl         String?
  
  workspace       Workspace     @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  contact         Contact?      @relation(fields: [contactId], references: [id])
  template        ProposalTemplate? @relation(fields: [templateId], references: [id])
  
  views           ProposalView[]
  contracts       Contract[]
  invoices        Invoice[]
  
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  deletedAt       DateTime?
  
  @@index([workspaceId, status])
  @@index([publicSlug])
}

model ProposalTemplate {
  id              String        @id @default(cuid())
  workspaceId     String
  name            String
  description     String?
  blocks          Json
  isPublic        Boolean       @default(false)  // shared in marketplace
  
  proposals       Proposal[]
  
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  
  @@index([workspaceId])
}

model ProposalView {
  id              String        @id @default(cuid())
  proposalId      String
  ip              String?
  userAgent       String?
  referrer        String?
  durationSeconds Int?
  blocksViewed    String[]      @default([])
  
  proposal        Proposal      @relation(fields: [proposalId], references: [id], onDelete: Cascade)
  
  createdAt       DateTime      @default(now())
  
  @@index([proposalId])
}
```

---

## 6. Contracts & E-Signature

```prisma
model Contract {
  id              String        @id @default(cuid())
  workspaceId     String
  contactId       String?
  proposalId      String?
  templateId      String?
  
  number          String        // CTR-0001
  title           String
  status          ContractStatus @default(DRAFT)
  
  blocks          Json
  variables       Json          @default("{}")
  
  publicSlug      String        @unique
  
  // Lifecycle
  sentAt          DateTime?
  firstViewedAt   DateTime?
  expiresAt       DateTime?
  voidedAt        DateTime?
  voidedReason    String?
  
  // Final artifact
  signedPdfUrl    String?
  signedPdfHash   String?       // sha-256 for tamper-evidence
  
  // Legal mode
  legalProvider   String?       // 'native' | 'yousign' | 'docusign'
  legalProviderRef String?
  
  workspace       Workspace     @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  contact         Contact?      @relation(fields: [contactId], references: [id])
  proposal        Proposal?     @relation(fields: [proposalId], references: [id])
  template        ContractTemplate? @relation(fields: [templateId], references: [id])
  
  signers         ContractSigner[]
  fields          ContractField[]
  
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  deletedAt       DateTime?
  
  @@index([workspaceId, status])
  @@index([publicSlug])
}

model ContractTemplate {
  id              String        @id @default(cuid())
  workspaceId     String
  name            String
  blocks          Json
  fields          Json          // signature/initial/text field positions
  isPublic        Boolean       @default(false)
  
  contracts       Contract[]
  
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  
  @@index([workspaceId])
}

model ContractSigner {
  id              String        @id @default(cuid())
  contractId      String
  
  email           String
  name            String?
  role            String?       // 'Client', 'Witness', 'Counter-signer'
  signOrder       Int           @default(0) // 0 = parallel; 1+ = sequential
  
  signedAt        DateTime?
  signedIp        String?
  signedUserAgent String?
  signatureSvg    String?       @db.Text
  signedName      String?       // typed name as record of consent
  declinedAt      DateTime?
  declinedReason  String?
  
  notifyToken     String        @unique // signed token for email link
  
  contract        Contract      @relation(fields: [contractId], references: [id], onDelete: Cascade)
  
  createdAt       DateTime      @default(now())
  
  @@index([contractId])
}

model ContractField {
  id              String        @id @default(cuid())
  contractId      String
  signerId        String?       // null = system-filled
  
  type            ContractFieldType
  page            Int
  x               Float
  y               Float
  width           Float
  height          Float
  required        Boolean       @default(true)
  value           String?       @db.Text
  filledAt        DateTime?
  
  contract        Contract      @relation(fields: [contractId], references: [id], onDelete: Cascade)
  
  @@index([contractId])
}
```

---

## 7. Invoices, Payments, Recurring, Tax

```prisma
model Invoice {
  id              String        @id @default(cuid())
  workspaceId     String
  contactId       String?
  companyId       String?
  projectId       String?
  dealId          String?
  proposalId      String?
  
  number          String        // INV-0001
  status          InvoiceStatus @default(DRAFT)
  
  issueDate       DateTime
  dueDate         DateTime
  currency        String        @default("USD")
  
  subtotal        Decimal       @db.Decimal(12, 2) @default(0)
  taxTotal        Decimal       @db.Decimal(12, 2) @default(0)
  discountTotal   Decimal       @db.Decimal(12, 2) @default(0)
  total           Decimal       @db.Decimal(12, 2) @default(0)
  amountPaid      Decimal       @db.Decimal(12, 2) @default(0)
  amountDue       Decimal       @db.Decimal(12, 2) @default(0)
  
  notes           String?       @db.Text
  termsAndConditions String?    @db.Text
  
  publicSlug      String        @unique
  
  // Lifecycle
  sentAt          DateTime?
  firstViewedAt   DateTime?
  paidAt          DateTime?
  voidedAt        DateTime?
  
  recurringRuleId String?
  
  // Payment-link config
  acceptCard      Boolean       @default(true)
  acceptAch       Boolean       @default(false)
  acceptPaypal    Boolean       @default(false)
  
  workspace       Workspace     @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  contact         Contact?      @relation(fields: [contactId], references: [id])
  project         Project?      @relation(fields: [projectId], references: [id])
  recurringRule   RecurringInvoice? @relation(fields: [recurringRuleId], references: [id])
  
  lineItems       InvoiceLineItem[]
  payments        Payment[]
  refunds         Refund[]
  creditNotes     CreditNote[]
  
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  deletedAt       DateTime?
  
  @@index([workspaceId, status])
  @@index([workspaceId, contactId])
  @@index([publicSlug])
}

model InvoiceLineItem {
  id              String        @id @default(cuid())
  invoiceId       String
  position        Int
  
  description     String
  quantity        Decimal       @db.Decimal(12, 2) @default(1)
  unitPrice       Decimal       @db.Decimal(12, 2)
  taxRateId       String?
  discountPercent Decimal       @db.Decimal(5, 2) @default(0)
  total           Decimal       @db.Decimal(12, 2)
  
  // Linkage to billed source
  timeEntryIds    String[]      @default([])
  
  invoice         Invoice       @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
  taxRate         TaxRate?      @relation(fields: [taxRateId], references: [id])
  
  @@index([invoiceId])
}

model RecurringInvoice {
  id              String        @id @default(cuid())
  workspaceId     String
  contactId       String?
  
  name            String
  template        Json          // line items, terms, settings
  
  frequency       RecurringFrequency
  intervalCount   Int           @default(1) // every N units
  startDate       DateTime
  endDate         DateTime?
  occurrencesLimit Int?
  
  nextRunAt       DateTime
  lastRunAt       DateTime?
  occurrencesCount Int          @default(0)
  status          String        @default("active") // active, paused, ended
  
  invoices        Invoice[]
  
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  
  @@index([workspaceId, nextRunAt])
}

model Payment {
  id              String        @id @default(cuid())
  workspaceId     String
  invoiceId       String
  
  amount          Decimal       @db.Decimal(12, 2)
  currency        String
  method          PaymentMethod
  status          PaymentStatus @default(SUCCEEDED)
  
  // Stripe
  stripePaymentIntentId String? @unique
  stripeChargeId  String?
  stripeFeeAmount Decimal?      @db.Decimal(12, 2)
  
  // Manual / external
  reference       String?       // check number, wire ID, etc.
  
  paidAt          DateTime
  
  workspace       Workspace     @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  invoice         Invoice       @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
  
  createdAt       DateTime      @default(now())
  
  @@index([workspaceId])
  @@index([invoiceId])
}

model Refund {
  id              String        @id @default(cuid())
  invoiceId       String
  paymentId       String?
  amount          Decimal       @db.Decimal(12, 2)
  reason          String?
  stripeRefundId  String?       @unique
  
  invoice         Invoice       @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
  
  createdAt       DateTime      @default(now())
  
  @@index([invoiceId])
}

model CreditNote {
  id              String        @id @default(cuid())
  workspaceId     String
  invoiceId       String
  number          String
  amount          Decimal       @db.Decimal(12, 2)
  reason          String
  
  invoice         Invoice       @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
  
  createdAt       DateTime      @default(now())
  
  @@index([workspaceId])
}

model TaxRate {
  id              String        @id @default(cuid())
  workspaceId     String
  name            String        // 'VAT 20%', 'GST 10%', 'TX Sales 8.25%'
  rate            Decimal       @db.Decimal(5, 4) // e.g. 0.2000 for 20%
  isDefault       Boolean       @default(false)
  isInclusive     Boolean       @default(false)
  region          String?       // 'GB', 'US-TX'
  
  workspace       Workspace     @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  lineItems       InvoiceLineItem[]
  
  createdAt       DateTime      @default(now())
  
  @@index([workspaceId])
}
```

---

## 8. Forms

```prisma
model Form {
  id              String        @id @default(cuid())
  workspaceId     String
  
  name            String
  description     String?
  schema          Json          // ordered field definitions
  settings        Json          @default("{}")  // theming, redirect URL, etc.
  
  publicSlug      String        @unique
  enabled         Boolean       @default(true)
  
  acceptsPayment  Boolean       @default(false)
  paymentAmount   Decimal?      @db.Decimal(12, 2)
  paymentCurrency String?
  
  // Auto-actions on submit
  createContact   Boolean       @default(true)
  createDeal      Boolean       @default(false)
  createProject   Boolean       @default(false)
  
  workspace       Workspace     @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  submissions     FormSubmission[]
  
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  deletedAt       DateTime?
  
  @@index([workspaceId])
  @@index([publicSlug])
}

model FormSubmission {
  id              String        @id @default(cuid())
  formId          String
  contactId       String?
  
  data            Json          // { fieldId: value, ... }
  ip              String?
  userAgent       String?
  referrer        String?
  
  paymentStatus   PaymentStatus?
  paymentId       String?
  
  form            Form          @relation(fields: [formId], references: [id], onDelete: Cascade)
  contact         Contact?      @relation(fields: [contactId], references: [id])
  
  createdAt       DateTime      @default(now())
  
  @@index([formId])
}
```

---

## 9. Schedulers & Bookings

```prisma
model Scheduler {
  id              String        @id @default(cuid())
  workspaceId     String
  ownerId         String        // primary host (userId)
  
  name            String
  description     String?
  durationMinutes Int           @default(30)
  bufferBeforeMinutes Int       @default(0)
  bufferAfterMinutes Int        @default(0)
  
  publicSlug      String        @unique
  enabled         Boolean       @default(true)
  
  // Type
  schedulerType   SchedulerType @default(ONE_ON_ONE)
  hostUserIds     String[]      @default([])  // for ROUND_ROBIN, COLLECTIVE, GROUP
  maxAttendees    Int?
  
  // Availability
  availabilityRules Json         // see structure below
  // {
  //   weekly: { mon: [{start: "09:00", end: "17:00"}], ... },
  //   exceptions: [{date: "2026-12-25", available: false}],
  //   advanceNoticeHours: 12,
  //   maxBookingsPerDay: 5,
  //   horizonDays: 60,
  // }
  
  // Meeting
  locationType    String        @default("video") // 'video' | 'in_person' | 'phone' | 'custom'
  location        String?
  videoProvider   String?       // 'google_meet' | 'zoom' | 'whereby'
  
  // Payment
  requiresPayment Boolean       @default(false)
  paymentAmount   Decimal?      @db.Decimal(12, 2)
  paymentCurrency String?
  
  // Intake
  intakeFormId    String?
  
  workspace       Workspace     @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  bookings        Booking[]
  
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  deletedAt       DateTime?
  
  @@index([workspaceId])
  @@index([publicSlug])
}

model Booking {
  id              String        @id @default(cuid())
  workspaceId     String
  schedulerId     String
  contactId       String?
  hostUserId      String
  
  startsAt        DateTime
  endsAt          DateTime
  status          BookingStatus @default(CONFIRMED)
  
  attendeeName    String
  attendeeEmail   String
  attendeePhone   String?
  intakeData      Json?         // form responses
  notes           String?       @db.Text
  
  meetingUrl      String?
  externalCalendarEventId String?
  
  cancellationReason String?
  rescheduleToken String        @unique // signed token for cancel/reschedule
  
  workspace       Workspace     @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  scheduler       Scheduler     @relation(fields: [schedulerId], references: [id], onDelete: Cascade)
  contact         Contact?      @relation(fields: [contactId], references: [id])
  
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  
  @@index([workspaceId, startsAt])
  @@index([schedulerId, startsAt])
  @@index([hostUserId, startsAt])
}

model CalendarConnection {
  id              String        @id @default(cuid())
  userId          String
  provider        String        // 'google' | 'microsoft' | 'apple'
  externalAccountId String
  accessToken     String        @db.Text  // encrypted at rest
  refreshToken    String?       @db.Text
  tokenExpiresAt  DateTime?
  scopes          String[]
  primaryCalendarId String?
  syncEnabled     Boolean       @default(true)
  
  createdAt       DateTime      @default(now())
  
  @@unique([userId, provider, externalAccountId])
}
```

---

## 10. Time Tracking

```prisma
model TimeEntry {
  id              String        @id @default(cuid())
  workspaceId     String
  userId          String
  projectId       String?
  taskId          String?
  
  description     String?
  startedAt       DateTime
  endedAt         DateTime?
  durationMinutes Int           @default(0)
  
  billable        Boolean       @default(true)
  hourlyRate      Decimal?      @db.Decimal(12, 2)
  rateCurrency    String?
  
  invoiceLineItemId String?     // once billed
  approvedAt      DateTime?
  approvedById    String?
  lockedAt        DateTime?     // immutable after timesheet submission
  
  workspace       Workspace     @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  project         Project?      @relation(fields: [projectId], references: [id])
  task            Task?         @relation(fields: [taskId], references: [id])
  
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  
  @@index([workspaceId, userId, startedAt])
  @@index([projectId])
}

model Timesheet {
  id              String        @id @default(cuid())
  workspaceId     String
  userId          String
  
  periodStart     DateTime
  periodEnd       DateTime
  status          TimesheetStatus @default(DRAFT)
  
  submittedAt     DateTime?
  approvedAt      DateTime?
  approvedById    String?
  rejectedReason  String?
  
  totalMinutes    Int           @default(0)
  billableMinutes Int           @default(0)
  
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  
  @@unique([workspaceId, userId, periodStart])
  @@index([workspaceId, status])
}
```

---

## 11. Files & Folders

```prisma
model Folder {
  id              String        @id @default(cuid())
  workspaceId     String
  parentFolderId  String?
  name            String
  color           String        @default("#94a3b8")
  
  workspace       Workspace     @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  parent          Folder?       @relation("Subfolders", fields: [parentFolderId], references: [id], onDelete: Cascade)
  children        Folder[]      @relation("Subfolders")
  files           File[]
  
  createdAt       DateTime      @default(now())
  
  @@index([workspaceId, parentFolderId])
}

model File {
  id              String        @id @default(cuid())
  workspaceId     String
  folderId        String?
  uploaderId      String
  
  // Polymorphic attachment
  attachedToType  ActivityTargetType?
  attachedToId    String?
  
  name            String
  mimeType        String
  sizeBytes       BigInt
  storageKey      String        // S3/Supabase Storage path
  storageUrl      String?       // CDN URL if public
  checksum        String?       // sha-256
  
  thumbnailUrl    String?
  metadata        Json?         // EXIF, dimensions, page count
  
  // Versioning
  versionOf       String?       // file id of the latest
  versionNumber   Int           @default(1)
  
  workspace       Workspace     @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  folder          Folder?       @relation(fields: [folderId], references: [id])
  shares          FileShare[]
  
  createdAt       DateTime      @default(now())
  deletedAt       DateTime?
  
  @@index([workspaceId, folderId])
  @@index([workspaceId, attachedToType, attachedToId])
}

model FileShare {
  id              String        @id @default(cuid())
  fileId          String
  publicSlug      String        @unique
  passwordHash    String?
  expiresAt       DateTime?
  downloadCount   Int           @default(0)
  maxDownloads    Int?
  
  file            File          @relation(fields: [fileId], references: [id], onDelete: Cascade)
  
  createdAt       DateTime      @default(now())
  
  @@index([fileId])
}

model FileRequest {
  id              String        @id @default(cuid())
  workspaceId     String
  contactId       String?
  
  title           String
  message         String?
  publicSlug      String        @unique
  expiresAt       DateTime?
  fulfilledAt     DateTime?
  
  createdAt       DateTime      @default(now())
  
  @@index([workspaceId])
}
```

---

## 12. Inbox & Messaging

```prisma
model Channel {
  id              String        @id @default(cuid())
  workspaceId     String
  name            String?       // for groups; null for DMs
  type            ChannelType
  
  // Polymorphic context (#project-acme links to a project)
  contextType     ActivityTargetType?
  contextId       String?
  
  isPrivate       Boolean       @default(false)
  
  workspace       Workspace     @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  members         ChannelMember[]
  messages        Message[]
  
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  
  @@index([workspaceId, type])
}

model ChannelMember {
  channelId       String
  userId          String
  joinedAt        DateTime      @default(now())
  lastReadAt      DateTime?
  isMuted         Boolean       @default(false)
  
  channel         Channel       @relation(fields: [channelId], references: [id], onDelete: Cascade)
  
  @@id([channelId, userId])
}

model Message {
  id              String        @id @default(cuid())
  channelId       String
  authorId        String        // userId
  
  body            String        @db.Text
  bodyJson        Json?
  
  // Reply thread
  parentMessageId String?
  
  // Edited
  editedAt        DateTime?
  
  channel         Channel       @relation(fields: [channelId], references: [id], onDelete: Cascade)
  reactions       MessageReaction[]
  attachments     MessageAttachment[]
  
  createdAt       DateTime      @default(now())
  deletedAt       DateTime?
  
  @@index([channelId, createdAt])
  @@index([parentMessageId])
}

model MessageReaction {
  messageId       String
  userId          String
  emoji           String
  
  message         Message       @relation(fields: [messageId], references: [id], onDelete: Cascade)
  
  createdAt       DateTime      @default(now())
  
  @@id([messageId, userId, emoji])
}

model MessageAttachment {
  id              String        @id @default(cuid())
  messageId       String
  fileId          String
  
  message         Message       @relation(fields: [messageId], references: [id], onDelete: Cascade)
  
  @@index([messageId])
}

// Email integration — incoming email maps to threads on a contact
model EmailThread {
  id              String        @id @default(cuid())
  workspaceId     String
  contactId       String?
  
  subject         String
  participantEmails String[]    @default([])
  
  // External ref (Gmail/Outlook thread id)
  externalThreadId String?
  
  messages        EmailMessage[]
  
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  
  @@index([workspaceId, contactId])
}

model EmailMessage {
  id              String        @id @default(cuid())
  threadId        String
  
  externalMessageId String?     @unique
  direction       EmailDirection
  fromEmail       String
  fromName        String?
  toEmails        String[]
  ccEmails        String[]      @default([])
  bccEmails       String[]      @default([])
  subject         String
  bodyHtml        String?       @db.Text
  bodyText        String?       @db.Text
  
  receivedAt      DateTime
  
  thread          EmailThread   @relation(fields: [threadId], references: [id], onDelete: Cascade)
  
  @@index([threadId, receivedAt])
}
```

---

## 13. Wiki / Knowledge Base

```prisma
model WikiPage {
  id              String        @id @default(cuid())
  workspaceId     String
  parentPageId    String?
  authorId        String
  
  title           String
  slug            String
  blocks          Json          // Tiptap doc
  
  emoji           String?
  coverImageUrl   String?
  
  isPublic        Boolean       @default(false)  // visible to clients in portal?
  
  workspace       Workspace     @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  parent          WikiPage?     @relation("Subpages", fields: [parentPageId], references: [id], onDelete: Cascade)
  children        WikiPage[]    @relation("Subpages")
  
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  deletedAt       DateTime?
  
  @@unique([workspaceId, slug])
  @@index([workspaceId, parentPageId])
}
```

---

## 14. Workflows / Automations

```prisma
model Workflow {
  id              String        @id @default(cuid())
  workspaceId     String
  
  name            String
  description     String?
  
  trigger         Json          // { type: 'invoice.paid', filters: {...} }
  steps           Json          // ordered list of action nodes
  
  enabled         Boolean       @default(true)
  
  workspace       Workspace     @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  runs            WorkflowRun[]
  
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  deletedAt       DateTime?
  
  @@index([workspaceId])
}

model WorkflowRun {
  id              String        @id @default(cuid())
  workflowId      String
  
  status          WorkflowRunStatus
  triggerEvent    Json          // event payload that fired it
  state           Json          @default("{}")  // variables collected during run
  
  startedAt       DateTime      @default(now())
  endedAt         DateTime?
  
  errorStep       Int?
  errorMessage    String?       @db.Text
  
  workflow        Workflow      @relation(fields: [workflowId], references: [id], onDelete: Cascade)
  
  @@index([workflowId, startedAt])
}
```

---

## 15. Email Marketing & Sequences

```prisma
model EmailTemplate {
  id              String        @id @default(cuid())
  workspaceId     String
  name            String
  subject         String
  bodyHtml        String        @db.Text
  bodyJson        Json?
  
  workspace       Workspace     @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  
  @@index([workspaceId])
}

model EmailCampaign {
  id              String        @id @default(cuid())
  workspaceId     String
  
  name            String
  subject         String
  bodyHtml        String        @db.Text
  segmentFilter   Json          // saved filter to compute recipients
  
  status          CampaignStatus @default(DRAFT)
  scheduledAt     DateTime?
  sentAt          DateTime?
  
  recipientCount  Int           @default(0)
  openCount       Int           @default(0)
  clickCount      Int           @default(0)
  unsubscribeCount Int          @default(0)
  
  workspace       Workspace     @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  recipients      EmailRecipient[]
  
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  
  @@index([workspaceId, status])
}

model EmailRecipient {
  id              String        @id @default(cuid())
  campaignId      String
  contactId       String
  
  status          String        // 'queued' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'unsubscribed'
  sentAt          DateTime?
  openedAt        DateTime?
  clickedAt       DateTime?
  
  campaign        EmailCampaign @relation(fields: [campaignId], references: [id], onDelete: Cascade)
  contact         Contact       @relation(fields: [contactId], references: [id], onDelete: Cascade)
  
  @@unique([campaignId, contactId])
}

model Sequence {
  id              String        @id @default(cuid())
  workspaceId     String
  name            String
  description     String?
  enabled         Boolean       @default(true)
  
  workspace       Workspace     @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  steps           SequenceStep[]
  enrollments     SequenceEnrollment[]
  
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  
  @@index([workspaceId])
}

model SequenceStep {
  id              String        @id @default(cuid())
  sequenceId      String
  position        Int
  
  delayMinutes    Int           // minutes after previous step
  type            String        // 'email' | 'sms' | 'task'
  template        Json
  
  sequence        Sequence      @relation(fields: [sequenceId], references: [id], onDelete: Cascade)
  
  @@index([sequenceId, position])
}

model SequenceEnrollment {
  id              String        @id @default(cuid())
  sequenceId      String
  contactId       String
  
  currentStep     Int           @default(0)
  status          String        @default("active") // active, paused, completed, bounced
  enrolledAt      DateTime      @default(now())
  completedAt     DateTime?
  
  sequence        Sequence      @relation(fields: [sequenceId], references: [id], onDelete: Cascade)
  contact         Contact       @relation(fields: [contactId], references: [id], onDelete: Cascade)
  
  @@unique([sequenceId, contactId])
}
```

---

## 16. AI / Moe

```prisma
model AiConversation {
  id              String        @id @default(cuid())
  workspaceId     String
  userId          String
  
  title           String?       // auto-generated summary of first message
  context         Json?         // page where it was started, current entity, etc.
  
  user            User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  messages        AiMessage[]
  toolCalls       AiToolCall[]
  
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  
  @@index([workspaceId, userId, updatedAt])
}

model AiMessage {
  id              String        @id @default(cuid())
  conversationId  String
  role            String        // 'user' | 'assistant' | 'tool'
  content         Json          // structured content blocks (text, image, tool_use, tool_result)
  
  // Token usage
  inputTokens     Int?
  outputTokens    Int?
  model           String?
  
  conversation    AiConversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  
  createdAt       DateTime      @default(now())
  
  @@index([conversationId, createdAt])
}

model AiToolCall {
  id              String        @id @default(cuid())
  conversationId  String
  messageId       String?
  
  toolName        String
  input           Json
  output          Json?
  status          String        // 'pending' | 'success' | 'error' | 'awaiting_confirmation' | 'rejected'
  errorMessage    String?       @db.Text
  
  durationMs      Int?
  
  conversation    AiConversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  
  createdAt       DateTime      @default(now())
  
  @@index([conversationId])
}

// Long-term memory: facts about workspace, user, common patterns
model AiMemory {
  id              String        @id @default(cuid())
  workspaceId     String
  scope           String        // 'workspace' | 'user' | 'contact:{id}' | 'project:{id}'
  scopeId         String?
  
  content         String        @db.Text
  embedding       Unsupported("vector(1536)")?
  
  source          String?       // 'manual' | 'extracted' | 'observation'
  importance      Float         @default(0.5)
  
  createdAt       DateTime      @default(now())
  lastAccessedAt  DateTime      @default(now())
  
  @@index([workspaceId, scope, scopeId])
}

// Vector index for semantic search across notes, messages, files
model SearchDocument {
  id              String        @id @default(cuid())
  workspaceId     String
  
  sourceType      String        // 'note' | 'message' | 'file' | 'proposal' | 'email'
  sourceId        String
  
  content         String        @db.Text
  embedding       Unsupported("vector(1536)")?
  
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  
  @@unique([workspaceId, sourceType, sourceId])
  @@index([workspaceId, sourceType])
}
```

---

## 17. Activity, Audit Log, Notifications

```prisma
model Activity {
  id              String        @id @default(cuid())
  workspaceId     String
  actorId         String?       // userId; null = system; 'moe' = AI agent
  actorType       String        @default("user") // 'user' | 'system' | 'moe' | 'integration'
  
  verb            String        // 'created' | 'updated' | 'sent' | 'paid' | 'signed' | 'commented'
  targetType      ActivityTargetType
  targetId        String
  
  payload         Json?         // diff, snapshot, or details
  
  workspace       Workspace     @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  
  createdAt       DateTime      @default(now())
  
  @@index([workspaceId, targetType, targetId, createdAt])
  @@index([workspaceId, actorId, createdAt])
}

model AuditLog {
  // append-only, never edited, used for compliance + security
  id              String        @id @default(cuid())
  workspaceId     String
  userId          String?
  
  action          String        // 'invoice.paid', 'permissions.changed'
  resource        String
  resourceId      String?
  
  ip              String?
  userAgent       String?
  diff            Json?
  
  workspace       Workspace     @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  
  createdAt       DateTime      @default(now())
  
  @@index([workspaceId, createdAt])
  @@index([workspaceId, action, createdAt])
}

model Notification {
  id              String        @id @default(cuid())
  userId          String
  workspaceId     String
  
  type            String        // 'mention' | 'task_assigned' | 'invoice_paid' | etc.
  title           String
  body            String?
  link            String?
  
  // Polymorphic source
  sourceType      ActivityTargetType?
  sourceId        String?
  
  readAt          DateTime?
  
  user            User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  createdAt       DateTime      @default(now())
  
  @@index([userId, readAt])
}
```

---

## 18. Integrations

```prisma
model Integration {
  id              String        @id @default(cuid())
  workspaceId     String
  
  provider        String        // 'gmail' | 'google_calendar' | 'slack' | 'quickbooks' | 'xero' | 'stripe'
  externalAccountId String?
  config          Json          @default("{}")
  
  enabled         Boolean       @default(true)
  
  workspace       Workspace     @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  oauthToken      OauthToken?
  
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  
  @@unique([workspaceId, provider])
}

model OauthToken {
  id              String        @id @default(cuid())
  integrationId   String        @unique
  
  accessToken     String        @db.Text  // encrypted
  refreshToken    String?       @db.Text  // encrypted
  expiresAt       DateTime?
  scopes          String[]      @default([])
  
  integration     Integration   @relation(fields: [integrationId], references: [id], onDelete: Cascade)
  
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
}
```

---

## 19. Enums

```prisma
enum Role {
  OWNER
  ADMIN
  MEMBER
  CONTRACTOR
  CLIENT
  CUSTOM
}

enum DomainType {
  APP
  PORTAL
  EMAIL
}

enum LifecycleStage {
  SUBSCRIBER
  LEAD
  MQL
  SQL
  OPPORTUNITY
  CUSTOMER
  EVANGELIST
  OTHER
}

enum TagScope {
  CONTACT
  COMPANY
  DEAL
  PROJECT
  TASK
  FILE
}

enum CustomFieldEntity {
  CONTACT
  COMPANY
  DEAL
  PROJECT
  TASK
  INVOICE
  PROPOSAL
}

enum CustomFieldType {
  TEXT
  TEXTAREA
  NUMBER
  CURRENCY
  DATE
  DATETIME
  BOOLEAN
  SELECT
  MULTI_SELECT
  EMAIL
  PHONE
  URL
  ADDRESS
  USER          // FK to User
  CONTACT       // FK to Contact
  FILE          // FK to File
}

enum DealStatus {
  OPEN
  WON
  LOST
}

enum ProjectStatus {
  NEW
  ACTIVE
  ON_HOLD
  COMPLETED
  ARCHIVED
  CANCELED
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  IN_REVIEW
  DONE
  BLOCKED
  CANCELED
}

enum Priority {
  LOW
  NORMAL
  HIGH
  URGENT
}

enum ProposalStatus {
  DRAFT
  SENT
  VIEWED
  APPROVED
  DECLINED
  EXPIRED
}

enum ContractStatus {
  DRAFT
  SENT
  VIEWED
  PARTIALLY_SIGNED
  SIGNED
  DECLINED
  EXPIRED
  VOIDED
}

enum ContractFieldType {
  SIGNATURE
  INITIAL
  TEXT
  DATE
  CHECKBOX
  NAME
  EMAIL
}

enum InvoiceStatus {
  DRAFT
  SENT
  VIEWED
  PARTIAL
  PAID
  OVERDUE
  VOID
  REFUNDED
}

enum PaymentMethod {
  CARD
  ACH
  BANK_TRANSFER
  PAYPAL
  CHECK
  CASH
  CRYPTO
  OTHER
  MANUAL
}

enum PaymentStatus {
  PENDING
  SUCCEEDED
  FAILED
  REFUNDED
  PARTIALLY_REFUNDED
  CANCELED
}

enum RecurringFrequency {
  WEEKLY
  BIWEEKLY
  MONTHLY
  QUARTERLY
  SEMIANNUAL
  ANNUAL
  CUSTOM
}

enum SchedulerType {
  ONE_ON_ONE
  ROUND_ROBIN
  COLLECTIVE
  GROUP
}

enum BookingStatus {
  CONFIRMED
  RESCHEDULED
  CANCELED
  COMPLETED
  NO_SHOW
}

enum TimesheetStatus {
  DRAFT
  SUBMITTED
  APPROVED
  REJECTED
  LOCKED
}

enum ChannelType {
  DIRECT       // 1:1
  GROUP        // multi-user
  PROJECT      // tied to a project
  CHANNEL      // open team channel
  CLIENT       // includes client members
}

enum EmailDirection {
  INBOUND
  OUTBOUND
}

enum CampaignStatus {
  DRAFT
  SCHEDULED
  SENDING
  SENT
  PAUSED
  CANCELED
}

enum WorkflowRunStatus {
  RUNNING
  COMPLETED
  FAILED
  CANCELED
  WAITING
}

enum ActivityTargetType {
  CONTACT
  COMPANY
  DEAL
  PROJECT
  TASK
  PROPOSAL
  CONTRACT
  INVOICE
  PAYMENT
  FORM
  FORM_SUBMISSION
  BOOKING
  FILE
  CHANNEL
  WIKI_PAGE
  WORKFLOW
  WORKSPACE
  USER
}
```

---

## 20. RLS Policy Reference

For every multi-tenant table, the Supabase RLS policy follows this template:

```sql
-- enable RLS
alter table "Contact" enable row level security;

-- members can read rows in their workspaces
create policy "members read contacts"
on "Contact" for select
using (
  "workspaceId" in (
    select "workspaceId" from "Membership"
    where "userId" = auth.uid()
  )
);

-- members can write
create policy "members write contacts"
on "Contact" for insert
with check (
  "workspaceId" in (
    select "workspaceId" from "Membership"
    where "userId" = auth.uid()
      and "role" in ('OWNER','ADMIN','MEMBER','CUSTOM')
  )
);
```

Apply equivalents for `update` and `delete`. Application code is the primary gate; RLS is the safety net.

---

## 21. Migration & Seeding

- Every schema change ships as a migration via `prisma migrate dev`.
- Squash migrations only at major releases.
- Seed file (`prisma/seed.ts`) creates: 1 demo workspace, 1 owner user, 5 contacts, 2 companies, 1 pipeline with 5 stages, 3 deals, 2 projects with tasks, 1 proposal, 1 invoice, 1 form, 1 scheduler.
- Run `pnpm db:seed` in dev. Never on prod.

---

## 22. Indexing Strategy

Postgres-specific indexes to add via migration (not in Prisma schema):

```sql
-- pg_trgm for fuzzy contact search
create extension if not exists pg_trgm;
create index contact_name_trgm on "Contact" using gin (
  (coalesce("firstName",'') || ' ' || coalesce("lastName",'') || ' ' || coalesce("email",'')) gin_trgm_ops
);

-- pgvector
create extension if not exists vector;
create index ai_memory_embedding on "AiMemory" using ivfflat (embedding vector_cosine_ops) with (lists = 100);
create index search_document_embedding on "SearchDocument" using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- Activity timeline lookup is hot
create index activity_workspace_target_created on "Activity" ("workspaceId", "targetType", "targetId", "createdAt" desc);

-- Public slug lookups
create index proposal_public_slug on "Proposal" ("publicSlug") where "deletedAt" is null;
create index invoice_public_slug on "Invoice" ("publicSlug") where "deletedAt" is null;
```

---

## 23. Counter Maintenance

Denormalized counters (`taskCount`, `totalRevenue`, `viewCount`, etc.) are updated by:

1. **Inline** in the same transaction for simple increments.
2. **Inngest job** for expensive recomputes (run nightly).
3. **Trigger-based** for rapid-fire counters (postgres triggers on Activity inserts).

Always keep counter logic in service layer, not in components.

---

## 24. Hard rules for changing this schema

1. Never drop a column without a migration that copies data first.
2. Never rename a column in prod without a 3-step migration: add new, dual-write, drop old.
3. Always update this file in the same PR as the schema migration.
4. Always add zod schemas in `packages/shared/` for any new model.
5. Always add Moe tools in `lib/ai/tools/` for any new module's CRUD.
6. Foreign key changes require an Inngest backfill job in the same PR.
