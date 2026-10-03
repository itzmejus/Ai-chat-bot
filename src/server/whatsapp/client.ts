/**
 * Outgoing WhatsApp messages through Meta's WhatsApp Business Cloud API.
 *
 * Used for alerts to the business's own team (a customer needs a person). WhatsApp only
 * lets a business start a conversation with an approved message template, so alerts are
 * sent as a template with the details filled in.
 *
 * Configured with WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID (see .env.example).
 * When they are not set nothing is sent: the alert is printed to the server log instead,
 * the same way email behaves without an SMTP server.
 */

export const whatsappConfigured = () => Boolean(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);

/** "+971 50 123 4567" to "971501234567", the form the API expects. */
export const whatsappRecipient = (phone: string) => phone.replace(/\D/g, "");

/** Template variables may not contain line breaks, tabs or runs of spaces, and must not be empty. */
const templateText = (value: string) => value.replace(/\s+/g, " ").trim().slice(0, 500) || "–";

/**
 * Send one template message. `params` fill the template body's {{1}}, {{2}}, … in order.
 * Returns whether WhatsApp accepted it; never throws.
 */
export async function sendWhatsAppTemplate(to: string, template: string, languageCode: string, params: string[]): Promise<boolean> {
  if (!whatsappConfigured()) {
    console.log(`[whatsapp] not configured; would send "${template}" to ${to}: ${params.map(templateText).join(" | ")}`);
    return false;
  }
  const version = process.env.WHATSAPP_API_VERSION || "v21.0";
  try {
    const res = await fetch(`https://graph.facebook.com/${version}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: whatsappRecipient(to),
        type: "template",
        template: {
          name: template,
          language: { code: languageCode },
          components: [{ type: "body", parameters: params.map((text) => ({ type: "text", text: templateText(text) })) }],
        },
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      console.error(`[whatsapp] "${template}" to ${to} was refused (${res.status}): ${(await res.text()).slice(0, 300)}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`[whatsapp] "${template}" to ${to} failed`, err);
    return false;
  }
}
