import { OutreachComposer } from "@/components/admin/outreach-composer";
import { APP_NAME, APP_URL, CONTACT_EMAIL, SITE_URL } from "@/lib/config";
import { requireAdmin } from "@/server/admin/access";

export const metadata = { title: "Outreach" };

/** Fill in one business's details and get the sales email ready to paste into Gmail or Outlook. */
export default async function AdminOutreachPage() {
  await requireAdmin();
  // Images in an email are loaded by the recipient, so a local address will show as broken.
  const local = /localhost|127\.0\.0\.1/.test(SITE_URL);

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold">Outreach email</h1>
        <p className="mt-1 text-sm text-muted-foreground">Fill in the business you are writing to, then copy the finished email into Gmail or Outlook.</p>
      </div>
      {local && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          SITE_URL is {SITE_URL}, so the email&apos;s images and links point to your computer and will not work for the recipient. Use this page on the live site to copy emails you send.
        </p>
      )}
      <OutreachComposer settings={{ appName: APP_NAME, siteUrl: SITE_URL, signupUrl: `${APP_URL}/signup`, contactEmail: CONTACT_EMAIL }} />
    </>
  );
}
