import type { Metadata } from "next";
import Link from "next/link";
import { CatalogFilters, type CatalogFilterOption } from "@/components/catalog-filters";
import { ResourceCard } from "@/components/resource-card";
import { SearchBox } from "@/components/search-box";
import { CATEGORY_INFO, CATEGORY_INFO_EN } from "@/data/resources";
import { catalogHref, readQueryValue, type CatalogQuery } from "@/lib/catalog-query";
import { allHosts, categorySlugs, isCategorySlug, searchResources } from "@/lib/resources";
import type { CategorySlug } from "@/lib/types";
import { getCatalogResources, getCatalogTaxonomy } from "@/server/catalog";
import { getRequestLocale } from "@/lib/server-locale";
import { localizedAlternates, localizedPath } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return { title: locale === "zh" ? "搜索 AI Agent 资源" : "Search AI Agent Resources", description: locale === "zh" ? "搜索 AgentMatter 收录的 GitHub Skills、插件、MCP 服务器与 Prompt 资源。" : "Search GitHub Skills, plugins, MCP servers, and Prompt resources curated by AgentMatter.", alternates: localizedAlternates("/search", locale), robots: { index: false, follow: true } };
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const locale = await getRequestLocale();
  const zh = locale === "zh";
  const categoryInfo = zh ? CATEGORY_INFO : CATEGORY_INFO_EN;
  const q = readQueryValue(params.q) ?? "";
  const categoryParam = readQueryValue(params.category);
  const category = categoryParam && isCategorySlug(categoryParam) ? categoryParam : undefined;
  const host = readQueryValue(params.host);
  const [resources, taxonomyConfig] = await Promise.all([getCatalogResources(locale), getCatalogTaxonomy()]);
  const allHits = searchResources(q, undefined, resources, locale);
  const distribution = categorySlugs.reduce<Record<CategorySlug, number>>((result, slug) => { result[slug] = allHits.filter((hit) => hit.resource.category === slug).length; return result; }, {} as Record<CategorySlug, number>);
  const hits = allHits.filter((hit) => (!category || hit.resource.category === category) && (!host || hit.resource.compatibilities.some((item) => item.host === host)));
  const current: CatalogQuery = { ...(q ? { q } : {}), ...(category ? { category } : {}), ...(host ? { host } : {}) };
  const basePath = localizedPath("/search", locale);
  const tabHref = (value?: CategorySlug) => catalogHref(basePath, current, { category: value });
  const hostOptions: CatalogFilterOption[] = allHosts(category, resources).map((value) => ({ value, count: allHits.filter((hit) => (!category || hit.resource.category === category) && hit.resource.compatibilities.some((item) => item.host === value)).length })).filter((item) => item.count > 0 || item.value === host);

  return (
    <>
      <section className="search-hero mockup-search-hero"><div className="wide-shell"><div className="breadcrumb"><Link href={localizedPath("/", locale)}>{zh ? "首页" : "Home"}</Link><span>/</span><span>{zh ? "搜索" : "Search"}</span></div><SearchBox initialValue={q} locale={locale} /><h1>{q ? (zh ? <>“{q}”的搜索结果</> : <>Search results for “{q}”</>) : (zh ? "浏览全部资源" : "Browse all resources")}</h1><p>{zh ? `找到 ${hits.length} 个 GitHub 资源` : `${hits.length} GitHub resources found`}</p><div className="result-tabs"><Link className={!category ? "active" : ""} href={tabHref()}>{zh ? "全部" : "All"} <b>{allHits.length}</b></Link>{categorySlugs.map((slug) => <Link className={category === slug ? "active" : ""} key={slug} href={tabHref(slug)}>{categoryInfo[slug].label} <b>{distribution[slug]}</b></Link>)}</div></div></section>
      <section className="catalog-workspace search-workspace"><div className="wide-shell catalog-layout search-layout"><CatalogFilters basePath={basePath} current={current} hosts={hostOptions} mode="search" locale={locale} /><div className="catalog-results"><div className="results-toolbar"><div><strong>{zh ? `找到 ${hits.length} 个资源` : `${hits.length} resources`}</strong>{q ? <Link className="active-filter" href={catalogHref(basePath, current, { q: undefined })}>{zh ? "关键词" : "Keyword"}：{q}<span aria-hidden="true">×</span></Link> : null}{category ? <Link className="active-filter" href={catalogHref(basePath, current, { category: undefined })}>{categoryInfo[category].label}<span aria-hidden="true">×</span></Link> : null}{host ? <Link className="active-filter" href={catalogHref(basePath, current, { host: undefined })}>{host}<span aria-hidden="true">×</span></Link> : null}{category || host ? <Link href={catalogHref(basePath, current, { category: undefined, host: undefined })}>{zh ? "清除筛选" : "Clear filters"}</Link> : null}</div></div>{hits.length ? <div className="catalog-resource-grid search-resource-grid">{hits.map((hit) => <ResourceCard key={hit.resource.id} resource={hit.resource} reasons={q ? hit.reasons : undefined} variant="catalog" locale={locale} taxonomyConfig={taxonomyConfig} />)}</div> : <div className="empty-state"><strong>{zh ? "没有找到目标" : "No matching resources"}</strong><p>{zh ? "可以搜索仓库名、能力、平台，或直接提交 GitHub 地址。" : "Search by repository, capability, or platform, or submit a GitHub URL."}</p><Link className="button button-signal" href={localizedPath("/submit", locale)}>{zh ? "提交 GitHub 仓库" : "Submit a GitHub repository"}</Link></div>}</div></div></section>
    </>
  );
}
