import type { Metadata } from "next";
import Script from "next/script";
import "@fontsource-variable/archivo";
import "@fontsource-variable/inter";
import "./globals.css";
import "./mockups.css";
import "./admin.css";
import "./admin-seo.css";
import "./admin-submissions.css";
import "./language.css";
import { JsonLd } from "@/components/json-ld";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { absoluteUrl, getSiteUrl, SITE_DESCRIPTION, SITE_KEYWORDS, SITE_NAME, SITE_TITLE } from "@/lib/seo";
import { getRequestLocale } from "@/lib/server-locale";

const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;
const themeInitializationScript = `
  (() => {
    try {
      const savedTheme = localStorage.getItem("agentmatter-theme");
      const theme = savedTheme === "dark" ? "dark" : "light";
      document.documentElement.dataset.theme = theme;
      document.documentElement.style.colorScheme = theme;
    } catch (_) {
      document.documentElement.dataset.theme = "light";
    }
  })();
`;

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: SITE_TITLE,
    template: "%s | AgentMatter",
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: SITE_KEYWORDS,
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "technology",
  referrer: "origin-when-cross-origin",
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: "/",
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  ...(googleVerification ? { verification: { google: googleVerification } } : {}),
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await getRequestLocale();
  const localizedDescription = locale === "zh" ? "发现和使用来自 GitHub 的 Skills、DSH 插件、Agent 插件、MCP 服务器与 Prompt 开源资源。" : SITE_DESCRIPTION;
  const siteJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${getSiteUrl()}/#organization`,
        name: SITE_NAME,
        url: getSiteUrl(),
        logo: absoluteUrl("/brand/agentmatter-mark.svg"),
        description: localizedDescription,
      },
      {
        "@type": "WebSite",
        "@id": `${getSiteUrl()}/#website`,
        url: getSiteUrl(),
        name: SITE_NAME,
        alternateName: "AI Agent 组件库",
        description: localizedDescription,
        publisher: { "@id": `${getSiteUrl()}/#organization` },
        inLanguage: locale === "zh" ? "zh-CN" : "en",
        potentialAction: {
          "@type": "SearchAction",
          target: `${getSiteUrl()}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <html lang={locale === "zh" ? "zh-CN" : "en"} data-theme="light" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body>
        <Script id="agentmatter-theme" strategy="beforeInteractive">{themeInitializationScript}</Script>
        <JsonLd data={siteJsonLd} />
        <a className="skip-link" href="#main-content">{locale === "zh" ? "跳到主要内容" : "Skip to main content"}</a>
        <SiteHeader locale={locale} />
        <main id="main-content">{children}</main>
        <SiteFooter locale={locale} />
      </body>
    </html>
  );
}
