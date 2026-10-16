-- Account security: email verification, password reset and signing out other devices.

-- When the person proved they own the email address (verification link, password reset,
-- accepted invitation or Google login). Accounts created before this change are trusted
-- as they are, so nobody is asked to verify retroactively.
ALTER TABLE "User" ADD COLUMN "emailVerifiedAt" TIMESTAMP(3);
UPDATE "User" SET "emailVerifiedAt" = "createdAt";

-- Raised when the password changes. Sessions carry the version they were issued with and
-- stop working once it no longer matches, which signs the account out everywhere else.
ALTER TABLE "User" ADD COLUMN "sessionVersion" INTEGER NOT NULL DEFAULT 0;

-- One-time links sent by email. Only a SHA-256 hash of the token is stored.
CREATE TYPE "AuthTokenKind" AS ENUM ('verify_email', 'reset_password');

CREATE TABLE "AuthToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" "AuthTokenKind" NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuthToken_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AuthToken_tokenHash_key" ON "AuthToken"("tokenHash");
CREATE INDEX "AuthToken_userId_kind_idx" ON "AuthToken"("userId", "kind");

ALTER TABLE "AuthToken" ADD CONSTRAINT "AuthToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
