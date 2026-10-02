# Deployment guide: Render + Supabase

This guide takes the app from a Git repository to a live service with the dashboard on
`app.siteselo.com` and the chat widget on `chat.siteselo.com`. Replace those names with your own.

What gets deployed:

| Piece | Where | Notes |
| --- | --- | --- |
| Database | Supabase (Postgres with pgvector) | also holds the job queue and rate-limit counters |
| Web service | Render, built from the `Dockerfile` | dashboard, widget, APIs and the background worker in one process |
| AI | OpenAI API | chat model and embeddings |
| Email | any SMTP provider | optional; invitations and notifications |

There is no Redis, no file storage and no separate worker to run.

## 1. Supabase

1. Create a project. Choose the region closest to your Render region; a database far from
   the web service makes every page slower.
2. Open **Connect** and copy two connection strings, putting your database password in each:
   - **Transaction pooler** (port 6543): this is `DATABASE_URL`
   - **Session pooler** (port 5432): this is `DIRECT_URL`
3. Nothing else to set up. The first migration enables the `vector` extension and creates the
   tables, the vector index and the three plans.

If the password contains characters such as `@`, `#` or `/`, URL-encode them in the connection strings.

## 2. Render web service

1. **New > Web Service**, connect the repository.
2. **Language: Docker.** Render finds the `Dockerfile` at the repository root. Leave the build
   and start commands empty; the Dockerfile supplies them.
3. Pick the region nearest your Supabase project.
4. Instance type: at least **Starter**. Free instances sleep after 15 minutes without traffic,
   which stops background jobs and makes the first customer message wait for a cold start.
5. Add the environment variables below, then create the service.

The build needs no secrets. When the container starts it runs `prisma migrate deploy` and then
the server, so new migrations are applied on every deploy.

### Environment variables

| Variable | Value |
| --- | --- |
| `DATABASE_URL` | Supabase transaction pooler string (port 6543) |
| `DIRECT_URL` | Supabase session pooler string (port 5432) |
| `NEXTAUTH_SECRET` | a long random value: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` |
| `OPENAI_API_KEY` | your OpenAI key |
| `OPENAI_MODEL` | `gpt-4.1-mini` (or another chat model) |
| `APP_NAME` | the product name shown in the dashboard and emails |
| `APP_URL` | `https://app.siteselo.com` |
| `NEXTAUTH_URL` | `https://app.siteselo.com` (same as `APP_URL`) |
| `WIDGET_URL` | `https://chat.siteselo.com` |
| `EMAIL_SERVER_HOST`, `EMAIL_SERVER_PORT`, `EMAIL_SERVER_USER`, `EMAIL_SERVER_PASSWORD`, `EMAIL_FROM` | see step 4; optional |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | see step 5; optional |

Leave `ALLOW_FREE_PLAN_CHANGE` and `WORKER_MODE` unset. Do not set `PORT`; Render provides it.
No trailing slash on the URLs.

Changing `NEXTAUTH_SECRET` later logs everyone out and invalidates open widget sessions
(customers get a new session on their next page load).

## 3. Domains

Both hostnames point at the **same** Render service. The app decides what to serve from the hostname.

1. In the Render service open **Settings > Custom Domains** and add both
   `app.siteselo.com` and `chat.siteselo.com`.
2. At your DNS provider create a `CNAME` record for each, pointing to the service's
   `*.onrender.com` address as Render shows.
3. Wait for Render to verify them and issue the certificates.

Use exactly the hostnames you put in `APP_URL` and `WIDGET_URL`. A different spelling such as
`www.app.siteselo.com` is treated as an unknown host: either do not create it, or redirect it to
`app.siteselo.com` at your DNS provider.

How the two hosts behave:

| Host | Serves | Refuses |
| --- | --- | --- |
| `app.` | login, dashboard, dashboard APIs | the chat iframe and public chat API |
| `chat.` | `widget.js`, the chat iframe, the public chat API | everything else (the home page redirects to `app.`) |

Keeping the widget on its own hostname means dashboard login cookies are never sent along with
requests made from customers' websites.

To run on a single hostname instead, leave `WIDGET_URL` unset.

## 4. Email (optional but recommended)

Without SMTP settings, invitations show a link for the owner to copy and notifications are only
written to the server log. Any SMTP provider works (Resend, Brevo, Amazon SES, Postmark, Zoho):

| Variable | Example |
| --- | --- |
| `EMAIL_SERVER_HOST` | `smtp.resend.com` |
| `EMAIL_SERVER_PORT` | `587` (STARTTLS) or `465` (TLS) |
| `EMAIL_SERVER_USER` | the provider's SMTP username |
| `EMAIL_SERVER_PASSWORD` | the provider's SMTP password or API key |
| `EMAIL_FROM` | `Your Product <no-reply@siteselo.com>` |

