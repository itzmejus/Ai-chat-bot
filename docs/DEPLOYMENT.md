# Deployment guide: Render + Supabase

This guide takes the app from a Git repository to a live service with the dashboard on
`www.assist.siteselo.com/dashboard`, the public site on the same hostname (`www.assist.siteselo.com/`), and the
chat widget on `chat.siteselo.com`. Replace those names with your own.

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
| `APP_URL` | `https://www.assist.siteselo.com` |
| `NEXTAUTH_URL` | `https://www.assist.siteselo.com` (same as `APP_URL`) |
| `WIDGET_URL` | `https://chat.siteselo.com` |
| `SITE_URL` | leave unset: the public site is then served on `APP_URL` |
| `REDIRECT_HOSTS` | former hostnames to redirect to the current address, comma separated; optional |
| `CONTACT_EMAIL` | address shown in the site footer and legal pages; optional |
| `SUPABASE_URL` | `https://<project-ref>.supabase.co` (Supabase > Project Settings > API); needed for product photos |
| `SUPABASE_SERVICE_ROLE_KEY` | the `service_role` key from the same page; a secret |
| `JS_RENDER_URL` | `https://r.jina.ai/` to read websites that are built with JavaScript; optional but recommended |
| `JS_RENDER_API_KEY` | a Jina Reader API key, for a higher rate limit; optional |
| `EMAIL_SERVER_HOST`, `EMAIL_SERVER_PORT`, `EMAIL_SERVER_USER`, `EMAIL_SERVER_PASSWORD`, `EMAIL_FROM` | see step 4; optional |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | see step 5; optional |

Leave `ALLOW_FREE_PLAN_CHANGE` and `WORKER_MODE` unset. Do not set `PORT`; Render provides it.
No trailing slash on the URLs.

Changing `NEXTAUTH_SECRET` later logs everyone out and invalidates open widget sessions
(customers get a new session on their next page load).

## 3. Domains

Every hostname points at the **same** Render service. The app decides what to serve from the hostname.

1. In the Render service open **Settings > Custom Domains** and add
   `www.assist.siteselo.com`, `assist.siteselo.com` and `chat.siteselo.com`.
2. At your DNS provider create a `CNAME` record for each, pointing to the service's
   `*.onrender.com` address as Render shows.
3. Wait for Render to verify them and issue the certificates.

`APP_URL` is the official address. The other spelling (`assist.siteselo.com` without `www.`) should be added as a custom domain too:
public pages opened there are redirected to `APP_URL`, so search engines index each page once.
Log in and use the dashboard on the `APP_URL` hostname.

**Changing the hostname later.** Keep the old hostname attached to the Render service and list it
in `REDIRECT_HOSTS` (comma separated, for example `app.siteselo.com,www.app.siteselo.com`).
Everything opened on it is then sent, with a permanent redirect, to the same path on the new
address, so old links, bookmarks and search results keep working.

How the hosts behave:

| Host | Serves | Everything else |
| --- | --- | --- |
| `www.assist.` | the public site in English and Arabic (`/`, `/ar/...`), `sitemap.xml`, `robots.txt`, login, and the dashboard at `/dashboard` | the chat iframe and public chat API are refused |
| `chat.` | `widget.js`, the chat iframe, the public chat API | refused (the home page redirects to the site) |

Keeping the widget on its own hostname means dashboard login cookies are never sent along with
requests made from customers' websites.

`WIDGET_URL` and `SITE_URL` both default to `APP_URL` when unset. To move the public site to a domain
of its own later, set `SITE_URL` and add that domain to Render; the app host then keeps only the
dashboard and redirects marketing pages to the site.

### Search engines

The public site is built to be indexed: every page is a complete HTML page rendered on the server
(no JavaScript is needed to read it), with its own title, description, canonical address, links to
its translation, and structured data. `/sitemap.xml` lists every page and `/robots.txt` points to it.
Google still has to be told the site exists, and indexing takes days to weeks:

