-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('OWNER', 'ADMIN', 'MEMBER', 'CONTRACTOR', 'CLIENT', 'CUSTOM');

-- CreateEnum
CREATE TYPE "DomainType" AS ENUM ('APP', 'PORTAL', 'EMAIL');

-- CreateEnum
CREATE TYPE "LifecycleStage" AS ENUM ('SUBSCRIBER', 'LEAD', 'MQL', 'SQL', 'OPPORTUNITY', 'CUSTOMER', 'EVANGELIST', 'OTHER');

-- CreateEnum
CREATE TYPE "TagScope" AS ENUM ('CONTACT', 'COMPANY', 'DEAL', 'PROJECT', 'TASK', 'FILE');

-- CreateEnum
CREATE TYPE "DealStatus" AS ENUM ('OPEN', 'WON', 'LOST');

-- CreateEnum
CREATE TYPE "CustomFieldEntity" AS ENUM ('CONTACT', 'COMPANY', 'DEAL', 'PROJECT', 'TASK', 'INVOICE', 'PROPOSAL');

-- CreateEnum
CREATE TYPE "CustomFieldType" AS ENUM ('TEXT', 'TEXTAREA', 'NUMBER', 'CURRENCY', 'DATE', 'DATETIME', 'BOOLEAN', 'SELECT', 'MULTI_SELECT', 'EMAIL', 'PHONE', 'URL', 'ADDRESS', 'USER', 'CONTACT', 'FILE');

-- CreateEnum
CREATE TYPE "ActivityTargetType" AS ENUM ('CONTACT', 'COMPANY', 'DEAL', 'PROJECT', 'TASK', 'PROPOSAL', 'CONTRACT', 'INVOICE', 'PAYMENT', 'FORM', 'FORM_SUBMISSION', 'BOOKING', 'FILE', 'CHANNEL', 'WIKI_PAGE', 'WORKFLOW', 'WORKSPACE', 'USER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "avatarUrl" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "locale" TEXT NOT NULL DEFAULT 'en',
    "defaultWorkspaceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Workspace" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "logoUrl" TEXT,
    "faviconUrl" TEXT,
    "brandPrimary" TEXT NOT NULL DEFAULT '#7c3aed',
    "brandAccent" TEXT NOT NULL DEFAULT '#10b981',
    "hideBranding" BOOLEAN NOT NULL DEFAULT false,
    "customCss" TEXT,
    "defaultCurrency" TEXT NOT NULL DEFAULT 'USD',
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "locale" TEXT NOT NULL DEFAULT 'en',
    "weekStart" INTEGER NOT NULL DEFAULT 1,
    "dateFormat" TEXT NOT NULL DEFAULT 'yyyy-MM-dd',
    "fromEmail" TEXT,
    "fromName" TEXT,
    "emailDomainVerified" BOOLEAN NOT NULL DEFAULT false,
    "planId" TEXT NOT NULL DEFAULT 'free',
    "trialEndsAt" TIMESTAMP(3),
    "subscriptionId" TEXT,
    "aiCreditsUsed" INTEGER NOT NULL DEFAULT 0,
    "aiCreditsLimit" INTEGER NOT NULL DEFAULT 50,
    "storageUsedMb" INTEGER NOT NULL DEFAULT 0,
    "storageLimitMb" INTEGER NOT NULL DEFAULT 500,
    "settings" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkspaceDomain" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "hostname" TEXT NOT NULL,
    "type" "DomainType" NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "sslIssued" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkspaceDomain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Membership" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "customRoleId" TEXT,
    "notificationsEmail" BOOLEAN NOT NULL DEFAULT true,
    "notificationsPush" BOOLEAN NOT NULL DEFAULT true,
    "cost" DECIMAL(12,2),
    "bill" DECIMAL(12,2),
    "scopedProjectIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "contactId" TEXT,
    "inviteToken" TEXT,
    "inviteEmail" TEXT,
    "inviteExpiresAt" TIMESTAMP(3),
    "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" TIMESTAMP(3),

    CONSTRAINT "Membership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomRole" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "permissions" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiKey" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "prefix" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "scopes" TEXT[],
    "lastUsedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "alternateEmails" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "alternatePhones" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "jobTitle" TEXT,
    "companyId" TEXT,
    "avatarUrl" TEXT,
    "websiteUrl" TEXT,
    "linkedinUrl" TEXT,
    "twitterUrl" TEXT,
    "addressLine1" TEXT,
    "addressLine2" TEXT,
    "city" TEXT,
    "region" TEXT,
    "postalCode" TEXT,
    "country" TEXT,
    "ownerId" TEXT,
    "source" TEXT,
    "lifecycleStage" "LifecycleStage" NOT NULL DEFAULT 'LEAD',
    "leadScore" INTEGER NOT NULL DEFAULT 0,
    "doNotEmail" BOOLEAN NOT NULL DEFAULT false,
    "doNotCall" BOOLEAN NOT NULL DEFAULT false,
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "totalRevenue" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "openDealsValue" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "lastContactedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "domain" TEXT,
    "industry" TEXT,
    "size" TEXT,
    "description" TEXT,
    "websiteUrl" TEXT,
    "linkedinUrl" TEXT,
    "logoUrl" TEXT,
    "addressLine1" TEXT,
    "city" TEXT,
    "region" TEXT,
    "postalCode" TEXT,
    "country" TEXT,
    "ownerId" TEXT,
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "totalRevenue" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#7c3aed',
    "scope" "TagScope" NOT NULL DEFAULT 'CONTACT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactTag" (
    "contactId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactTag_pkey" PRIMARY KEY ("contactId","tagId")
);

