"use client";

import { useState } from "react";
import Link from "next/link";
import { CATEGORY_INFO, CATEGORY_INFO_EN } from "@/data/resources";
import { categorySlugs } from "@/lib/resources";
import { catalogHref, readQueryValues, toggleQueryValue, type CatalogQuery } from "@/lib/catalog-query";
import type { PublicLocale } from "@/lib/i18n";

export type CatalogFilterOption = { value: string; label?: string; count: number };
export type CatalogFacetGroup = { key: string; label: string; options: CatalogFilterOption[] };

export function CatalogFilters({ basePath, current, hosts, subtypes, facets = [], mode = "category", locale = "zh" }: { basePath: string; current: CatalogQuery; hosts: CatalogFilterOption[]; subtypes?: CatalogFilterOption[]; facets?: CatalogFacetGroup[]; mode?: "category" | "search"; locale?: PublicLocale }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showAllHosts, setShowAllHosts] = useState(false);
  const zh = locale === "zh";
  const categoryInfo = zh ? CATEGORY_INFO : CATEGORY_INFO_EN;
  const visibleHosts = showAllHosts ? hosts : hosts.slice(0, 5);
  const activeCount = Object.entries(current).filter(([key, value]) => !["q", "sort"].includes(key) && readQueryValues(value).length).reduce((count, [, value]) => count + readQueryValues(value).length, 0);
  const hasFilters = activeCount > 0;
  const hostFilters = (
    <details open>
      <summary>{zh ? "适用平台" : "Agent platform"}</summary>
      <div className="filter-options">
        <Link className={!current.host ? "selected" : ""} href={catalogHref(basePath, current, { host: undefined })}>{zh ? "全部" : "All"}</Link>
        {visibleHosts.map((host) => <Link className={current.host === host.value ? "selected" : ""} href={catalogHref(basePath, current, { host: host.value })} key={host.value}><span>{host.label ?? host.value}</span><b>{host.count}</b></Link>)}
        {hosts.length > 5 ? <button aria-expanded={showAllHosts} className="filter-more" onClick={() => setShowAllHosts((value) => !value)} type="button">{showAllHosts ? (zh ? "收起" : "Show less") : (zh ? "展开更多" : "Show more")}<span aria-hidden="true">⌄</span></button> : null}
      </div>
    </details>
  );

  return (
    <div className={`filter-panel ${mode === "search" ? "search-mode" : "category-mode"}${mobileOpen ? " mobile-open" : ""}`} aria-label={zh ? "筛选资源" : "Filter resources"}>
      <button aria-expanded={mobileOpen} className="mobile-filter-toggle" onClick={() => setMobileOpen((value) => !value)} type="button">
        <span>{zh ? "筛选资源" : "Filter resources"}{activeCount ? <b>{activeCount}</b> : null}</span>
        <span aria-hidden="true">{mobileOpen ? "−" : "+"}</span>
      </button>
      <div className="filter-panel-body">
        {mode === "search" ? (
          <aside className="filter-column">
            <div className="filter-title"><strong>{zh ? "筛选" : "Filters"}</strong>{hasFilters ? <Link href={catalogHref(basePath, current, { category: undefined, host: undefined, subtype: undefined })}>{zh ? "清除" : "Clear"}</Link> : null}</div>
            <details open><summary>{zh ? "资源类型" : "Resource type"}</summary><div className="filter-options">{categorySlugs.map((category) => <Link className={current.category === category ? "selected" : ""} href={catalogHref(basePath, current, { category })} key={category}>{categoryInfo[category].label}</Link>)}</div></details>
            {hostFilters}
          </aside>
        ) : (
          <aside className="filter-column">
            <div className="filter-title"><strong>{zh ? "筛选" : "Filters"}</strong>{hasFilters ? <Link href={basePath}>{zh ? "清除" : "Clear"}</Link> : null}</div>
            {hostFilters}
            {subtypes?.length ? <details open><summary>{zh ? "资源形态" : "Resource format"}</summary><div className="filter-options"><Link className={!current.subtype ? "selected" : ""} href={catalogHref(basePath, current, { subtype: undefined })}>{zh ? "全部" : "All"}</Link>{subtypes.map((subtype) => <Link className={current.subtype === subtype.value ? "selected" : ""} href={catalogHref(basePath, current, { subtype: subtype.value })} key={subtype.value}><span>{subtype.label ?? subtype.value}</span><b>{subtype.count}</b></Link>)}</div></details> : null}
            {facets.map((facet) => <details open key={facet.key}><summary>{facet.label}</summary><div className="filter-options">{facet.options.map((option) => { const selected = readQueryValues(current[facet.key]).includes(option.value); return <Link className={selected ? "selected" : ""} href={toggleQueryValue(basePath, current, facet.key, option.value)} key={option.value}><span>{option.label ?? option.value}</span><b>{option.count}</b></Link>; })}</div></details>)}
          </aside>
        )}
      </div>
    </div>
  );
}
