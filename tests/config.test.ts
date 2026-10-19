import { describe, expect, it } from "vitest";
import { urlSetting } from "@/lib/config";

describe("address settings", () => {
  it("accepts an address however it was pasted", () => {
    expect(urlSetting("APP_URL", "https://www.assist.siteselo.com", "x")).toBe("https://www.assist.siteselo.com");
    expect(urlSetting("APP_URL", "https://www.assist.siteselo.com/", "x")).toBe("https://www.assist.siteselo.com");
    expect(urlSetting("APP_URL", "  www.assist.siteselo.com  ", "x")).toBe("https://www.assist.siteselo.com");
    expect(urlSetting("APP_URL", '"https://www.assist.siteselo.com"', "x")).toBe("https://www.assist.siteselo.com");
    expect(urlSetting("APP_URL", "http://localhost:3000", "x")).toBe("http://localhost:3000");
  });

  it("falls back when the setting is empty", () => {
    expect(urlSetting("SITE_URL", undefined, "https://app.example.com")).toBe("https://app.example.com");
    expect(urlSetting("SITE_URL", '  ""  ', "https://app.example.com")).toBe("https://app.example.com");
  });

  it("names the setting when the value is not an address", () => {
    expect(() => urlSetting("WIDGET_URL", "chat site", "x")).toThrow(/WIDGET_URL must be a web address.*"chat site"/);
    expect(() => urlSetting("APP_URL", "ftp://files.example.com", "x")).toThrow(/APP_URL/);
  });
});
