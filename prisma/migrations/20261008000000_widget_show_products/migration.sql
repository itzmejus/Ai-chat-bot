-- Show a few products under the greeting when the chat opens, before the customer asks anything.
ALTER TABLE "WidgetSettings" ADD COLUMN "showProducts" BOOLEAN NOT NULL DEFAULT true;
