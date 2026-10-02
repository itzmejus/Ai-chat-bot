import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Widget tokens.
 *
 * The chat iframe receives a signed token when it loads (only after the domain
 * whitelist check passes). Every public chat API call must present it, so the
 * API cannot be used for a workspace without first loading that workspace's
 * widget. Tokens are stateless: an HMAC over a small JSON payload.
 */

export type WidgetTokenPayload = {
  /** Workspace id. */
  w: string;
  /** True for the dashboard preview: conversations are flagged as tests. */
  preview: boolean;
  /**
   * Preview tokens only: the origin of the dashboard page that will frame the preview.
   * It is part of the signed payload, so it cannot be changed by whoever holds the token.
   */
  origin?: string;
  /** Expiry, in seconds since the epoch. */
  exp: number;
};

const TOKEN_TTL_SECONDS = 12 * 60 * 60;

function secret(): string {
  const value = process.env.NEXTAUTH_SECRET;
  if (!value) throw new Error("NEXTAUTH_SECRET is not set");
  return value;
}

const sign = (body: string) => createHmac("sha256", secret()).update(`widget:${body}`).digest("base64url");

export function createWidgetToken(workspaceId: string, opts: { preview?: boolean; origin?: string; ttlSeconds?: number } = {}): string {
  const payload: WidgetTokenPayload = {
    w: workspaceId,
    preview: opts.preview ?? false,
    ...(opts.origin ? { origin: opts.origin } : {}),
    exp: Math.floor(Date.now() / 1000) + (opts.ttlSeconds ?? TOKEN_TTL_SECONDS),
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

/** Returns the payload, or null if the token is malformed, forged or expired. */
export function verifyWidgetToken(token: string | null | undefined): WidgetTokenPayload | null {
  if (!token) return null;
  const [body, signature, extra] = token.split(".");
  if (!body || !signature || extra !== undefined) return null;

  const expected = Buffer.from(sign(body));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as WidgetTokenPayload;
    if (typeof payload.w !== "string" || typeof payload.exp !== "number") return null;
    if (payload.exp < Date.now() / 1000) return null;
    return {
      w: payload.w,
      preview: payload.preview === true,
      ...(typeof payload.origin === "string" ? { origin: payload.origin } : {}),
      exp: payload.exp,
    };
  } catch {
    return null;
  }
}
