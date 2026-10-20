import { beforeEach, describe, expect, it, vi } from "vitest";

const request = vi.hoisted(() => ({ host: "www.example.com" }));
vi.mock("next/headers", () => ({ headers: async () => new Headers({ host: request.host }) }));

import robots, { NAMED_BOTS, PRIVATE_PATHS } from "@/app/robots";

beforeEach(() => {
  request.host = "www.example.com";
});

describe("robots.txt", () => {
  it("lets every crawler, and the named AI and search bots, read the public site", async () => {
    const result = await robots();
    const rules = [result.rules].flat();
    expect(rules).toHaveLength(2);
    for (const rule of rules) {
      expect(rule.allow).toBe("/");
      expect(rule.disallow).toEqual(PRIVATE_PATHS);
      expect(rule.disallow).not.toContain("/");
    }
    expect(rules[0].userAgent).toEqual(NAMED_BOTS);
    expect(NAMED_BOTS).toEqual(expect.arrayContaining(["OAI-SearchBot", "ChatGPT-User", "Claude-SearchBot", "Claude-User", "PerplexityBot", "Googlebot", "Bingbot"]));
    expect(rules[1].userAgent).toBe("*");
    expect(result.sitemap).toBe("https://www.example.com/sitemap.xml");
  });

  it("keeps the private areas closed", () => {
    for (const path of ["/dashboard", "/admin", "/api/", "/login", "/onboarding"]) expect(PRIVATE_PATHS).toContain(path);
  });

  it("closes the app and widget hostnames entirely", async () => {
    request.host = "chat.example.com";
    expect((await robots()).rules).toEqual({ userAgent: "*", disallow: "/" });
  });
});
