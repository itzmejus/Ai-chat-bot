/**
 * The sales outreach email the admin Outreach page fills in for one business at a time.
 * Pure string building so it runs in the browser for the live preview and in tests.
 * The design mirrors marketing-email/email.html: tables and inline styles so it survives
 * Gmail, Outlook and Apple Mail.
 */

export type OutreachFields = {
  firstName: string;
  businessName: string;
  /** Optional first paragraph about their business, e.g. what you noticed on their website. */
  personalNote: string;
  senderName: string;
  senderAddress: string;
  subject: string;
};

export type OutreachSettings = {
  appName: string;
  /** Public site, also the host of /images/email/*.png. Must be reachable by the recipient. */
  siteUrl: string;
  signupUrl: string;
  contactEmail: string;
};

export const SUBJECTS = [
  "Answer every customer, even when you're closed",
  "{FirstName}, are after-hours enquiries going unanswered?",
  "Your website could reply in Arabic and English, 24/7",
];

const escape = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

/** Escaped, with line breaks kept. */
const paragraph = (value: string) => escape(value.trim()).replace(/\r?\n/g, "<br>");

export function outreachSubject(fields: OutreachFields) {
  const name = fields.firstName.trim();
  const subject = fields.subject.trim() || SUBJECTS[0];
  // Without a name, drop the "{FirstName}, " prefix and capitalise what is left.
  if (!name) return subject.replace(/\{FirstName\},?\s*/g, "").replace(/^./, (c) => c.toUpperCase());
  return subject.replace(/\{FirstName\}/g, name);
}

const greeting = (fields: OutreachFields) => (fields.firstName.trim() ? `Hi ${fields.firstName.trim()},` : "Hi there,");
const audience = (fields: OutreachFields) => fields.businessName.trim() || "your business";
const unsubscribeUrl = (s: OutreachSettings) => `mailto:${s.contactEmail}?subject=Unsubscribe`;

const FONT = "'Segoe UI',Helvetica,Arial,sans-serif";

const benefit = (title: string, text: string) => `
<tr>
  <td width="44" valign="top" style="padding:0 0 20px 0;">
    <div style="width:32px; height:32px; line-height:32px; border-radius:10px; background-color:#fee2e2; text-align:center; font-family:Arial,sans-serif; font-size:16px; font-weight:700; color:#dc2626;">&#10003;</div>
  </td>
  <td valign="top" style="padding:0 0 20px 0; font-family:${FONT};">
    <p style="margin:0 0 4px 0; font-size:16px; font-weight:700; color:#18181b;">${title}</p>
    <p style="margin:0; font-size:15px; line-height:23px; color:#52525b;">${text}</p>
  </td>
</tr>`;

const step = (n: number, title: string, text: string) => `
<td class="step" width="31%" valign="top" style="padding:0 0 20px 0; font-family:${FONT};">
  <table role="presentation" class="step-num" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 14px 0;">
    <tr><td width="36" height="36" align="center" valign="middle" bgcolor="#dc2626" style="width:36px; height:36px; border-radius:12px; font-size:16px; font-weight:800; color:#ffffff; line-height:36px;">${n}</td></tr>
  </table>
  <div class="step-body">
    <p style="margin:0 0 6px 0; font-size:16px; font-weight:700; color:#ffffff;">${title}</p>
    <p style="margin:0; font-size:14px; line-height:21px; color:#a1a1aa;">${text}</p>
  </div>
</td>`;

const gap = `<td class="step-gap" width="3.5%" style="font-size:0; line-height:0;">&nbsp;</td>`;

