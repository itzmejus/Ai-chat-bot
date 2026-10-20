/**
 * The sales outreach email the admin Outreach page fills in for one business at a time.
 * Pure string building so it runs in the browser for the live preview and in tests.
 *
 * Deliberately minimal: a short personal note, three one-line points, the product picture,
 * one "try it free" call to action and a signature. Tables and inline styles so it survives
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

const FONT = "-apple-system,'Segoe UI',Helvetica,Arial,sans-serif";
const INK = "#18181b";
const TEXT = "#3f3f46";
const MUTED = "#71717a";
const RED = "#dc2626";

/** What it does, one line each. */
const POINTS = [
  "Answers customers 24/7, using only your website, prices and FAQs",
  "Replies in their own language: English, Arabic, Hindi and more",
  "Saves every enquiry as a lead, and calls in your team when needed",
];

const OPENING = (business: string) =>
  `When customers message ${business} outside office hours, most wait until the next day for a reply, and some book somewhere else instead.`;
const OFFER = "Short on time? Reply to this email and I'll set it up with your website's information, so you can see it answer your customers before you decide.";

const point = (text: string) => `
<tr>
  <td width="24" valign="top" style="padding:0 0 10px 0; font-family:${FONT}; font-size:15px; line-height:23px; font-weight:700; color:${RED};">&#10003;</td>
  <td valign="top" style="padding:0 0 10px 0; font-family:${FONT}; font-size:15px; line-height:23px; color:${TEXT};">${escape(text)}</td>
</tr>`;

/** The visible email, from the outer background table down: what gets pasted into Gmail or Outlook. */
export function outreachBody(fields: OutreachFields, s: OutreachSettings) {
  const app = escape(s.appName);
  const site = escape(s.siteUrl);
  const signup = escape(s.signupUrl);
  const contact = escape(s.contactEmail);
  const business = escape(audience(fields));
  const note = fields.personalNote.trim() ? `<p style="margin:0 0 16px 0;">${paragraph(fields.personalNote)}</p>` : "";

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f4f5;">
<tr><td align="center" style="padding:32px 12px;">
<table role="presentation" class="container" width="560" cellpadding="0" cellspacing="0" border="0" style="width:560px; max-width:560px;">

<tr><td style="padding:0 4px 18px 4px;">
  <a href="${site}" target="_blank" style="text-decoration:none;">
    <img src="${site}/images/email/logo.png" width="28" height="28" alt="" style="display:inline-block; vertical-align:middle; border:0;">
    <span style="font-family:${FONT}; font-size:17px; font-weight:700; color:${INK}; vertical-align:middle; padding-left:8px;">${app}</span>
  </a>
</td></tr>

<tr><td style="background-color:#ffffff; border:1px solid #e4e4e7; border-radius:16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">

<tr><td class="px" style="padding:36px 40px 0 40px; font-family:${FONT}; font-size:16px; line-height:26px; color:${TEXT};">
  <p style="margin:0 0 16px 0;">${escape(greeting(fields))}</p>
  ${note}
  <p style="margin:0 0 16px 0;">${OPENING(business)}</p>
  <p style="margin:0;"><strong style="color:${INK};">${app}</strong> adds an AI assistant to your website that replies in seconds. It:</p>
</td></tr>

<tr><td class="px" style="padding:16px 40px 6px 40px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${POINTS.map(point).join("")}
</table>
</td></tr>

<tr><td class="px" style="padding:6px 40px 0 40px;">
  <a href="${site}" target="_blank"><img src="${site}/images/email/hero.png" width="478" alt="${app} answering a customer on a business website in English and Arabic, and saving a new lead" style="display:block; width:100%; max-width:478px; height:auto; border:0; border-radius:12px;"></a>
</td></tr>

<tr><td class="px" style="padding:28px 40px 0 40px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#fef2f2; border-radius:12px;">
<tr><td align="center" style="padding:26px 24px; font-family:${FONT};">
  <p style="margin:0 0 4px 0; font-size:19px; line-height:26px; font-weight:700; color:${INK};">Try it free on your website</p>
  <p style="margin:0 0 18px 0; font-size:14px; line-height:21px; color:${MUTED};">Set up in about 5 minutes. Free plan, no card needed.</p>
  <table role="presentation" class="btn" cellpadding="0" cellspacing="0" border="0"><tr>
    <td align="center" bgcolor="${RED}" style="border-radius:10px;">
      <a href="${signup}" target="_blank" style="display:inline-block; padding:13px 30px; font-family:${FONT}; font-size:15px; font-weight:700; color:#ffffff; text-decoration:none; border-radius:10px;">Start for free</a>
    </td>
  </tr></table>
  <p style="margin:14px 0 0 0; font-size:13px; line-height:19px; color:${MUTED};">or <a href="${site}" target="_blank" style="color:#b91c1c; text-decoration:underline;">ask the assistant on our website</a></p>
</td></tr>
</table>
</td></tr>

<tr><td class="px" style="padding:28px 40px 36px 40px; font-family:${FONT}; font-size:16px; line-height:26px; color:${TEXT};">
  <p style="margin:0 0 16px 0;">${OFFER}</p>
  <p style="margin:0;">Best regards,<br>
    <strong style="color:${INK};">${escape(fields.senderName.trim() || "Your name")}</strong><br>
    <span style="font-size:14px; color:${MUTED};">${app} &middot; <a href="mailto:${contact}" style="color:${MUTED}; text-decoration:underline;">${contact}</a></span>
  </p>
</td></tr>

</table>
</td></tr>

<tr><td align="center" style="padding:20px 24px 0 24px; font-family:${FONT}; font-size:12px; line-height:19px; color:#a1a1aa;">
  ${app} &middot; ${escape(fields.senderAddress.trim() || "Your business address")}<br>
  You're receiving this because we thought ${app} could help ${business}.
  <a href="${escape(unsubscribeUrl(s))}" style="color:${MUTED}; text-decoration:underline;">Unsubscribe</a>
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
  @media only screen and (max-width: 600px) {
    .container { width: 100% !important; }
    .px { padding-left: 22px !important; padding-right: 22px !important; }
  }
</style>
</head>
<body style="margin:0; padding:0; background-color:#f4f4f5;">
<div style="display:none; max-height:0; overflow:hidden; mso-hide:all; font-size:1px; line-height:1px; color:#f4f4f5;">An AI assistant for your website that answers customers 24/7. Try it free, no card needed.</div>
${outreachBody(fields, s)}
</body>
</html>`;
}

/** Plain-text version: send it alongside the HTML, or on its own for a more personal feel. */
export function outreachText(fields: OutreachFields, s: OutreachSettings) {
  const note = fields.personalNote.trim() ? `${fields.personalNote.trim()}\n\n` : "";
  return `${greeting(fields)}

${note}${OPENING(audience(fields))}

${s.appName} adds an AI assistant to your website that replies in seconds. It:
${POINTS.map((p) => `- ${p}`).join("\n")}

Try it free on your website. Set up in about 5 minutes; free plan, no card needed:
${s.signupUrl}

${OFFER}

Best regards,
${fields.senderName.trim() || "Your name"}
${s.appName} · ${s.contactEmail}

--
${s.appName} · ${fields.senderAddress.trim() || "Your business address"}
You're receiving this because we thought ${s.appName} could help ${audience(fields)}.
Unsubscribe: ${unsubscribeUrl(s)}
`;
}
