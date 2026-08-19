import Script from "next/script";
import { getBaiduAnalyticsId } from "@/lib/site-integrations";

export function SiteIntegrations() {
  const baiduAnalyticsId = getBaiduAnalyticsId();
  if (!baiduAnalyticsId) return null;

  const source = JSON.stringify(`https://hm.baidu.com/hm.js?${baiduAnalyticsId}`);
  const loader = `
    window._hmt = window._hmt || [];
    (() => {
      const script = document.createElement("script");
      script.src = ${source};
      script.async = true;
      document.head.appendChild(script);
    })();
  `;

  return <Script id="agentmatter-baidu-analytics" strategy="afterInteractive">{loader}</Script>;
}