/** The visible email, from the outer background table down: what gets pasted into Gmail or Outlook. */
export function outreachBody(fields: OutreachFields, s: OutreachSettings) {
  const app = escape(s.appName);
  const site = escape(s.siteUrl);
  const signup = escape(s.signupUrl);
  const contact = escape(s.contactEmail);
  const note = fields.personalNote.trim() ? `<p style="margin:0 0 16px 0;">${paragraph(fields.personalNote)}</p>` : "";

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f4f5;">
<tr><td align="center" style="padding:32px 12px;">
<table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px; max-width:600px;">

<tr><td style="padding:0 8px 20px 8px;">
  <a href="${site}" target="_blank" style="text-decoration:none;">
    <img src="${site}/images/email/logo.png" width="32" height="32" alt="" style="display:inline-block; vertical-align:middle; border:0;">
    <span style="font-family:${FONT}; font-size:18px; font-weight:700; color:#18181b; vertical-align:middle; padding-left:8px;">${app}</span>
  </a>
</td></tr>

<tr><td style="background-color:#ffffff; border-radius:20px; overflow:hidden;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">

<tr><td style="padding:0; border-radius:20px 20px 0 0; overflow:hidden;">
  <a href="${site}" target="_blank"><img src="${site}/images/email/hero.png" width="600" alt="${app} chat widget on a business website, answering a customer in English and Arabic and capturing a new lead" style="display:block; width:100%; max-width:600px; height:auto; border:0; border-radius:20px 20px 0 0;"></a>
</td></tr>

<tr><td class="px" style="padding:36px 48px 0 48px; font-family:${FONT};">
  <p style="margin:0 0 12px 0; font-size:13px; font-weight:700; letter-spacing:1.2px; text-transform:uppercase; color:#dc2626;">AI customer support for your website</p>
  <h1 class="h1" style="margin:0; font-size:32px; line-height:40px; font-weight:800; color:#18181b;">Answer every customer, even when you're closed</h1>
</td></tr>

<tr><td class="px" style="padding:20px 48px 0 48px; font-family:${FONT}; font-size:16px; line-height:26px; color:#3f3f46;">
  <p style="margin:0 0 16px 0;">${escape(greeting(fields))}</p>
  ${note}
  <p style="margin:0 0 16px 0;">Your customers don't only ask questions during office hours. They message at 11 pm, on Fridays, in Arabic, English, Hindi or Russian, and when nobody replies quickly, many of them simply book with someone else.</p>
  <p style="margin:0;"><strong style="color:#18181b;">${app}</strong> puts an AI assistant on your website that answers in seconds, in your customer's own language, using only your business information. It collects their name and number, and calls in your team when a person is needed.</p>
</td></tr>

<tr><td class="px" style="padding:28px 48px 4px 48px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
${benefit("Accurate answers, never guesses", "It replies only from your website, files and FAQs. If it doesn't know, it says so and offers your team instead.")}
${benefit("Every chat becomes a lead", "When a customer wants to book or buy, it takes their name and phone number and emails you straight away.")}
${benefit("Your team stays in control", "See every conversation in a live inbox and take over any chat with one click. The AI steps aside while you reply.")}
</table>
</td></tr>

<tr><td class="px" style="padding:0 48px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#18181b" style="background-color:#18181b; border-radius:18px;">
<tr><td class="steps-wrap" style="padding:32px 28px 12px 28px; font-family:${FONT};">
  <p style="margin:0 0 8px 0; font-size:12px; font-weight:700; letter-spacing:1.4px; text-transform:uppercase; color:#fca5a5;">How it works</p>
  <p style="margin:0 0 6px 0; font-size:22px; line-height:28px; font-weight:800; color:#ffffff;">Live on your website in a few minutes</p>
  <p style="margin:0 0 26px 0; font-size:14px; line-height:21px; color:#a1a1aa;">No developers, no training sessions, no scripts to write.</p>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
  ${step(1, "Add your info", "Enter your website address, or upload your price list and FAQs.")}${gap}${step(2, "Paste one line", "Works with WordPress, Shopify, Wix, Webflow and custom sites.")}${gap}${step(3, "Go live", "Customers get answers day and night. You get the leads.")}
  </tr></table>
</td></tr>
</table>
</td></tr>

<tr><td class="px" align="center" style="padding:36px 48px 8px 48px;">
<table role="presentation" class="btn" cellpadding="0" cellspacing="0" border="0"><tr>
  <td align="center" bgcolor="#dc2626" style="border-radius:999px;">
    <a href="${signup}" target="_blank" style="display:inline-block; padding:16px 36px; font-family:${FONT}; font-size:16px; font-weight:700; color:#ffffff; text-decoration:none; border-radius:999px;">Create your free assistant &rarr;</a>
  </td>
</tr></table>
</td></tr>
<tr><td class="px" align="center" style="padding:4px 48px 0 48px; font-family:${FONT}; font-size:13px; color:#71717a;">Free plan &middot; No card needed &middot; Cancel any time</td></tr>
<tr><td class="px" align="center" style="padding:12px 48px 0 48px; font-family:${FONT}; font-size:14px;">
  <a href="${site}" target="_blank" style="color:#b91c1c; font-weight:600; text-decoration:underline;">Or try the live demo on our website</a>
</td></tr>

<tr><td class="px" style="padding:36px 48px 40px 48px; font-family:${FONT}; font-size:16px; line-height:26px; color:#3f3f46;">
  <p style="margin:0 0 16px 0;">If you'd like, reply to this email and I'll set up a test assistant with your own website's information, so you can see how it answers your customers before you decide.</p>
  <p style="margin:0;">Best regards,<br>
    <strong style="color:#18181b;">${escape(fields.senderName.trim() || "Your name")}</strong><br>
    <span style="color:#71717a;">${app} &middot; <a href="mailto:${contact}" style="color:#71717a; text-decoration:underline;">${contact}</a></span>
  </p>
</td></tr>

</table>
</td></tr>

<tr><td align="center" style="padding:24px 24px 0 24px; font-family:${FONT}; font-size:12px; line-height:19px; color:#a1a1aa;">
  ${app} &middot; ${escape(fields.senderAddress.trim() || "Your business address")}<br>
  You're receiving this because we thought ${app} could help ${escape(audience(fields))}.<br>
  <a href="${escape(unsubscribeUrl(s))}" style="color:#71717a; text-decoration:underline;">Unsubscribe</a>
</td></tr>

</table>
</td></tr>
</table>`;
}

/** The full HTML document, for email tools that take raw HTML (Brevo, Mailchimp, a sending script). */
export function outreachHtml(fields: OutreachFields, s: OutreachSettings) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light">
<title>${escape(outreachSubject(fields))}</title>
<style>
  body { margin: 0; padding: 0; }
  a { text-decoration: none; }
  @media only screen and (max-width: 620px) {
    .container { width: 100% !important; }
    .px { padding-left: 24px !important; padding-right: 24px !important; }
    .h1 { font-size: 28px !important; line-height: 36px !important; }
    .btn a { display: block !important; }
    .steps-wrap { padding: 28px 20px 12px 20px !important; }
    .step { display: block !important; width: 100% !important; padding: 0 0 20px 0 !important; }
    .step-gap { display: none !important; }
    .step-num { float: left; margin: 0 14px 0 0 !important; }
    .step-body { overflow: hidden; }
  }
</style>
</head>
<body style="margin:0; padding:0; background-color:#f4f4f5;">
<div style="display:none; max-height:0; overflow:hidden; mso-hide:all; font-size:1px; line-height:1px; color:#f4f4f5;">An AI assistant on your website that replies in seconds, in your customer's language, and saves every lead. Free to start.</div>
${outreachBody(fields, s)}
</body>
</html>`;
}

