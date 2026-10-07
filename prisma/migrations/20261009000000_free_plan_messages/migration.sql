-- The Free plan now includes 30 AI messages a month (was 200). Pages and seats are unchanged.
UPDATE "Plan" SET "monthlyMessages" = 30 WHERE "id" = 'free';
