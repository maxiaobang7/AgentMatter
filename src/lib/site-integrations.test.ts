import { describe, expect, it } from "vitest";
import { buildSiteVerification, getBaiduAnalyticsId } from "@/lib/site-integrations";

describe("site integrations", () => {
  it("accepts a valid Baidu Analytics site id", () => {
    expect(getBaiduAnalyticsId({ NEXT_PUBLIC_BAIDU_ANALYTICS_ID: "a485b1bdb972bcdb91e8f3d328ed6790" })).toBe("a485b1bdb972bcdb91e8f3d328ed6790");
  });

  it("does not render an invalid Baidu Analytics site id", () => {
    expect(getBaiduAnalyticsId({ NEXT_PUBLIC_BAIDU_ANALYTICS_ID: "<script>" })).toBeUndefined();
  });

  it("builds Google, Baidu, and Bing verification metadata", () => {
    expect(buildSiteVerification({
      NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION: "google-token",
      NEXT_PUBLIC_BAIDU_SITE_VERIFICATION: "baidu-token",
      NEXT_PUBLIC_BING_SITE_VERIFICATION: "bing-token",
    })).toEqual({
      google: "google-token",
      other: {
        "baidu-site-verification": "baidu-token",
        "msvalidate.01": "bing-token",
      },
    });
  });

  it("omits verification metadata when no platform is configured", () => {
    expect(buildSiteVerification({})).toBeUndefined();
  });
});
