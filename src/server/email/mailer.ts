import nodemailer, { type Transporter } from "nodemailer";
import { APP_NAME } from "@/lib/config";

/**
 * Outgoing email (team invites and notifications) over SMTP.
 *
 * Configured with EMAIL_SERVER_HOST / PORT / USER / PASSWORD and EMAIL_FROM.
 * When no host is set (local development) nothing is sent: the message is
 * printed to the server log instead, so flows can still be followed.
 */

let transporter: Transporter | undefined;

export const emailConfigured = () => Boolean(process.env.EMAIL_SERVER_HOST);

function getTransporter(): Transporter {
  const port = Number(process.env.EMAIL_SERVER_PORT || 587);
  transporter ??= nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port,
    secure: port === 465, // 465 is TLS from the start; 587 upgrades with STARTTLS
    auth: process.env.EMAIL_SERVER_USER ? { user: process.env.EMAIL_SERVER_USER, pass: process.env.EMAIL_SERVER_PASSWORD } : undefined,
    connectionTimeout: 10_000,
    socketTimeout: 15_000,
  });
  return transporter;
}

const escapeHtml = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export type EmailContent = {
  subject: string;
  /** Short heading shown at the top of the message. */
  heading: string;
  /** Plain paragraphs. Escaped before being placed in HTML. */
  lines: string[];
  /** Label/value rows, e.g. a lead's name and phone. */
  details?: [string, string][];
  action?: { label: string; url: string };
  /** Right-to-left layout for Arabic. */
  rtl?: boolean;
};

/** Builds a simple, client-safe HTML email plus its plain-text twin. */
export function renderEmail(content: EmailContent): { html: string; text: string } {
  const dir = content.rtl ? "rtl" : "ltr";
  const details = content.details?.length
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:16px 0;border-collapse:collapse;width:100%">${content.details
        .map(
          ([label, value]) =>
            `<tr><td style="padding:8px 12px;border:1px solid #e4e4e7;color:#62616d;width:35%">${escapeHtml(label)}</td><td style="padding:8px 12px;border:1px solid #e4e4e7;font-weight:600">${escapeHtml(value)}</td></tr>`,
        )
        .join("")}</table>`
    : "";
  const action = content.action
    ? `<p style="margin:24px 0"><a href="${escapeHtml(content.action.url)}" style="background:#2563eb;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:10px;font-weight:600;display:inline-block">${escapeHtml(content.action.label)}</a></p>`
    : "";

  const html = `<!doctype html><html dir="${dir}"><body style="margin:0;background:#f6f6f7;font-family:Segoe UI,Tahoma,Arial,sans-serif;color:#1b1b20">
<div style="max-width:520px;margin:0 auto;padding:24px 16px">
  <p style="font-weight:700;font-size:16px;margin:0 0 16px">${escapeHtml(APP_NAME)}</p>
  <div style="background:#ffffff;border-radius:16px;padding:24px;border:1px solid #e4e4e7" dir="${dir}">
    <h1 style="font-size:20px;margin:0 0 12px">${escapeHtml(content.heading)}</h1>
    ${content.lines.map((line) => `<p style="margin:0 0 10px;line-height:1.6">${escapeHtml(line)}</p>`).join("")}
    ${details}${action}
  </div>
</div></body></html>`;

  const text = [
    content.heading,
    "",
    ...content.lines,
    ...(content.details?.length ? ["", ...content.details.map(([label, value]) => `${label}: ${value}`)] : []),
    ...(content.action ? ["", `${content.action.label}: ${content.action.url}`] : []),
  ].join("\n");

  return { html, text };
}

/** Sends one email. Returns false (and logs) instead of throwing, so a mail problem never breaks a chat. */
export async function sendEmail(to: string | string[], content: EmailContent): Promise<boolean> {
  const recipients = Array.isArray(to) ? to : [to];
  if (recipients.length === 0) return false;
  const { html, text } = renderEmail(content);

  if (!emailConfigured()) {
    if (process.env.NODE_ENV !== "test") console.log(`[email] not configured, would send to ${recipients.join(", ")}:\n  ${content.subject}\n  ${text.replace(/\n/g, "\n  ")}`);
    return false;
  }
  try {
    await getTransporter().sendMail({
      from: process.env.EMAIL_FROM || `${APP_NAME} <no-reply@localhost>`,
      to: recipients,
      subject: content.subject,
      text,
      html,
    });
    return true;
  } catch (err) {
    console.error(`[email] failed to send "${content.subject}"`, (err as Error).message);
    return false;
  }
}
