# Mosaed

AI customer support platform for businesses in the UAE. A business signs up, adds its
information, embeds a chat widget on its website, and an AI assistant answers customers
using only that business's information. Multi-tenant: every business is a workspace.

> Build status: **phase 3 of 8** (setup, auth, workspaces, knowledge base ingestion, AI answering).
> This README grows with each phase; the full setup, widget and deployment guides land in phase 8.

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind + shadcn/ui · PostgreSQL + pgvector (Supabase) ·
Prisma 7 · Auth.js · next-intl (English / Arabic with RTL) · Zod · Vitest ·
OpenAI (embeddings) · pg-boss (background jobs in Postgres)

## Run locally

Requires Node.js 22.12+ and a Postgres database with the `vector` extension (a free Supabase project works).

```bash
npm install
cp .env.example .env        # then fill in DATABASE_URL, DIRECT_URL, NEXTAUTH_SECRET, OPENAI_API_KEY
npm run db:migrate          # creates the tables, the pgvector index and the plans
npm run dev                 # http://localhost:3000
```

### Supabase connection strings

In the Supabase dashboard open **Connect** and copy both pooler strings:

| Variable       | Supabase string                 | Used for                      |
| -------------- | ------------------------------- | ----------------------------- |
| `DATABASE_URL` | Transaction pooler (port 6543)  | the running app               |
| `DIRECT_URL`   | Session pooler (port 5432)      | migrations, realtime (later)  |

### Docker alternative

`docker compose up --build` starts Postgres with pgvector and the app together.

## Scripts

| Command              | What it does                                   |
| -------------------- | ---------------------------------------------- |
| `npm run dev`        | Start the dev server                           |
| `npm run build`      | Generate the Prisma client and build           |
| `npm test`           | Run the test suite (in-memory Postgres, no setup needed) |
| `npm run typecheck`  | TypeScript check                               |
| `npm run lint`       | ESLint                                         |
| `npm run db:migrate` | Apply migrations to the database in `.env`     |
| `npm run worker`     | Standalone background worker (optional, see below) |

## Project layout

```
prisma/                 schema + SQL migrations
src/app/                routes: (auth) login & signup, onboarding, dashboard, api/auth
src/auth.ts             Auth.js config (email/password + optional Google)
src/server/db/          prisma.ts (unscoped client), tenant.ts (workspace-scoped client)
src/server/auth/        session helpers: requireUser, requireWorkspace, requireOwner
src/server/actions/     server actions (forms)
src/server/knowledge.ts knowledge base operations (add, re-sync, delete, plan limit)
src/server/ingest/      crawler, safe fetcher, file parsers, chunker, processSource
src/server/ai/          OpenAI client, prompt, and the answering service (answer.ts)
src/server/limits/      monthly usage counter and rate limiter
src/server/realtime/    Server-Sent Events helper
src/server/jobs/        pg-boss queue and ingestion worker
worker/                 standalone worker entry point
src/lib/validation.ts   Zod schemas
src/i18n/               next-intl config and en/ar translation files
tests/                  Vitest suites
```

## Multi-tenancy

Every workspace-owned table has a `workspaceId`. Application code never queries those tables
with the raw Prisma client; it uses `tenantDb(workspaceId)` (`src/server/db/tenant.ts`), which
forces the workspace filter onto every read and write. `requireWorkspace()` verifies the
user's membership on each request and returns a client already locked to that workspace.
`tests/isolation.test.ts` proves one workspace cannot read or change another's data.

## Knowledge base ingestion

Sources (website, PDF/DOCX/TXT, FAQ, business notes) are added from **Dashboard > Knowledge base**.
Each one is queued as a background job that extracts text, splits it into overlapping chunks of
roughly 600 tokens (800 max), embeds them with `text-embedding-3-small` and stores them in pgvector.
The page shows each source as processing, ready or failed, with re-sync and delete.

- **Website crawl:** same domain only, up to 50 pages (or what the plan has left), obeys robots.txt.
  All requests go through `safe-fetch.ts`, which refuses private and internal addresses.
- **Files:** text is extracted at upload (10 MB max) and the file itself is discarded.
- **Worker:** by default the worker runs inside the web server process, so one service is enough.
  To run it separately, set `WORKER_MODE=external` on the web service and start `npm run worker`.
- pg-boss keeps its tables in a `pgboss` schema that it creates on first start.

## AI answering

`answerMessage()` in `src/server/ai/answer.ts` is the single entry point for every channel
(the dashboard test chat today; the web widget, WhatsApp and Instagram later). For each customer
message it:

1. stores the message, and stays silent if an agent has taken the conversation over
2. checks the plan's monthly message limit (when reached, replies with the business's contact details instead of calling the model)
3. embeds the question and retrieves the closest chunks for **that workspace only** (`searchChunks`)
4. streams the model's reply, built from the rules in `src/server/ai/prompt.ts`
5. saves the reply with a confidence score, flags the conversation "needs human" when the
   knowledge base had no answer or the customer asked for a person, and records any contact details as a lead

The model begins each reply with a hidden one-line JSON header (`answered`, `wants_human`, `name`,
`phone`, `email`) that the server strips before streaming. That is where the confidence signal and
lead details come from, without a second model call.

Prompt-injection defence: retrieved text is wrapped in a `<knowledge>` block, declared to be data
rather than instructions, and stripped of anything that could close that block.

The chat model is set by `OPENAI_MODEL` (default `gpt-4.1-mini`). **Dashboard > Knowledge base**
has the assistant settings (name, greeting, tone, extra instructions) and a "Test your assistant"
chat that shows the confidence and sources for each reply.

## Database changes

The `Chunk.embedding` column and its HNSW index are pgvector types Prisma cannot fully model,
so migrations are written as SQL files under `prisma/migrations` and applied with
`npm run db:migrate`. To draft one after editing `schema.prisma`:

```bash
npx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script
```
