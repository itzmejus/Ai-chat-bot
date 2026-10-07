-- Products (or services, or menu items) a business offers. The assistant can show them
-- as cards in the chat and answer questions about them.
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "category" TEXT,
    "priceMinor" INTEGER,
    "currency" TEXT NOT NULL DEFAULT 'AED',
    "imageUrl" TEXT,
    "imagePath" TEXT,
    "url" TEXT,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "embedding" vector(1536),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- No vector index: a workspace has at most a few hundred products, so the search filters by
-- workspace (this index) and sorts those few rows exactly.
CREATE INDEX "Product_workspaceId_createdAt_idx" ON "Product"("workspaceId", "createdAt");

ALTER TABLE "Product" ADD CONSTRAINT "Product_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Products shown as cards under an assistant message.
ALTER TABLE "Message" ADD COLUMN "productIds" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- The product the customer is currently asking about (they opened it in the widget).
ALTER TABLE "Conversation" ADD COLUMN "focusProductId" TEXT;

-- What a lead was interested in: the product's name at the time, kept even if the product is later deleted.
ALTER TABLE "Lead" ADD COLUMN "interest" TEXT;
