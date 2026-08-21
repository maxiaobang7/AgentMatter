import type { Metadata } from "next";
import Link from "next/link";
import { MatterBlueprint } from "@/components/matter-blueprint";
import { ResourceCard } from "@/components/resource-card";
import { SearchBox } from "@/components/search-box";
import { CATEGORY_INFO, CATEGORY_INFO_EN } from "@/data/resources";
import { categoryCounts, categorySlugs } from "@/lib/resources";
import { getCatalogResources, getCatalogTaxonomy } from "@/server/catalog";
import type { CategorySlug, Resource } from "@/lib/types";
import styles from "./home.module.css";
import { getRequestLocale } from "@/lib/server-locale";
import { localizedAlternates, localizedPath } from "@/lib/i18n";

const HOME_RESOURCE_LIMIT = 18;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return {
    title: { absolute: locale === "zh" ? "AgentMatter — AI Agent 组件库" : "AgentMatter — Open-source AI Agent Resources" },
    description: locale === "zh" ? "发现和使用来自 GitHub 的 Skills、DSH 插件、Agent 插件、MCP 服务器与 Prompt 开源资源。" : "Discover open-source Skills, DSH plugins, Agent plugins, MCP servers, and Prompts from GitHub.",
    alternates: localizedAlternates("/", locale),
  };
}

function selectRecommendedResources(resources: Resource[], limit = HOME_RESOURCE_LIMIT) {
  const resourcesByCategory = new Map<CategorySlug, Resource[]>(
    categorySlugs.map((category) => [
      category,
      resources.filter((resource) => resource.category === category).sort((left, right) => right.stars - left.stars),
    ]),
  );
  const selected: Resource[] = [];

  for (let index = 0; selected.length < limit; index += 1) {
    let foundResource = false;

    for (const category of categorySlugs) {
      const resource = resourcesByCategory.get(category)?.[index];
      if (!resource) continue;
      selected.push(resource);
      foundResource = true;
      if (selected.length === limit) break;
    }

    if (!foundResource) break;
  }

  return selected;
}

export default async function Home({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams;
  const locale = await getRequestLocale();
  const zh = locale === "zh";
  const categoryInfo = zh ? CATEGORY_INFO : CATEGORY_INFO_EN;
  const [resources, taxonomyConfig] = await Promise.all([getCatalogResources(locale), getCatalogTaxonomy()]);
  const counts = categoryCounts(resources);
  const recommended = selectRecommendedResources(resources);
  const sort = query.sort === "stars" || query.sort === "updated" ? query.sort : undefined;
  const featured = sort
    ? [...resources].sort((left, right) => sort === "updated" ? Date.parse(right.updatedAt) - Date.parse(left.updatedAt) : right.stars - left.stars).slice(0, HOME_RESOURCE_LIMIT)
    : recommended;
  const homeHref = (next: { sort?: "stars" | "updated" }) => {
    const params = new URLSearchParams();
    if (next.sort) params.set("sort", next.sort);
    const value = params.toString();
    return value ? `${localizedPath("/", locale)}?${value}` : localizedPath("/", locale);
  };
  const total = resources.length;

  return (
    <div className={styles.homepage}>
      <section className={styles.hero}>
        <div className={styles.heroDots} aria-hidden="true" />
        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <p className={styles.heroEyebrow}>{zh ? "开源 AI Agent 资源库" : "Open-source AI agent resources"}</p>
            <h1 aria-label="AgentMatter">
              <span>Agent</span><span className={styles.heroWordMatter}>Matter</span><i className={styles.heroBrandMark} aria-hidden="true" />
            </h1>
            <p className={`${styles.heroPromise}${zh ? "" : ` ${styles.heroPromiseSingleLine}`}`}>{zh ? "构建更强 AI Agent 的关键组件" : "The building blocks for better AI agents."}</p>
            <p className={`${styles.heroChinese}${zh ? "" : ` ${styles.heroDescriptionSingleLine}`}`}>{zh ? "精选来自 GitHub 的 Skills、插件、MCP 服务器与 Prompts" : "Curated Skills, plugins, MCP servers, and prompts from GitHub."}</p>
            <div className={styles.heroSearch}>
              <SearchBox locale={locale} />
            </div>
          </div>
          <MatterBlueprint className={styles.blueprint} locale={locale} />
        </div>
      </section>

      <section className={styles.catalog} aria-labelledby="catalog-title">
        <div className={styles.catalogInner}>
          <h2 className="sr-only" id="catalog-title">{zh ? "精选 AI Agent 资源" : "Curated AI Agent resources"}</h2>
          <div className={styles.catalogToolbar}>
            <nav className={styles.categoryTabs} aria-label={zh ? "按资源类型浏览" : "Browse by resource type"}>
              <Link className={styles.activeTab} href={localizedPath("/search", locale)}><span>{zh ? "全部" : "All"}</span><b>{total}</b></Link>
              {categorySlugs.map((category) => (
                <Link key={category} href={localizedPath(`/${category}`, locale)}><span>{categoryInfo[category].label}</span><b>{counts[category]}</b></Link>
              ))}
            </nav>
            <div className={styles.toolbarActions}>
              <details className={styles.toolbarMenu}>
                <summary className={sort ? styles.activeControl : ""}><span aria-hidden="true">↕</span> {sort === "updated" ? (zh ? "最近更新" : "Latest") : sort === "stars" ? "Stars" : (zh ? "排序" : "Sort")}</summary>
                <div className={styles.toolbarDropdown}><strong>{zh ? "资源排序" : "Sort resources"}</strong><Link className={!sort ? styles.selectedOption : ""} href={homeHref({})}>{zh ? "精选推荐" : "Curated"}</Link><Link className={sort === "stars" ? styles.selectedOption : ""} href={homeHref({ sort: "stars" })}>Stars</Link><Link className={sort === "updated" ? styles.selectedOption : ""} href={homeHref({ sort: "updated" })}>{zh ? "最近更新" : "Latest updates"}</Link></div>
              </details>
            </div>
          </div>

          {sort ? <div className={styles.catalogState}><span>{zh ? `当前排序：${sort === "updated" ? "最近更新" : "Stars"}` : `Sorted by: ${sort === "updated" ? "Latest updates" : "Stars"}`}</span><Link href={localizedPath("/", locale)}>{zh ? "恢复默认" : "Reset"}</Link></div> : null}

          <div className={styles.resourceGrid}>{featured.map((resource) => <ResourceCard key={resource.id} resource={resource} variant="catalog" locale={locale} taxonomyConfig={taxonomyConfig} />)}</div>

          <div className={styles.catalogMore}>
            <Link href={localizedPath("/search", locale)}>{zh ? `查看全部 ${total} 个资源` : `View all ${total} resources`} <span aria-hidden="true">→</span></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
