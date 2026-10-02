-- Record which team member wrote an agent message (human takeover in the inbox).
ALTER TABLE "Message" ADD COLUMN "authorId" TEXT;

ALTER TABLE "Message" ADD CONSTRAINT "Message_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
