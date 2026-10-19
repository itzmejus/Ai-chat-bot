# Deployment guide: Vercel + Supabase

This guide takes the app from a Git repository to a live service with the dashboard on
`www.assist.siteselo.com/dashboard`, the public site on the same hostname (`www.assist.siteselo.com/`), and the
chat widget on `chat.siteselo.com`. Replace those names with your own.

What gets deployed:

| Piece | Where | Notes |
| --- | --- | --- |
| Database | Supabase (Postgres with pgvector) | also holds rate-limit counters, usage and the realtime channel |
| Web app | Vercel (Next.js) | dashboard, public site, widget and APIs |
| Product photos and widget logos | Supabase Storage | optional |
| AI | OpenAI API | chat model and embeddings |
| Payments | Dodo Payments | merchant of record; monthly subscriptions |
| Email | any SMTP provider | password reset, invitations, notifications |

There is no Redis and no separate worker: on Vercel a new knowledge source is read in the
function that adds it, after the response is sent (see `jobMode()` in `src/server/jobs/queue.ts`).

## 1. Supabase

1. Create a project. Note its region; the Vercel functions must run in the same one
   (this project uses `ap-northeast-1`, Tokyo).
2. Open **Connect** and copy two connection strings, putting your database password in each:
   - **Transaction pooler** (port 6543): this is `DATABASE_URL`, used by every request
   - **Session pooler** (port 5432): this is `DIRECT_URL`, used for migrations and the realtime channel
3. Nothing else to set up. The migrations enable the `vector` extension and create the tables,
   the vector index and the plans.

If the password contains characters such as `@`, `#` or `/`, URL-encode them in the connection
strings (`@` becomes `%40`).

The session pooler allows few connections (15 on the smallest compute). The app keeps its use
low on Vercel; if the logs ever show `EMAXCONNSESSION`, raise the pool size in Supabase
(Database > Settings > Connection pooling) or move to a larger compute.

## 2. Vercel project

1. **Add New > Project** and import the repository. Framework: **Next.js** (detected).
2. `vercel.json` in the repository already sets:
   - **Region `hnd1` (Tokyo)**, next to the database. Change it if your Supabase region differs:
     every request makes several database calls, so distance multiplies.
   - **Build command `npm run vercel-build`**: on production deployments it first runs
     `prisma migrate deploy`, then the normal build. Preview deployments never migrate, so a
     branch cannot change the live database.
3. **Settings > Functions:** keep **Fluid compute** on (the default). The knowledge, upload and
   live-stream routes ask for up to 300 seconds.
4. Add the environment variables below (Production), then deploy.

### Environment variables