/** Plain-text version: send it alongside the HTML, or on its own for a more personal feel. */
export function outreachText(fields: OutreachFields, s: OutreachSettings) {
  const note = fields.personalNote.trim() ? `${fields.personalNote.trim()}\n\n` : "";
  return `${greeting(fields)}

${note}Your customers don't only ask questions during office hours. They message at 11 pm, on Fridays, in Arabic, English, Hindi or Russian, and when nobody replies quickly, many of them simply book with someone else.

${s.appName} puts an AI assistant on your website that answers in seconds, in your customer's own language, using only your business information. It collects their name and number, and calls in your team when a person is needed.

- Accurate answers, never guesses. It replies only from your website, files and FAQs. If it doesn't know, it says so and offers your team instead.
- Every chat becomes a lead. When a customer wants to book or buy, it takes their name and phone number and emails you straight away.
- Your team stays in control. See every conversation in a live inbox and take over any chat with one click.

Live in a few minutes:
1. Add your info: enter your website address, or upload your price list and FAQs.
2. Paste one line: works with WordPress, Shopify, Wix, Webflow and custom sites.
3. Go live: customers get answers day and night. You get the leads.

Create your free assistant (no card needed):
${s.signupUrl}

If you'd like, reply to this email and I'll set up a test assistant with your own website's information, so you can see how it answers your customers before you decide.

Best regards,
${fields.senderName.trim() || "Your name"}
${s.appName} · ${s.contactEmail}

--
${s.appName} · ${fields.senderAddress.trim() || "Your business address"}
You're receiving this because we thought ${s.appName} could help ${audience(fields)}.
Unsubscribe: ${unsubscribeUrl(s)}
`;
}
