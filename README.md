# Mosaed

AI customer support platform for businesses in the UAE. A business signs up, adds its
information, embeds a chat widget on its website, and an AI assistant answers customers
using only that business's information. Multi-tenant: every business is a workspace.

> Build status: **phase 6 of 8** (setup, auth, workspaces, knowledge base, AI answering, widget, inbox and takeover, leads and analytics).
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
| `npm run build`      | Generate the Prisma client, build the widget bundles and the app |
| `npm run build:widget` | Rebuild `public/widget.js` and `public/widget-app.js` from `/widget` |
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
src/server/realtime/    event bus (in-process + Postgres NOTIFY) and Server-Sent Events helper
src/server/inbox.ts     inbox list, takeover, agent replies, close and reopen
src/server/leads.ts     leads list, status, CSV export
src/server/analytics.ts overview numbers, daily counts, question grouping
src/server/widget/      widget tokens and public chat helpers
src/lib/widget-domains.ts  domain whitelist rules
src/proxy.ts            keeps the app host and the widget host to their own paths
widget/                 the embeddable widget (loader + chat app), built with esbuild
examples/               sample page for trying the widget
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

## Chat widget

A business adds the widget to its site with one line, shown in **Dashboard > Widget**:

```html
<script src="https://chat.siteselo.com/widget.js" data-workspace="pk_..." async></script>
```

How it is put together:

- `widget/loader.ts` builds to `public/widget.js` (about 0.7 kB gzipped). It adds one iframe to the
  host page and resizes it when the chat opens or closes (full screen on phones).
- `widget/app.ts` builds to `public/widget-app.js` (about 6 kB gzipped): the chat itself, in plain
  TypeScript with no framework. Because it runs inside the iframe, the host site's CSS cannot
  affect it. It streams replies, switches to Arabic and right-to-left when the customer writes
  Arabic, offers "Talk to a human", shows the optional pre-chat form, and remembers the
  conversation for the browser session (an anonymous visitor id in `sessionStorage`).
- `/embed/[key]` serves the iframe page. `/api/widget/*` is the public chat API
  (`session`, `start`, `message`, `human`), which calls the same `answerMessage()` service.

**Domain whitelist.** The widget only works on the websites listed under Allowed websites:

1. the iframe page is sent with `Content-Security-Policy: frame-ancestors <allowed sites>`, so
   browsers refuse to display it anywhere else;
2. the server refuses the iframe page when the embedding site is not on the list, when no site
   is listed, or when the URL is opened directly;
3. the chat API requires a signed token that is only issued by a successfully loaded iframe page.

A script that fakes browser headers can still obtain a token; rate limits and the plan's monthly
message limit cap what that can cost.

**Rate limits** (per minute): 12 messages per visitor, 40 per IP address, 300 per workspace.
Login is limited to 8 attempts per account per 15 minutes.

**Two hostnames.** In production the dashboard runs on `APP_URL` (`https://app.siteselo.com`) and
the widget on `WIDGET_URL` (`https://chat.siteselo.com`). Both point at the same deployment;
`src/proxy.ts` makes each hostname serve only its own paths. Locally both default to
`http://localhost:3000`.

**Try it locally:** follow the steps at the top of `examples/test-page.html`.

## Inbox, realtime and human takeover

**Dashboard > Inbox** lists every customer conversation (dashboard test chats are excluded) with
filters (all, needs human, AI handled, closed), search by name, phone or message text, and unread
markers. Opening a conversation marks it read.

- **Take over** pauses the AI for that conversation: the agent's replies are delivered to the
  customer's widget immediately, and the customer's messages go only to the agent.
- **Return to AI** hands it back; **Close** ends the chat (the customer's next message starts a new one).
- Timeline markers such as "Sara joined the chat" are stored as codes (`src/lib/system-events.ts`)
  and translated where they are shown. The customer sees that a team member joined, not their name.

**How realtime works.** Code that changes a conversation calls `publish()` in
`src/server/realtime/bus.ts`. The event (ids only, never message text) is delivered to subscribers
in the same process and, through Postgres `NOTIFY`, to other server instances, which listen on a
dedicated connection (`DIRECT_URL`). Two Server-Sent Events endpoints forward events to browsers:

| Endpoint | For | Sends |
| --- | --- | --- |
| `GET /api/inbox/stream` | dashboard (login cookie) | "something changed in conversation X"; the page re-fetches |
| `GET /api/widget/stream` | customer widget (widget token + visitor id) | agent replies and takeover events for that one conversation |

Each subscriber loads message content through its own workspace-scoped database client.

## Leads and overview analytics

**Leads** (`/dashboard/leads`) lists contact details captured by the assistant during a chat or by
the pre-chat form: name, phone, email, date, status (new, contacted, converted) and a link to the
conversation. It has status tabs, search and a CSV export (`GET /api/leads/export`). The export
starts with a UTF-8 marker so Excel shows Arabic correctly, and defuses cells that a spreadsheet
would run as formulas, because names are typed by anonymous visitors.

**Overview** (`/dashboard`) shows total conversations, today's (UAE time), leads and needs-human
counts; conversations per day for the last 14 days; a breakdown by status; and two lists built
from the last 30 days of customer messages:

- **Most asked questions**: similar questions grouped together.
- **Unanswered questions**: questions the assistant could not answer from the knowledge base,
  each with an "Add answer" button that opens the FAQ form with the question filled in.

Grouping works on a compact (256-dimension) embedding stored with each customer message
(`src/server/analytics.ts`). Messages containing a phone number or email are left out of both lists.
The charts are plain HTML and CSS (`src/components/overview/charts.tsx`), with a hover tooltip and
a screen-reader table for the daily chart.

## Database changes

The `Chunk.embedding` column and its HNSW index are pgvector types Prisma cannot fully model,
so migrations are written as SQL files under `prisma/migrations` and applied with
`npm run db:migrate`. To draft one after editing `schema.prisma`:

```bash
npx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script
```
