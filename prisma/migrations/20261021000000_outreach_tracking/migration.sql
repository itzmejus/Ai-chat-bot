-- Outreach email tracking: clicks on the email's links (counted by /go) and where a new user came from.
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "signupSource" TEXT;

-- CreateTable
CREATE TABLE "OutreachClick" (
    "id" TEXT NOT NULL,
    "business" TEXT NOT NULL,
    "button" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OutreachClick_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OutreachClick_createdAt_idx" ON "OutreachClick"("createdAt");

-- CreateIndex
CREATE INDEX "OutreachClick_business_idx" ON "OutreachClick"("business");