Verify the sending domain with the provider (SPF and DKIM records), or messages will land in spam.

## 5. Google login (optional)

1. In Google Cloud Console create an **OAuth client ID** of type *Web application*.
2. Authorised JavaScript origin: `https://app.siteselo.com`
3. Authorised redirect URI: `https://app.siteselo.com/api/auth/callback/google`
4. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` on Render.

The "Continue with Google" button appears only when both are set.

## 6. Check the deployment

1. Open `https://app.siteselo.com`, sign up and complete onboarding.
2. **Knowledge base:** add an FAQ. It should change from *Processing* to *Ready* within seconds.
   That confirms the database, the background worker and the OpenAI key.
3. **Test your assistant** on the same page: ask the FAQ's question.
4. **Widget:** add your website's domain under Allowed websites, copy the embed code, and paste it
   before `</body>` on the site. The live preview on the Widget page should show the chat.
5. Send a message from the website. It should appear in **Inbox** without reloading the page.
6. **Team:** invite a second address and confirm the email arrives (if SMTP is set).

## Updating

Push to the branch Render deploys. Render rebuilds the image, and the new container applies any
new migrations before it starts. Migrations are plain SQL files in `prisma/migrations`; write
them so the previous version of the app keeps working while the new one starts (add columns
before using them, remove them one release later).

Back up before risky changes: Supabase takes daily backups on paid plans; on the free plan
export with `pg_dump` using `DIRECT_URL`.

## Running more than one instance

One instance is enough to start with. If you scale out on Render:

- Realtime already works across instances: events travel through Postgres `NOTIFY`.
- Rate limits and usage counters are in Postgres, so they are shared.
- Each instance runs a background worker; pg-boss makes sure a job is processed once.
- To separate the worker instead, set `WORKER_MODE=external` on the web service and create a
  Render **Background Worker** from the same repository with the Docker command
  `npm run worker` and the same database and OpenAI variables.

Each instance holds one long-lived database connection for realtime plus a small pool. Keep the
total within your Supabase plan's pooler limits.

## Demo data on a live database

`npm run db:seed` writes to whichever database `.env` points at. Run against production it
creates a real account (`demo@brightsmile.example`) that anyone with the password can log in to.
For a public demo set a strong `SEED_PASSWORD`; otherwise keep the seed to development databases.
To remove it, delete the "Bright Smile Dental Clinic" workspace and that user from the database.

## Troubleshooting

| Symptom | Cause and fix |
| --- | --- |
| Build fails with "DATABASE_URL is not set" | An old image or a custom build command. The build must not need the database; use the repository's `Dockerfile` unchanged. |
| Container exits at start with `P1001` (cannot reach database) | Wrong `DIRECT_URL`, or the Supabase project is paused (free projects pause after a week idle). An occasional `P1001` on the session pooler is transient; redeploy. |
| Login works locally but loops in production | `NEXTAUTH_URL` / `APP_URL` do not match the address in the browser, including `https` and the exact hostname. |
| Widget shows nothing on the customer's site | The site's domain is not under Allowed websites, or `WIDGET_URL` does not match the hostname in the embed code. The browser console shows a `frame-ancestors` message in the first case. |
| Sources stay on *Processing* | The service was asleep or restarted (use a paid instance), or `WORKER_MODE=external` is set without a worker running. Press Re-sync after fixing. |
| Sources fail with an OpenAI key error | `OPENAI_API_KEY` is missing or has no credit. |
| Customers get "Our assistant is unavailable" | The workspace used up its plan's monthly AI messages; the dashboard shows a banner. Change the plan (`Workspace.planId`) until billing is built. |
| Invitation or notification emails do not arrive | SMTP variables missing (the Settings page says so) or the sending domain is not verified. |
| "Something went wrong" in local development after a migration | Restart `npm run dev`; it was holding the old database client. |

## Go-live checklist

- [ ] `NEXTAUTH_SECRET` is random and not the one used in development
- [ ] `APP_URL`, `NEXTAUTH_URL`, `WIDGET_URL` use `https` and the exact custom domains
- [ ] `ALLOW_FREE_PLAN_CHANGE` is not set
- [ ] Render instance is a paid type (does not sleep)
- [ ] Supabase and Render are in nearby regions
- [ ] SMTP configured and the sending domain verified
- [ ] OpenAI account has a spending limit and a usage alert
- [ ] No demo account in the production database, or it has a strong password
- [ ] Supabase backups enabled
