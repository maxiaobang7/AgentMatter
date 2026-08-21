import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { ResourceDetail } from "@/components/resource-detail";
import { StandalonePromptDetail } from "@/components/standalone-prompt-detail";
import { CATEGORY_INFO, CATEGORY_INFO_EN } from "@/data/resources";
import { githubHref, resourceHref } from "@/lib/resources";
import { absoluteUrl, breadcrumbJsonLd, getSiteUrl, resourceCanonicalUrl, resourceSeoDescription, resourceSeoKeywords, resourceSeoTitle, SITE_NAME } from "@/lib/seo";
import { getCatalogResource } from "@/server/catalog";
import { getRequestLocale } from "@/lib/server-locale";
import { localizedAlternates, localizedPath } from "@/lib/i18n";
import { getStandalonePrompt } from "@/lib/prompt-detail";

type ResourcePageProps = {
  params: Promise<{ owner: string; repo: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params, searchParams }: ResourcePageProps): Promise<Metadata> {
  const { owner, repo } = await params;
  const query = await searchParams;
  const locale = await getRequestLocale();
  const component = typeof query.component === "string" ? query.component : undefined;
  const resource = await getCatalogResource(owner, repo, component, locale);
  if (!resource) return {};
  const title = resourceSeoTitle(resource, locale);
  const socialTitle = `${title} | ${SITE_NAME}`;
  const description = resourceSeoDescription(resource, locale);
  const canonicalPath = resourceHref(resource);
  const media = resource.detail.media?.[0];
  const socialImage = media ? { url: absoluteUrl(media.src), width: media.width, height: media.height, alt: media.alt } : { url: absoluteUrl("/opengraph-image"), width: 1200, height: 630, alt: `${resource.name} | AgentMatter` };
  return {
    title,
    description,
    keywords: resourceSeoKeywords(resource, locale),
    alternates: localizedAlternates(canonicalPath, locale),
    openGraph: { type: "website", locale: locale === "zh" ? "zh_CN" : "en_US", siteName: SITE_NAME, url: resourceCanonicalUrl(resource, locale), title: socialTitle, description, images: [socialImage] },
    twitter: { card: "summary_large_image", title: socialTitle, description, images: [socialImage.url] },
  };
}

export default async function ResourcePage({ params, searchParams }: ResourcePageProps) {
  const { owner, repo } = await params;
  const query = await searchParams;
  const locale = await getRequestLocale();
  const component = typeof query.component === "string" ? query.component : undefined;
  const resource = await getCatalogResource(owner, repo, component, locale);
  if (!resource) notFound();
  const category = (locale === "zh" ? CATEGORY_INFO : CATEGORY_INFO_EN)[resource.category];
  const standalonePrompt = getStandalonePrompt(resource);
  const resourceJsonLd = standalonePrompt ? {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "@id": `${resourceCanonicalUrl(resource, locale)}#prompt`,
    name: resource.name,
    description: resource.summary,
    text: standalonePrompt.text,
    url: resourceCanonicalUrl(resource, locale),
    isBasedOn: standalonePrompt.sourceUrl,
    dateModified: resource.updatedAt,
    inLanguage: locale === "zh" ? "zh-CN" : "en",
    keywords: resourceSeoKeywords(resource, locale).join(", "),
    isPartOf: { "@id": `${getSiteUrl()}/#website` },
  } : {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    "@id": `${resourceCanonicalUrl(resource, locale)}#software`,
    name: resource.name,
    description: resource.summary,
    url: resourceCanonicalUrl(resource, locale),
    codeRepository: githubHref(resource),
    programmingLanguage: resource.language,
    license: resource.license,
    dateModified: resource.updatedAt,
    applicationCategory: category.label,
    runtimePlatform: resource.compatibilities.map((item) => item.host).join(", "),
    keywords: resourceSeoKeywords(resource, locale).join(", "),
    isPartOf: { "@id": `${getSiteUrl()}/#website` },
  };
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([
        { name: locale === "zh" ? "首页" : "Home", path: localizedPath("/", locale) },
        { name: category.label, path: localizedPath(`/${resource.category}`, locale) },
        { name: resource.name, path: resourceCanonicalUrl(resource, locale) },
      ])} />
      <JsonLd data={resourceJsonLd} />
      {standalonePrompt
        ? <StandalonePromptDetail resource={resource} prompt={standalonePrompt} locale={locale} />
        : <ResourceDetail resource={resource} locale={locale} />}
    </>
  );
}
