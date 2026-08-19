import type { Metadata } from "next";

type SiteIntegrationEnvironment = Record<string, string | undefined>;

const baiduAnalyticsIdPattern = /^[a-f0-9]{32}$/i;

function optionalValue(value: string | undefined) {
  return value?.trim() || undefined;
}

export function getBaiduAnalyticsId(environment: SiteIntegrationEnvironment = process.env) {
  const value = optionalValue(environment.NEXT_PUBLIC_BAIDU_ANALYTICS_ID);
  return value && baiduAnalyticsIdPattern.test(value) ? value : undefined;
}

export function buildSiteVerification(environment: SiteIntegrationEnvironment = process.env): Metadata["verification"] {
  const google = optionalValue(environment.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION);
  const baidu = optionalValue(environment.NEXT_PUBLIC_BAIDU_SITE_VERIFICATION);
  const bing = optionalValue(environment.NEXT_PUBLIC_BING_SITE_VERIFICATION);
  const other = {
    ...(baidu ? { "baidu-site-verification": baidu } : {}),
    ...(bing ? { "msvalidate.01": bing } : {}),
  };

  if (!google && !Object.keys(other).length) return undefined;
  return {
    ...(google ? { google } : {}),
    ...(Object.keys(other).length ? { other } : {}),
  };
}
