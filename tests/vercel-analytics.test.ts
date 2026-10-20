import { describe, expect, it } from "vitest";
import { redactPageView, redactVital } from "@/components/vercel-analytics";

const view = (url: string) => redactPageView({ type: "pageview", url }).url;

describe("Vercel Analytics and Speed Insights", () => {
  it("never sends one-time codes from invitation, reset and confirmation links", () => {
    expect(view("https://www.example.com/invite/abc123secret")).toBe("https://www.example.com/invite/[token]");
    expect(view("https://www.example.com/reset-password/abc123secret")).toBe("https://www.example.com/reset-password/[token]");
    expect(view("https://www.example.com/verify-email/abc123secret?next=/dashboard")).toBe("https://www.example.com/verify-email/[token]");
  });

  it("drops query strings and leaves ordinary pages as they are", () => {
    expect(view("https://www.example.com/dashboard/settings?billing=success")).toBe("https://www.example.com/dashboard/settings");
    expect(view("https://www.example.com/ar/pricing")).toBe("https://www.example.com/ar/pricing");
  });

  it("cleans speed measurements the same way, keeping the rest of the event", () => {
    const event = { type: "vital" as const, url: "https://www.example.com/invite/abc123secret?x=1", route: "/invite/[token]" };
    expect(redactVital(event)).toEqual({ type: "vital", url: "https://www.example.com/invite/[token]", route: "/invite/[token]" });
  });
});
