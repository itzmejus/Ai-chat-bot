-- A compact (256-dimension) embedding of each customer question, so similar questions can be
-- grouped for the "most asked" and "unanswered questions" lists. No index: it is only read
-- for a few hundred recent rows of one workspace at a time.
ALTER TABLE "Message" ADD COLUMN "questionEmbedding" vector(256);
