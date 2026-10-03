-- Team phone numbers that get a WhatsApp alert when a customer needs a person.
ALTER TABLE "NotificationSettings" ADD COLUMN "whatsappNumbers" TEXT[] DEFAULT ARRAY[]::TEXT[];