1. In [Google Search Console](https://search.google.com/search-console) add the site as a
   **URL prefix** property using the exact address in `APP_URL`. Choose the **HTML tag** method,
   copy only the code inside `content="..."`, set it as `GOOGLE_SITE_VERIFICATION` on Render,
   redeploy, then press Verify.
2. Under **Sitemaps** submit `sitemap.xml`.
3. Use **URL inspection > Request indexing** for the home page and the few pages that matter most.
   The rest are found through the sitemap and the links between pages.
4. Optional: do the same in [Bing Webmaster Tools](https://www.bing.com/webmasters) with
   `BING_SITE_VERIFICATION`. Bing's index also feeds several AI search products.
5. Check a blog article with Google's Rich Results Test to confirm the Article and FAQ data are read.

Things that affect how well it ranks, beyond what the code can do: links from other sites (the
link from siteselo.com is a start), how long the domain has existed, and adding new articles over
time. New articles go in `src/content/site/topics-en.ts` and `topics-ar.ts`, with their address
added to `GUIDE_SLUGS` in `src/lib/site-routes.ts`; the sitemap, the blog page and the footer pick
them up from there.

Set the real plan prices in `src/content/site/index.ts` before launch, and have the privacy policy
and terms in `src/content/site/en.ts` and `ar.ts` reviewed for your company.

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

### WhatsApp alerts (optional)

A business can list up to three WhatsApp numbers under **Settings → Notifications**. Each gets a
WhatsApp message the moment a chat needs a person. This uses Meta's WhatsApp Business Cloud API
with one sender number that belongs to the platform (not one per business):

1. In [Meta for Developers](https://developers.facebook.com) create a Business app, add the
   **WhatsApp** product, and register the phone number that will send the alerts.
2. Create a **System User** access token with the `whatsapp_business_messaging` permission
   (a permanent token; the temporary one from the setup page expires after a day).
3. In WhatsApp Manager create a message template named `needs_human_alert`, category *Utility*,
   in English (`en`) and Arabic (`ar`), with three body variables, for example:
   `A customer is waiting for {{1}}. Customer: {{2}}. Last message: {{3}}`. Wait for Meta to approve it.
4. Set the environment variables:

| Variable | Value |
| --- | --- |
| `WHATSAPP_ACCESS_TOKEN` | the System User token |
| `WHATSAPP_PHONE_NUMBER_ID` | the sender's *Phone number ID* (not the phone number itself) |
| `WHATSAPP_TEMPLATE_NEEDS_HUMAN` | only if the template has a different name |
| `WHATSAPP_API_VERSION` | only to pin a Graph API version, e.g. `v21.0` |

Without the first two, nothing is sent and each alert is written to the server log instead. The
template language follows the business's customer language: Arabic for Arabic-only workspaces,
English otherwise. This has been tested against a mocked API only; send yourself a test alert
after setting it up.

## 5. Google login (optional)

1. In Google Cloud Console create an **OAuth client ID** of type *Web application*.
2. Authorised JavaScript origin: `https://www.assist.siteselo.com`
3. Authorised redirect URI: `https://www.assist.siteselo.com/api/auth/callback/google`
4. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` on Render.

The "Continue with Google" button appears only when both are set.

## 6. Check the deployment

1. Open `https://www.assist.siteselo.com`: the public site should appear. Press **Start free**, sign up and complete onboarding.
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
| Product photos cannot be uploaded | `SUPABASE_URL` or `SUPABASE_SERVICE_ROLE_KEY` is missing or wrong. The product form says when storage is not set up; the server log shows the reason a refused upload was refused. |
| A website source shows 1 page and a "very little text" warning | The site is drawn by JavaScript. Set `JS_RENDER_URL` (see the variables above), redeploy and press Re-sync. |
| Sources stay on *Processing* | The service was asleep or restarted (use a paid instance), or `WORKER_MODE=external` is set without a worker running. Press Re-sync after fixing. |
| Sources fail with an OpenAI key error | `OPENAI_API_KEY` is missing or has no credit. |
| Customers get "Our assistant is unavailable" | The workspace used up its plan's monthly AI messages; the dashboard shows a banner. Change the plan (`Workspace.planId`) until billing is built. |
| Invitation or notification emails do not arrive | SMTP variables missing (the Settings page says so) or the sending domain is not verified. |
| "Something went wrong" in local development after a migration | Restart `npm run dev`; it was holding the old database client. |

## Go-live checklist

- [ ] `NEXTAUTH_SECRET` is random and not the one used in development
- [ ] `APP_URL`, `NEXTAUTH_URL`, `WIDGET_URL` use `https` and the exact custom domains; `SITE_URL` is unset
- [ ] Real prices set in `src/content/site/index.ts`; privacy policy and terms reviewed
- [ ] Sitemap submitted to Google Search Console
- [ ] `ALLOW_FREE_PLAN_CHANGE` is not set
- [ ] Render instance is a paid type (does not sleep)
- [ ] Supabase and Render are in nearby regions
- [ ] SMTP configured and the sending domain verified
- [ ] OpenAI account has a spending limit and a usage alert
- [ ] No demo account in the production database, or it has a strong password
- [ ] Supabase backups enabled
