import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CatalogFilters, type CatalogFacetGroup, type CatalogFilterOption } from "@/components/catalog-filters";
import { JsonLd } from "@/components/json-ld";
import { ResourceCard } from "@/components/resource-card";
import { SearchBox } from "@/components/search-box";
import { TopicFilterBar } from "@/components/topic-filter-bar";
import { CATEGORY_INFO, CATEGORY_INFO_EN } from "@/data/resources";
import { browseLabel, getCategoryTaxonomy, getTaxonomyLabel } from "@/data/taxonomy";
import { catalogHref, readQueryValue, readQueryValues, type CatalogQuery } from "@/lib/catalog-query";
import { allHosts, allSubtypes, categorySlugs, filterResources, isCategorySlug, resourceHref } from "@/lib/resources";
import type { ResourceFacetKey } from "@/lib/types";
import { absoluteUrl, breadcrumbJsonLd, SITE_NAME } from "@/lib/seo";
import { getCatalogResources, getCatalogTaxonomy } from "@/server/catalog";
import { getRequestLocale } from "@/lib/server-locale";
import { localizedAlternates, localizedPath } from "@/lib/i18n";

export function generateStaticParams() { return categorySlugs.map((category) => ({ category })); }

type CategoryPageProps = {
  params: Promise<{ category: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  if (!isCategorySlug(category)) return {};
  const locale = await getRequestLocale();
  const zh = locale === "zh";
  const info = (zh ? CATEGORY_INFO : CATEGORY_INFO_EN)[category];
  const title = zh ? `${info.label}：精选 GitHub AI Agent 资源` : `${info.label}: Curated GitHub Resources for AI Agents`;
  const description = zh ? `${info.description}。浏览 AgentMatter 精选的 GitHub ${info.label} 开源项目、核心能力、更新状态与使用说明。` : `${info.description}. Explore curated GitHub projects, capabilities, update information, and practical usage guidance.`;
  return {
    title,
    description,
    keywords: [info.label, `${info.label} GitHub`, zh ? "AI Agent 资源" : "AI Agent resources", zh ? "开源项目" : "open-source projects"],
    alternates: localizedAlternates(`/${category}`, locale),
    openGraph: { type: "website", locale: zh ? "zh_CN" : "en_US", siteName: SITE_NAME, url: localizedPath(`/${category}`, locale), title, description },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { category } = await params;
  const query = await searchParams;
  if (!isCategorySlug(category)) notFound();
  const locale = await getRequestLocale();
  const zh = locale === "zh";
  const host = readQueryValue(query.host);
  const subtype = readQueryValue(query.subtype);
  const topic = readQueryValue(query.topic);
  const sort = readQueryValue(query.sort) === "updated" ? "updated" : "stars";
  const info = (zh ? CATEGORY_INFO : CATEGORY_INFO_EN)[category];
  const [resources, taxonomyConfig] = await Promise.all([getCatalogResources(locale), getCatalogTaxonomy()]);
  const taxonomy = getCategoryTaxonomy(category, taxonomyConfig);
  const categoryResources = filterResources({ category }, resources);
  const selectedFacets = Object.fromEntries(taxonomy.facets.map((facet) => [facet.key, readQueryValues(query[facet.key])]).filter(([, values]) => values.length)) as Partial<Record<ResourceFacetKey, string[]>>;
  const current: CatalogQuery = { ...(host ? { host } : {}), ...(subtype ? { subtype } : {}), ...(topic ? { topic } : {}), ...(sort === "updated" ? { sort } : {}), ...selectedFacets };
  const basePath = localizedPath(`/${category}`, locale);
  const filtered = filterResources({ category, host, subtype, topic, facets: selectedFacets }, resources).sort((left, right) => sort === "updated" ? Date.parse(right.updatedAt) - Date.parse(left.updatedAt) : right.stars - left.stars);
  const topicBaseCount = filterResources({ category, host, subtype, facets: selectedFacets }, resources).length;
  const topicOptions = taxonomy.topics.map((item) => ({ slug: item.slug, label: item.label[locale], count: filterResources({ category, host, subtype, topic: item.slug, facets: selectedFacets }, resources).length })).filter((item) => item.count > 0 || item.slug === topic);

  const hostOptions: CatalogFilterOption[] = allHosts(category, resources).map((value) => ({ value, count: filterResources({ category, host: value, subtype, topic, facets: selectedFacets }, resources).length })).filter((item) => item.count > 0 || item.value === host);
  const subtypeOptions: CatalogFilterOption[] = allSubtypes(category, resources).map((value) => ({ value, count: filterResources({ category, host, subtype: value, topic, facets: selectedFacets }, resources).length })).filter((item) => item.count > 0 || item.value === subtype);
  const facetGroups: CatalogFacetGroup[] = taxonomy.facets.map((facet) => {
    const otherFacets = { ...selectedFacets };
    delete otherFacets[facet.key];
    return {
      key: facet.key,
      label: facet.label[locale],
      options: facet.options.map((option) => ({ value: option.slug, label: option.label[locale], count: filterResources({ category, host, subtype, topic, facets: { ...otherFacets, [facet.key]: [option.slug] } }, resources).length })).filter((option) => option.count > 0 || selectedFacets[facet.key]?.includes(option.value)),
    };
  }).filter((facet) => facet.options.length > 0);

  const categoryJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${info.label} GitHub 资源`,
    description: info.description,
    url: absoluteUrl(basePath),
    numberOfItems: categoryResources.length,
    itemListElement: categoryResources.map((resource, index) => ({ "@type": "ListItem", position: index + 1, name: resource.name, url: absoluteUrl(resourceHref(resource, locale)) })),
  };

  const activePills: Array<{ key: string; label: string; href: string }> = [];
  if (topic) activePills.push({ key: `topic-${topic}`, label: getTaxonomyLabel(category, "topic", topic, locale, taxonomyConfig), href: catalogHref(basePath, current, { topic: undefined }) });
  if (host) activePills.push({ key: `host-${host}`, label: `${zh ? "平台" : "Platform"}: ${host}`, href: catalogHref(basePath, current, { host: undefined }) });
  if (subtype) activePills.push({ key: `subtype-${subtype}`, label: `${zh ? "形态" : "Format"}: ${subtype}`, href: catalogHref(basePath, current, { subtype: undefined }) });
  Object.entries(selectedFacets).forEach(([facetKey, values]) => values.forEach((value) => activePills.push({ key: `${facetKey}-${value}`, label: getTaxonomyLabel(category, facetKey as ResourceFacetKey, value, locale, taxonomyConfig), href: catalogHref(basePath, current, { [facetKey]: values.filter((item) => item !== value) }) })));

  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: zh ? "首页" : "Home", path: localizedPath("/", locale) }, { name: info.label, path: basePath }])} />
      <JsonLd data={categoryJsonLd} />
      <section className="catalog-hero mockup-catalog-hero">
        <div className="wide-shell">
          <div className="breadcrumb"><Link href={localizedPath("/", locale)}>{zh ? "首页" : "Home"}</Link><span>/</span><span>{info.label}</span></div>
          <div className="catalog-hero-grid"><div><h1>{info.label}</h1><p>{info.description}</p></div><SearchBox locale={locale} /></div>
          <TopicFilterBar basePath={basePath} current={current} currentTopic={topic} label={browseLabel(category, locale, taxonomyConfig)} topics={topicOptions} total={topicBaseCount} locale={locale} />
        </div>
      </section>
      <section className="catalog-workspace">
        <div className="wide-shell catalog-layout category-layout">
          <CatalogFilters basePath={basePath} current={current} hosts={hostOptions} subtypes={subtypeOptions} facets={facetGroups} locale={locale} />
          <div className="catalog-results">
            <div className="results-toolbar">
              <div><strong>{zh ? `找到 ${filtered.length} 个${info.label}` : `${filtered.length} ${info.label}`}</strong>{activePills.map((pill) => <Link className="active-filter" href={pill.href} key={pill.key}>{pill.label}<span aria-hidden="true">×</span></Link>)}{activePills.length ? <Link href={basePath}>{zh ? "清除全部" : "Clear all"}</Link> : null}</div>
              <div className="sort-links"><span>{zh ? "排序" : "Sort"}</span><Link className={sort === "stars" ? "active" : ""} href={catalogHref(basePath, current, { sort: undefined })}>{zh ? "热门优先" : "Popular"}</Link><Link className={sort === "updated" ? "active" : ""} href={catalogHref(basePath, current, { sort: "updated" })}>{zh ? "最近更新" : "Latest"}</Link></div>
            </div>
            {filtered.length ? <div className="catalog-resource-grid">{filtered.map((resource) => <ResourceCard key={resource.id} resource={resource} variant="catalog" locale={locale} taxonomyConfig={taxonomyConfig} />)}</div> : <div className="empty-state"><strong>{zh ? "没有符合条件的资源" : "No matching resources"}</strong><p>{zh ? "尝试移除部分筛选，或提交一个 GitHub 项目。" : "Remove some filters or submit a GitHub project."}</p><Link className="button button-primary" href={localizedPath("/submit", locale)}>{zh ? "提交项目" : "Submit a project"}</Link></div>}
          </div>
        </div>
      </section>
    </>
  );
}