-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "targetType" "ActivityTargetType" NOT NULL,
    "targetId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "bodyJson" JSONB,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "contactId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomFieldDef" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "entity" "CustomFieldEntity" NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" "CustomFieldType" NOT NULL,
    "options" JSONB,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "defaultValue" JSONB,
    "position" INTEGER NOT NULL DEFAULT 0,
    "showInList" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomFieldDef_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pipeline" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pipeline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PipelineStage" (
    "id" TEXT NOT NULL,
    "pipelineId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "probability" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "color" TEXT NOT NULL DEFAULT '#94a3b8',
    "rotInDays" INTEGER,
    "isWon" BOOLEAN NOT NULL DEFAULT false,
    "isLost" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PipelineStage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deal" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "pipelineId" TEXT NOT NULL,
    "stageId" TEXT NOT NULL,
    "contactId" TEXT,
    "companyId" TEXT,
    "ownerId" TEXT,
    "title" TEXT NOT NULL,
    "value" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "expectedCloseDate" TIMESTAMP(3),
    "status" "DealStatus" NOT NULL DEFAULT 'OPEN',
    "lostReason" TEXT,
    "source" TEXT,
    "description" TEXT,
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Deal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedView" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "filters" JSONB NOT NULL DEFAULT '{}',
    "sort" TEXT,
    "columns" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isShared" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SavedView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "actorId" TEXT,
    "actorType" TEXT NOT NULL DEFAULT 'user',
    "verb" TEXT NOT NULL,
    "targetType" "ActivityTargetType" NOT NULL,
    "targetId" TEXT NOT NULL,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "resourceId" TEXT,
    "ip" TEXT,
    "userAgent" TEXT,
    "diff" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "link" TEXT,
    "sourceType" "ActivityTargetType",
    "sourceId" TEXT,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkUserId_key" ON "User"("clerkUserId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_clerkUserId_idx" ON "User"("clerkUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Workspace_slug_key" ON "Workspace"("slug");

-- CreateIndex
CREATE INDEX "Workspace_slug_idx" ON "Workspace"("slug");

-- CreateIndex
CREATE INDEX "Workspace_ownerId_idx" ON "Workspace"("ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceDomain_hostname_key" ON "WorkspaceDomain"("hostname");

-- CreateIndex
CREATE INDEX "WorkspaceDomain_workspaceId_idx" ON "WorkspaceDomain"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "Membership_inviteToken_key" ON "Membership"("inviteToken");

-- CreateIndex
CREATE INDEX "Membership_workspaceId_role_idx" ON "Membership"("workspaceId", "role");

-- CreateIndex
CREATE UNIQUE INDEX "Membership_userId_workspaceId_key" ON "Membership"("userId", "workspaceId");

-- CreateIndex
CREATE INDEX "CustomRole_workspaceId_idx" ON "CustomRole"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_hash_key" ON "ApiKey"("hash");

-- CreateIndex
CREATE INDEX "ApiKey_workspaceId_idx" ON "ApiKey"("workspaceId");

-- CreateIndex
CREATE INDEX "ApiKey_hash_idx" ON "ApiKey"("hash");

-- CreateIndex
CREATE INDEX "Contact_workspaceId_idx" ON "Contact"("workspaceId");

-- CreateIndex
CREATE INDEX "Contact_workspaceId_email_idx" ON "Contact"("workspaceId", "email");

-- CreateIndex
CREATE INDEX "Contact_workspaceId_ownerId_idx" ON "Contact"("workspaceId", "ownerId");

-- CreateIndex
CREATE INDEX "Contact_workspaceId_companyId_idx" ON "Contact"("workspaceId", "companyId");

-- CreateIndex
CREATE INDEX "Contact_workspaceId_lifecycleStage_idx" ON "Contact"("workspaceId", "lifecycleStage");

-- CreateIndex
CREATE INDEX "Company_workspaceId_idx" ON "Company"("workspaceId");

-- CreateIndex
CREATE INDEX "Company_workspaceId_name_idx" ON "Company"("workspaceId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Company_workspaceId_domain_key" ON "Company"("workspaceId", "domain");

-- CreateIndex
CREATE INDEX "Tag_workspaceId_idx" ON "Tag"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_workspaceId_name_scope_key" ON "Tag"("workspaceId", "name", "scope");

-- CreateIndex
CREATE INDEX "Note_workspaceId_targetType_targetId_idx" ON "Note"("workspaceId", "targetType", "targetId");

-- CreateIndex
CREATE INDEX "Note_workspaceId_authorId_idx" ON "Note"("workspaceId", "authorId");

-- CreateIndex
CREATE INDEX "CustomFieldDef_workspaceId_entity_idx" ON "CustomFieldDef"("workspaceId", "entity");

-- CreateIndex
CREATE UNIQUE INDEX "CustomFieldDef_workspaceId_entity_key_key" ON "CustomFieldDef"("workspaceId", "entity", "key");

-- CreateIndex
CREATE INDEX "Pipeline_workspaceId_idx" ON "Pipeline"("workspaceId");

-- CreateIndex
CREATE INDEX "PipelineStage_pipelineId_idx" ON "PipelineStage"("pipelineId");

-- CreateIndex
CREATE INDEX "Deal_workspaceId_status_idx" ON "Deal"("workspaceId", "status");

-- CreateIndex
CREATE INDEX "Deal_workspaceId_pipelineId_stageId_idx" ON "Deal"("workspaceId", "pipelineId", "stageId");

-- CreateIndex
CREATE INDEX "Deal_workspaceId_ownerId_idx" ON "Deal"("workspaceId", "ownerId");

-- CreateIndex
CREATE INDEX "SavedView_workspaceId_userId_entity_idx" ON "SavedView"("workspaceId", "userId", "entity");

-- CreateIndex
CREATE INDEX "Activity_workspaceId_targetType_targetId_createdAt_idx" ON "Activity"("workspaceId", "targetType", "targetId", "createdAt");

-- CreateIndex
CREATE INDEX "Activity_workspaceId_actorId_createdAt_idx" ON "Activity"("workspaceId", "actorId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_workspaceId_createdAt_idx" ON "AuditLog"("workspaceId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_workspaceId_action_createdAt_idx" ON "AuditLog"("workspaceId", "action", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_userId_readAt_idx" ON "Notification"("userId", "readAt");

-- AddForeignKey
ALTER TABLE "Workspace" ADD CONSTRAINT "Workspace_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceDomain" ADD CONSTRAINT "WorkspaceDomain_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_customRoleId_fkey" FOREIGN KEY ("customRoleId") REFERENCES "CustomRole"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomRole" ADD CONSTRAINT "CustomRole_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactTag" ADD CONSTRAINT "ContactTag_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactTag" ADD CONSTRAINT "ContactTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomFieldDef" ADD CONSTRAINT "CustomFieldDef_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pipeline" ADD CONSTRAINT "Pipeline_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PipelineStage" ADD CONSTRAINT "PipelineStage_pipelineId_fkey" FOREIGN KEY ("pipelineId") REFERENCES "Pipeline"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deal" ADD CONSTRAINT "Deal_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deal" ADD CONSTRAINT "Deal_pipelineId_fkey" FOREIGN KEY ("pipelineId") REFERENCES "Pipeline"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deal" ADD CONSTRAINT "Deal_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "PipelineStage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deal" ADD CONSTRAINT "Deal_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deal" ADD CONSTRAINT "Deal_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedView" ADD CONSTRAINT "SavedView_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedView" ADD CONSTRAINT "SavedView_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
