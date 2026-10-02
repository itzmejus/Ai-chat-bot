# Mosaed

AI customer support platform for businesses in the UAE. A business signs up, adds its
information, embeds a chat widget on its website, and an AI assistant answers customers
using only that business's information. Multi-tenant: every business is a workspace.

## Contents

- [Run locally](#run-locally)
- [Demo data](#demo-data)
- [Embed the widget and try it on a sample page](#embed-the-widget-and-try-it-on-a-sample-page)
- [Environment variables](#environment-variables)
- [Scripts](#scripts) and [tests](#tests)
- [Deploy](#deploy) (full guide: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md))
- How it works: [multi-tenancy](#multi-tenancy), [knowledge base](#knowledge-base-ingestion), [AI answering](#ai-answering), [widget](#chat-widget), [inbox](#inbox-realtime-and-human-takeover), [leads and analytics](#leads-and-overview-analytics), [team and plans](#team-notifications-settings-and-plans)
- [Recommended next features](#recommended-next-features)

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind + shadcn/ui · PostgreSQL + pgvector (Supabase) ·
Prisma 7 · Auth.js (email and password, optional Google) · next-intl (English / Arabic with RTL) ·
Zod · Vitest · OpenAI (chat and embeddings) · pg-boss (background jobs in Postgres) · Server-Sent Events

## Run locally

You need Node.js 22.12 or newer, a Postgres database with the `vector` extension (a free
Supabase project works) and an OpenAI API key.

```bash
npm install
cp .env.example .env        # then fill in DATABASE_URL, DIRECT_URL, NEXTAUTH_SECRET, OPENAI_API_KEY
npm run db:migrate          # creates the tables, the pgvector index and the three plans
npm run db:seed             # optional: demo dental clinic (prints its login)
npm run dev                 # http://localhost:3000
```

Then sign up at http://localhost:3000/signup, or log in with the demo account the seed printed.

After a new migration or any change to `prisma/schema.prisma`, restart `npm run dev`: a running
dev server keeps the old database client.

### Supabase connection strings

In the Supabase dashboard open **Connect** and copy both pooler strings:

| Variable       | Supabase string                 | Used for                        |
| -------------- | ------------------------------- | ------------------------------- |
| `DATABASE_URL` | Transaction pooler (port 6543)  | the running app                 |
| `DIRECT_URL`   | Session pooler (port 5432)      | migrations, job queue, realtime |

### Docker alternative

`docker compose up --build` starts Postgres with pgvector and the app together on
http://localhost:3000. It reads the rest of the settings from `.env`.

## Demo data

`npm run db:seed` creates **Bright Smile Dental Clinic**, a dental clinic in Dubai:

- an owner account, `demo@brightsmile.example`. The password is printed at the end; set
  `SEED_PASSWORD` to choose it;
- 18 FAQs (9 English, 9 Arabic) and business notes, embedded and ready to answer from;
- 11 past conversations in English and Arabic covering every inbox status, and 3 leads, so the
  overview, inbox and leads pages have something to show;
- the widget allowed on `localhost`, with a fixed widget key so the sample page below works as is.

It needs `OPENAI_API_KEY` to embed the knowledge base (well under one US cent). Without the key
the sources are stored as failed and can be processed later with **Re-sync**. Running it again
replaces the demo workspace; no other workspace is touched. The data lives in `prisma/demo.ts`.

The seed is meant for local development and demos. On a live database it creates a real,
loggable account, so choose a strong `SEED_PASSWORD` or do not run it there.

## Embed the widget and try it on a sample page

Every workspace has one line of embed code, shown in **Dashboard > Widget**:

```html
<script src="https://chat.siteselo.com/widget.js" data-workspace="pk_..." async></script>
```

Paste it before `</body>` on every page of the website. The widget only appears on websites
listed under **Allowed websites** on the same page, so add the site's domain there first.

To try it locally with `examples/test-page.html`, a stand-in for a customer's website:

1. Run `npm run db:seed` and `npm run dev`.
2. In a second terminal: `npx serve examples -l 5500`
3. Open http://localhost:5500/test-page.html and click the chat button in the corner.

The page already contains the demo clinic's embed code. To test your own workspace instead, add
`localhost` under Allowed websites and replace the `<script>` line at the bottom of the file with
your embed code. Opening the file directly (`file://`) does not work: a file has no domain to
check against the whitelist.

## Environment variables

All are documented in `.env.example`. Secrets live only in the environment, never in the code.

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | yes | Postgres connection for the app (Supabase transaction pooler) |
| `DIRECT_URL` | yes | Postgres session connection for migrations, jobs and realtime |
| `NEXTAUTH_SECRET` | yes | signs login sessions and widget tokens |
| `OPENAI_API_KEY` | yes | answers and embeddings |
| `OPENAI_MODEL` | no | chat model, default `gpt-4.1-mini` |
| `APP_URL`, `NEXTAUTH_URL` | in production | public address of the dashboard |
| `WIDGET_URL` | no | separate hostname for the widget; defaults to `APP_URL` |
| `APP_NAME` | no | product name shown everywhere, default "Mosaed" |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | no | enables "Continue with Google" |
| `EMAIL_SERVER_HOST`, `_PORT`, `_USER`, `_PASSWORD`, `EMAIL_FROM` | no | SMTP for invitations and notifications; without it they are written to the server log |
| `WORKER_MODE` | no | `external` when the background worker runs as its own service |
| `ALLOW_FREE_PLAN_CHANGE` | no | `true` lets owners switch plan without paying (demos only) |

## Scripts

| Command              | What it does                                   |
| -------------------- | ---------------------------------------------- |
| `npm run dev`        | Build the widget, then start the dev server    |
| `npm run build`      | Generate the Prisma client, build the widget bundles and the app |
| `npm start`          | Run the production build                       |
| `npm run build:widget` | Rebuild `public/widget.js` and `public/widget-app.js` from `/widget` |
| `npm test`           | Run the test suite (in-memory Postgres, no setup needed) |
| `npm run typecheck`  | TypeScript check                               |
| `npm run lint`       | ESLint                                         |
| `npm run db:migrate` | Apply migrations to the database in `.env`     |
| `npm run db:seed`    | Create or replace the demo workspace           |
| `npm run worker`     | Standalone background worker (optional)        |

## Tests

`npm test` needs no database, no network and no API key: each test file gets its own in-memory
Postgres with pgvector (PGlite) with every migration applied, and OpenAI is mocked.

| File | Covers |
| --- | --- |
| `tests/isolation.test.ts` | one workspace cannot read or change another's data |
| `tests/answer.test.ts` | answering from the workspace's own knowledge only, with OpenAI mocked; usage limits |
| `tests/widget.test.ts` | domain whitelisting, widget tokens, the public chat API |
| `tests/ingest.test.ts` | crawler, blocked internal addresses, chunking |
| `tests/inbox.test.ts` | human takeover, agent replies, realtime events |
| `tests/analytics.test.ts` | overview numbers, question grouping, CSV export |
| `tests/team.test.ts` | invitations, roles, seat limit |
| `tests/seed.test.ts` | the demo seed |

## Deploy

The app is one Docker web service plus a Postgres database. The step-by-step guide for
**Render + Supabase**, including the two hostnames (`app.` for the dashboard, `chat.` for the
widget), email, Google login and a go-live checklist, is in **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)**.

In short: create a Supabase project, create a Render web service from this repository's
`Dockerfile`, set the environment variables above, and add both hostnames as custom domains.
Migrations are applied automatically each time the container starts.

## Project layout

```
prisma/                 schema, SQL migrations, demo seed (seed.ts, demo.ts)
docs/                   deployment guide
src/app/                routes: (auth) login & signup, onboarding, invite, dashboard, embed, api
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
src/server/team.ts      members, roles, invitations
src/server/notifications.ts  lead and needs-human emails
src/server/email/       SMTP mailer and email layout
src/server/billing/     plan changes; placeholder for Stripe
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
(the web widget and the dashboard test chat today; WhatsApp and Instagram later). For each customer
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

**Try it locally:** see [Embed the widget and try it on a sample page](#embed-the-widget-and-try-it-on-a-sample-page).

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

## Team, notifications, settings and plans

**Team** (`/dashboard/team`). Owners invite people by email as an agent or an owner. The invitation
is a link (`/invite/<token>`) valid for 7 days; only the invited email address can accept it, after
signing up or logging in. Pending invitations hold a seat. Owners can change roles and remove
members; a workspace always keeps at least one owner. Agents can use the inbox, leads and
knowledge base; owners can also change settings, the widget and the team.

**Email** (`src/server/email/mailer.ts`) goes out over SMTP using the `EMAIL_SERVER_*` variables.
When no host is set, messages are printed to the server log instead, and the Team page shows the
invitation link to copy. **Notifications** (`src/server/notifications.ts`) email the addresses listed
in Settings when a lead is captured and when a chat starts needing a person (once per chat, not
per message). They are written in Arabic for businesses whose customer language is Arabic.

**Settings** (`/dashboard/settings`): business profile and working hours, notification switches and
recipients, usage against the plan, and the plans.

**Plans and limits.** The `Plan` table holds three limits, all enforced:

| Limit | Where it is enforced |
| --- | --- |
| AI messages per month | `answerMessage()`: at the limit the customer gets the business's contact details instead of an AI reply, and the dashboard shows a banner |
| Knowledge pages | adding a source, and again when a website crawl finishes |
| Team size | inviting a member (members plus pending invitations) |

Payment is not built. `src/server/billing/index.ts` is the placeholder: it documents where Stripe
checkout and the webhook plug in, and `setWorkspacePlan()` is the one function that changes a plan.
Until then, `ALLOW_FREE_PLAN_CHANGE=true` lets owners switch plan from Settings without paying
(development and demos only).

## Database changes

The `Chunk.embedding` column and its HNSW index are pgvector types Prisma cannot fully model,
so migrations are written as SQL files under `prisma/migrations` and applied with
`npm run db:migrate`. To draft one after editing `schema.prisma`:

```bash
npx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script
```

## Adding a channel later (WhatsApp, Instagram)

The data model and the answering service are already channel-neutral, so a new channel is an
adapter, not a rewrite:

- `Conversation.channel` is `web`, `whatsapp` or `instagram`; `visitorId` holds the phone number or handle.
- A webhook route receives the provider's message, finds or creates the conversation for that
  workspace and sender, and calls `answerMessage()`, as `/api/widget/message` does.
- It sends the reply back through the provider's API instead of streaming it.
- Agent replies from the inbox need one hook in `src/server/inbox.ts` to send through the same API.

The inbox, takeover, leads, limits and analytics then apply to that channel without changes.

## Recommended next features

1. **WhatsApp Business integration.** The channel UAE customers use most. Connect through the
   WhatsApp Cloud API as described above; conversations land in the same inbox.
2. **Stripe billing.** Checkout, the customer portal and a webhook that calls `setWorkspacePlan()`
   (`src/server/billing/index.ts` marks the spots), then turn off `ALLOW_FREE_PLAN_CHANGE`.
3. **Appointment booking.** Let the assistant offer real time slots and book them (Google
   Calendar or Calendly first, clinic and salon systems later) instead of only taking a callback request.
4. **Email verification and password reset.** Sign-up accepts an email address without
   confirming it, and there is no "forgot password" flow yet. Do this before opening sign-up to the public.
5. **Instagram and Messenger** through the same channel adapter.
6. **Lead quality.** Normalise UAE phone numbers to one format, merge repeat leads from the same
   person, and push new leads to a CRM or a webhook (Zapier, Make).
7. **Logo upload.** The widget logo is a URL today; add file upload with Supabase Storage.
8. **Monitoring.** Error tracking (Sentry), a health-check endpoint and uptime alerts.
9. **Scheduled re-sync** of website sources, so the knowledge base follows changes to the site.
