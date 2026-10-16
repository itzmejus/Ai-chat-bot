-- Four plans: Free (€0), Starter (€19), Growth (€49) and Pro (€149).
--
-- The old Starter plan (2,000 messages, 3 seats) becomes Growth with the same limits, and
-- every workspace on it moves across, so nobody loses anything. "starter" is then reused for
-- the new, smaller €19 plan.
INSERT INTO "Plan" ("id", "name", "monthlyMessages", "maxKnowledgePages", "maxAgents") VALUES
  ('growth', 'Growth', 2000, 200, 3)
ON CONFLICT ("id") DO NOTHING;

UPDATE "Workspace" SET "planId" = 'growth' WHERE "planId" = 'starter';

UPDATE "Plan" SET "name" = 'Starter', "monthlyMessages" = 500, "maxKnowledgePages" = 50, "maxAgents" = 1 WHERE "id" = 'starter';

-- Free keeps 30 messages and one seat; knowledge pages go from 25 to 10. A free workspace that
-- already has more keeps them, but cannot add new ones, and a re-read of its site stops at 10.
UPDATE "Plan" SET "maxKnowledgePages" = 10 WHERE "id" = 'free';

-- Pro's limits are unchanged; only its price (shown on the site, not stored) moves to €149.
