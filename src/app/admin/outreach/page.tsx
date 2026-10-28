import { fmtDate, fmtDateTime, SectionTitle, StatCard, Table, Td } from "@/components/admin/admin-ui";
import { OutreachComposer } from "@/components/admin/outreach-composer";
import { APP_NAME, APP_URL, CONTACT_EMAIL, SITE_URL } from "@/lib/config";
import { requireAdmin } from "@/server/admin/access";
import { outreachReport, recentClicks } from "@/server/outreach/tracking";

/** Which link in the email was clicked, as stored in OutreachClick.button. */
const BUTTON_LABELS: Record<string, string> = { start: "Start for free", site: "Website link", logo: "Logo", image: "Image", text: "Text link" };

export const metadata = { title: "Outreach" };

/** Fill in one business's details and get the sales email ready to paste into Gmail or Outlook. */
export default async function AdminOutreachPage() {
  await requireAdmin();
  // Images in an email are loaded by the recipient, so a local address will show as broken.
  const local = /localhost|127\.0\.0\.1/.test(SITE_URL);
  const [report, clicks] = await Promise.all([outreachReport(), recentClicks()]);

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
      <OutreachComposer
        settings={{ appName: APP_NAME, siteUrl: SITE_URL, signupUrl: `${APP_URL}/signup`, contactEmail: CONTACT_EMAIL, trackUrl: `${APP_URL}/go` }}
      />

      <SectionTitle>Results (last {report.days} days)</SectionTitle>
      <div className="grid gap-3 sm:grid-cols-2">
        <StatCard label="Link clicks" value={report.totalClicks} hint="People who clicked a link in an outreach email" />
        <StatCard label="Sign-ups from outreach" value={report.totalSignups} hint="Accounts created within 30 days of clicking" />
      </div>
      <Table head={["Business", "Clicks", "“Start for free” clicks", "Sign-ups", "Last click"]} empty={report.rows.length === 0}>
        {report.rows.map((row) => (
          <tr key={row.business}>
            <Td className="font-medium">{row.business}</Td>
            <Td>{row.clicks}</Td>
            <Td>{row.startClicks}</Td>
            <Td className={row.signups ? "font-semibold text-green-700" : undefined}>{row.signups}</Td>
            <Td className="whitespace-nowrap">{fmtDate(row.lastClick)}</Td>
          </tr>
        ))}
      </Table>

      <SectionTitle>Recent clicks</SectionTitle>
      <Table head={["Time (UAE)", "Business", "Link clicked", "Went to"]} empty={clicks.length === 0}>
        {clicks.map((click) => (
          <tr key={click.id}>
            <Td className="whitespace-nowrap tabular-nums">{fmtDateTime(click.createdAt)}</Td>
            <Td className="font-medium">{click.business}</Td>
            <Td>{BUTTON_LABELS[click.button] ?? click.button}</Td>
            <Td>{click.target === "signup" ? "Sign-up page" : "Website"}</Td>
          </tr>
        ))}
      </Table>
      <p className="text-xs text-muted-foreground">
        The latest {clicks.length} clicks. Several clicks on one business within a few seconds of each other are usually a mail server checking the links, not a person.
      </p>
      <p className="text-xs text-muted-foreground">
        Clicks by mail-server link checkers and by signed-in users (such as you testing the preview) are not counted. Links carry UTM tags
        (utm_source=outreach), which Vercel shows under UTM Parameters with Web Analytics Plus.
      </p>
    </>
  );
}
