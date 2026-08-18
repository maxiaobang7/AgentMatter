import { describe, expect, it } from "vitest";
import { localeFromPathname, localizedAlternates, localizedPath, stripLocalePrefix } from "@/lib/i18n";

describe("public locale paths", () => {
  it("uses English for unprefixed paths and Chinese for /zh", () => {
    expect(localeFromPathname("/skills")).toBe("en");
    expect(localeFromPathname("/zh/skills")).toBe("zh");
    expect(stripLocalePrefix("/zh")).toBe("/");
    expect(stripLocalePrefix("/zh/resource/owner/repo")).toBe("/resource/owner/repo");
  });

  it("switches the same path while preserving query and hash", () => {
    expect(localizedPath("/resource/owner/repo?component=skills#install", "zh")).toBe("/zh/resource/owner/repo?component=skills#install");
    expect(localizedPath("/zh/search?q=mcp", "en")).toBe("/search?q=mcp");
  });

  it("builds reciprocal SEO alternates", () => {
    expect(localizedAlternates("/mcp")).toEqual({ canonical: "/mcp", languages: { en: "/mcp", "zh-Hans": "/zh/mcp", "x-default": "/mcp" } });
    expect(localizedAlternates("/mcp", "zh").canonical).toBe("/zh/mcp");
  });
});