| Variable | Value |
| --- | --- |
| `DATABASE_URL` | Supabase transaction pooler string (port 6543) |
| `DIRECT_URL` | Supabase session pooler string (port 5432) |
| `NEXTAUTH_SECRET` | a long random value: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` |
| `NEXTAUTH_URL` | `https://www.assist.siteselo.com` (same as `APP_URL`) |
| `APP_NAME` | the product name shown in the dashboard and emails |
| `APP_URL` | `https://www.assist.siteselo.com` |
| `WIDGET_URL` | `https://chat.siteselo.com` |
| `SITE_URL` | leave unset: the public site is then served on `APP_URL` |
| `REDIRECT_HOSTS` | former hostnames to redirect to the current address, comma separated; optional |
| `CLIENT_IP_HEADER` | `x-real-ip` (the visitor's address as Vercel reports it; used for rate limits) |
| `CONTACT_EMAIL` | address shown on the site, legal pages and billing notes; defaults to hello@siteselo.com |
| `SITE_WIDGET_KEY` | public key (`pk_...`) of the workspace whose chat widget appears on the public site |
| `ADMIN_EMAILS` | who can open `/admin`, comma separated; their email must be confirmed |
| `OPENAI_API_KEY` | your OpenAI key |
| `OPENAI_MODEL` | `gpt-4.1-mini` (or another chat model) |
| `SUPABASE_URL` | `https://<project-ref>.supabase.co` (Supabase > Project Settings > API); for photos and logos |
| `SUPABASE_SERVICE_ROLE_KEY` | the `service_role` key from the same page; a secret |
| `JS_RENDER_URL` | `https://r.jina.ai/` to read websites built with JavaScript; recommended |
| `JS_RENDER_API_KEY` | a Jina Reader API key, for a higher rate limit; optional |
| `DODO_PAYMENTS_API_KEY`, `DODO_PAYMENTS_WEBHOOK_KEY`, `DODO_PRODUCT_STARTER`, `DODO_PRODUCT_GROWTH`, `DODO_PRODUCT_PRO` | Dodo Payments **Live Mode** values; see step 6 |
| `DODO_PAYMENTS_ENVIRONMENT` | `live_mode` |
| `EMAIL_SERVER_HOST`, `EMAIL_SERVER_PORT`, `EMAIL_SERVER_USER`, `EMAIL_SERVER_PASSWORD`, `EMAIL_FROM` | see step 4 |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | see step 5; optional |

Leave `ALLOW_FREE_PLAN_CHANGE`, `WORKER_MODE` and `SEED_PASSWORD` unset. No trailing slash on the URLs.

Changing `NEXTAUTH_SECRET` later logs everyone out and invalidates open widget sessions
(customers get a new session on their next page load).

## 3. Domains

Every hostname points at the **same** Vercel project. The app decides what to serve from the hostname.

1. In the project open **Settings > Domains** and add `www.assist.siteselo.com` (the main one),
   `assist.siteselo.com` (redirect to `www`) and `chat.siteselo.com`.
2. At your DNS provider create the records Vercel shows for each (usually a `CNAME`).
3. Wait for Vercel to verify them and issue the certificates.

`APP_URL` is the official address. Public pages opened on another spelling are redirected to
it, so search engines index each page once. Log in and use the dashboard on the `APP_URL` hostname.

**Changing the hostname later.** Keep the old hostname attached to the project and list it
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
of its own later, set `SITE_URL` and add that domain to the project; the app host then keeps only the
dashboard and redirects marketing pages to the site.

### Search engines

The public site is built to be indexed: every page is a complete HTML page rendered on the server
(no JavaScript is needed to read it), with its own title, description, canonical address, links to
its translation, and structured data. `/sitemap.xml` lists every page and `/robots.txt` points to it.
Google still has to be told the site exists, and indexing takes days to weeks:

1. In [Google Search Console](https://search.google.com/search-console) add the site as a
   **URL prefix** property using the exact address in `APP_URL`. Choose the **HTML tag** method,
   copy only the code inside `content="..."`, set it as `GOOGLE_SITE_VERIFICATION` on Vercel,
   redeploy, then press Verify.
2. Under **Sitemaps** submit `sitemap.xml`.
3. Use **URL inspection > Request indexing** for the home page and the few pages that matter most.
   The rest are found through the sitemap and the links between pages.
4. Optional: do the same in [Bing Webmaster Tools](https://www.bing.com/webmasters) with
   `BING_SITE_VERIFICATION`. Bing's index also feeds several AI search products.
5. Check a blog article with Google's Rich Results Test to confirm the Article and FAQ data are read.

New articles go in `src/content/site/topics-en.ts` and `topics-ar.ts`, with their address added to
`GUIDE_SLUGS` in `src/lib/site-routes.ts`; the sitemap, the blog page and the footer pick them up.

## 4. Email (needed for password reset)

Without SMTP settings, invitations show a link for the owner to copy, and notifications, password
reset links and email-confirmation links are only written to the server log. That means **nobody
can reset a forgotten password** until email is set up. Any SMTP provider works (Resend, Brevo,
Amazon SES, Postmark, Zoho):

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

Without the first two, nothing is sent and each alert is written to the server log instead.

## 5. Google login (optional)

1. In Google Cloud Console create an **OAuth client ID** of type *Web application*.
2. Authorised JavaScript origin: `https://www.assist.siteselo.com`
3. Authorised redirect URI: `https://www.assist.siteselo.com/api/auth/callback/google`
4. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` on Vercel.

The "Continue with Google" button appears only when both are set.

## 6. Payments (Dodo Payments)

In the Dodo dashboard, in **Live Mode** (test and live mode have separate keys and products):

1. **Products:** one monthly subscription per paid plan (Starter, Growth, Pro). Their IDs
   (`pdt_...`) go in `DODO_PRODUCT_STARTER`, `DODO_PRODUCT_GROWTH`, `DODO_PRODUCT_PRO`.
2. **Developer > API Keys:** `DODO_PAYMENTS_API_KEY`.
3. **Developer > Webhooks:** endpoint `https://www.assist.siteselo.com/api/billing/webhook`, all
   **Subscription** events. Its signing secret (`whsec_...`) is `DODO_PAYMENTS_WEBHOOK_KEY`.
4. Set `DODO_PAYMENTS_ENVIRONMENT=live_mode`.

Online payment turns on when the key and all three product IDs are set. Plans only change
through the webhook. Locally, keep Test Mode values in `.env`.

## 7. Check the deployment

1. Open `https://www.assist.siteselo.com`: the public site should appear. Press **Start free**, sign up and complete onboarding.
2. **Knowledge base:** add an FAQ, then a website. Each should change from *Processing* to *Ready*
   (an FAQ within seconds, a website within a few minutes). That confirms the database, the
   in-request processing and the OpenAI key.
3. **Test your assistant** on the same page: ask the FAQ's question.
4. **Widget:** add your website's domain under Allowed websites, copy the embed code, and paste it
   before `</body>` on the site. The live preview on the Widget page should show the chat.
5. Send a message from the website. It should appear in **Inbox** without reloading the page.
6. **Team:** invite a second address and confirm the email arrives.
7. **`/admin/health`** (as an admin): every service should show OK.

## Updating

Push to the production branch. Vercel builds it, applies any new migrations, and switches
traffic over when the build succeeds. Migrations are plain SQL files in `prisma/migrations`;
write them so the previous version of the app keeps working while the new one rolls out (add
columns before using them, remove them one release later).

Back up before risky changes: Supabase takes daily backups on paid plans; on the free plan
export with `pg_dump` using `DIRECT_URL`.

## How it runs on Vercel

- **Knowledge sources** are read in the function that adds them, after the response (Next.js
  `after`), within 300 seconds. A website stops at 50 pages. If a function is stopped mid-way,
  the source stays on *Processing*: press **Re-sync**. To use a separate always-on worker
  instead, set `WORKER_MODE=external` and run `npm run worker` elsewhere with the same variables.
- **Uploads** are limited to 4 MB per request (files and photos); Vercel refuses larger bodies.
- **Realtime** (the inbox and the widget) uses Server-Sent Events. Each stream ends itself after
  four minutes and the browser reconnects and catches up. Events reach every instance through
  Postgres `NOTIFY`; an instance opens its listening connection only while someone is connected.
- **Database connections:** each instance keeps a small pool on the transaction pooler.
- **Pictures** in `public/images` are cached by browsers for a week; give a changed picture a new file name.

## Demo data on a live database

`npm run db:seed` writes to whichever database `.env` points at. Run against production it
creates a real account (`demo@brightsmile.example`) that anyone with the password can log in to.
Keep the seed to development databases. To remove it, delete the "Bright Smile Dental Clinic"
workspace and that user from the database.

## Troubleshooting

| Symptom | Cause and fix |
| --- | --- |
| Logs show `EMAXCONNSESSION` (max clients in session mode) and logins hang | Too many connections on the session pooler (port 5432). Check `DATABASE_URL` uses port **6543**, and that `WORKER_MODE` is unset or `request`. Redeploy to drop old instances; raise the Supabase pool size if it returns. |
| Build fails while running `prisma migrate deploy` | `DIRECT_URL` is missing or wrong in the Production environment, or the Supabase project is paused. |
| Login works locally but loops in production | `NEXTAUTH_URL` / `APP_URL` do not match the address in the browser, including `https` and the exact hostname. |
| Widget shows nothing on the customer's site | The site's domain is not under Allowed websites, or `WIDGET_URL` does not match the hostname in the embed code. The browser console shows a `frame-ancestors` message in the first case. |
| Product photos or logos cannot be uploaded | `SUPABASE_URL` or `SUPABASE_SERVICE_ROLE_KEY` is missing or wrong, or the file is over 4 MB. |
| A website source shows 1 page and a "very little text" warning | The site is drawn by JavaScript. Set `JS_RENDER_URL`, redeploy and press Re-sync. |
| Sources stay on *Processing* | The function was stopped mid-way (very slow site), or `WORKER_MODE=external` is set without a worker running. Press Re-sync. |
| Sources fail with an OpenAI key error | `OPENAI_API_KEY` is missing or has no credit. |
| A payment went through but the plan did not change | Check the webhook deliveries in Dodo: 401 means a wrong `DODO_PAYMENTS_WEBHOOK_KEY`; test-mode product IDs in production also leave the plan unchanged. |
| Invitation or notification emails do not arrive | SMTP variables missing (the Settings page says so) or the sending domain is not verified. |

## Go-live checklist

- [ ] `NEXTAUTH_SECRET` is random and not the one used in development
- [ ] `APP_URL`, `NEXTAUTH_URL`, `WIDGET_URL` use `https` and the exact custom domains; `SITE_URL` is unset
- [ ] `DATABASE_URL` uses port 6543, `DIRECT_URL` port 5432
- [ ] Vercel function region matches the Supabase region (`vercel.json`)
- [ ] Dodo Payments values are the **Live Mode** ones and `DODO_PAYMENTS_ENVIRONMENT=live_mode`
- [ ] `ALLOW_FREE_PLAN_CHANGE` and `WORKER_MODE` are not set
- [ ] SMTP configured and the sending domain verified (password reset and email confirmation depend on it)
- [ ] After the first deploy, "Forgot password?" sends an email and its link sets a new password
- [ ] `/admin/health` shows every service OK
- [ ] Sitemap submitted to Google Search Console
- [ ] OpenAI account has a spending limit and a usage alert
- [ ] No demo account in the production database
- [ ] Supabase backups enabled
