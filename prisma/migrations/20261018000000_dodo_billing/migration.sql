-- Paid plans through Dodo Payments: the workspace remembers its Dodo customer and subscription,
-- kept in sync by the billing webhook.
ALTER TABLE "Workspace" ADD COLUMN "dodoCustomerId" TEXT;
ALTER TABLE "Workspace" ADD COLUMN "dodoSubscriptionId" TEXT;
ALTER TABLE "Workspace" ADD COLUMN "billingStatus" TEXT;
ALTER TABLE "Workspace" ADD COLUMN "billingPeriodEnd" TIMESTAMP(3);
ALTER TABLE "Workspace" ADD COLUMN "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Workspace" ADD COLUMN "billingEventAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "Workspace_dodoSubscriptionId_key" ON "Workspace"("dodoSubscriptionId");
