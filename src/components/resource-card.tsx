import Link from "next/link";
import Image from "next/image";
import { CATEGORY_INFO, CATEGORY_INFO_EN } from "@/data/resources";
import { formatRelativeDate, formatStars } from "@/lib/format";
import { canonicalIdentity, resourceHref } from "@/lib/resources";
import { resourceFacetBadges, resourceTopicLabel } from "@/data/taxonomy";
import type { Resource } from "@/lib/types";
import type { PublicLocale } from "@/lib/i18n";

const officialLabels = { platform: "平台官方", publisher: "发布者仓库", community: "社区项目" } as const;
const officialLabelsEn = { platform: "Official", publisher: "Publisher", community: "Community" } as const;

export function ResourceCard({ resource, reasons, compact = false, variant, locale = "zh" }: { resource: Resource; reasons?: string[]; compact?: boolean; variant?: "table" | "search" | "catalog"; locale?: PublicLocale }) {
  const metadataVerified = resource.verifications.some((item) => item.level === "metadata" && item.status === "verified");
  const zh = locale === "zh";
  const info = (zh ? CATEGORY_INFO : CATEGORY_INFO_EN)[resource.category];
  const kindLabels = zh ? officialLabels : officialLabelsEn;

  if (variant === "catalog") {
    const topic = resourceTopicLabel(resource, locale);
    const badges = [...resourceFacetBadges(resource, locale, 2), ...resource.compatibilities.map((item) => item.host)];
    const uniqueBadges = [...new Set(badges)].slice(0, 4);
    const initials = resource.name.split(/\s+/).slice(0, 2).map((word) => word[0]).join("").toUpperCase();

    return (
      <article className="catalog-resource-card" style={{ "--category-accent": info.accent } as React.CSSProperties}>
        <span className="catalog-card-avatar" aria-hidden="true"><span>{initials}</span><Image alt="" fill sizes="68px" src={`https://github.com/${resource.owner}.png?size=96`} unoptimized /></span>
        <div className="catalog-card-content">
          <div className="catalog-card-head">
            <div className="catalog-card-identity"><span>{info.shortLabel}</span><h3><Link href={resourceHref(resource, locale)}>{resource.name}</Link></h3><code>{canonicalIdentity(resource)}</code></div>
            <div className="catalog-card-metrics"><span className="catalog-topic-badge">{topic}</span><span className="catalog-card-stars">★ {formatStars(resource.stars)}</span></div>
          </div>
          <p>{resource.summary}</p>
          {reasons?.length ? <div className="catalog-match-reason"><strong>{zh ? "命中" : "Matched"}</strong>{reasons.join(" · ")}</div> : null}
          <div className="catalog-card-tags">{uniqueBadges.length ? uniqueBadges.map((badge) => <span key={badge}>{badge}</span>) : <span>{resource.subtype}</span>}</div>
        </div>
      </article>
    );
  }

  if (variant === "table") {
    return (
      <article className="resource-table-row" style={{ "--category-accent": info.accent } as React.CSSProperties}>
        <div className="resource-table-main">
          <div className="resource-table-title"><span>{kindLabels[resource.officialKind]}</span><h3><Link href={resourceHref(resource, locale)}>{canonicalIdentity(resource)}</Link></h3></div>
          <p>{resource.summary}</p>
          <code>{resource.owner}/{resource.repo}</code>
        </div>
        <div className="resource-table-facts">{resource.facts.slice(0, 3).map((fact, index) => <span key={fact}><b aria-hidden="true">{index === 0 ? "▱" : index === 1 ? "▤" : "◎"}</b>{fact}</span>)}</div>
        <div className="resource-table-updated">{formatRelativeDate(resource.updatedAt, new Date(), locale)}</div>
        <div className="resource-table-stars">☆ {formatStars(resource.stars)}</div>
        <Link className="resource-table-action" href={resourceHref(resource, locale)}>{zh ? "查看详情" : "View details"} →</Link>
      </article>
    );
  }

  if (variant === "search") {
    return (
      <article className="search-result-row" style={{ "--category-accent": info.accent } as React.CSSProperties}>
        <div className="search-result-main">
          <div className="search-result-labels"><span className="type-label">{info.label}</span><span className="tag">{resource.subtype}</span></div>
          <h3><Link href={resourceHref(resource, locale)}>{canonicalIdentity(resource)}</Link></h3>
          <p>{resource.summary}</p>
          <div className="search-result-bottom">
            {reasons?.length ? <span className="match-reason"><strong>{zh ? "命中：" : "Matched: "}</strong>{reasons.join(" · ")}</span> : <span />}
            <div className="cluster compatibilities">{resource.compatibilities.slice(0, 4).map((item) => <span className="tag" key={`${resource.id}-${item.host}`}>{item.host}</span>)}</div>
          </div>
        </div>
        <div className="search-result-meta">
          <span className={metadataVerified ? "verified" : ""}>{metadataVerified ? (zh ? "● 已验证" : "● Reviewed") : (zh ? "○ 未核验" : "○ Unreviewed")}</span>
          <span>☆ {formatStars(resource.stars)}</span>
          <span>◷ {formatRelativeDate(resource.updatedAt, new Date(), locale)}</span>
          <span>⚖ {resource.license}</span>
          <Link href={resourceHref(resource, locale)}>{zh ? "查看详情" : "View details"} →</Link>
        </div>
      </article>
    );
  }

  return (
    <article className={compact ? "resource-card compact" : "resource-card"} style={{ "--category-accent": info.accent } as React.CSSProperties}>
      <div className="resource-card-top"><div className="cluster"><span className="type-label">{info.shortLabel}</span><span className="tag">{resource.subtype}</span><span className="tag">{kindLabels[resource.officialKind]}</span></div><span className="repo-stars" title={zh ? "仓库 Stars" : "Repository stars"}>☆ {formatStars(resource.stars)}</span></div>
      <div className="resource-main">
        <h3><Link href={resourceHref(resource, locale)}>{resource.name}</Link></h3>
        <code className="resource-identity">{canonicalIdentity(resource)}</code>
        <p>{resource.summary}</p>
        {reasons?.length ? <div className="match-reason"><strong>{zh ? "为什么命中：" : "Why it matched: "}</strong>{reasons.join(" · ")}</div> : null}
        <div className="cluster facts">{resource.facts.slice(0, 3).map((fact) => <span className="tag indigo" key={fact}>{fact}</span>)}</div>
        <div className="cluster compatibilities">{resource.compatibilities.slice(0, 4).map((item) => <span className="tag" key={`${resource.id}-${item.host}`}>{item.host}{item.level === "inferred" ? (zh ? " · 推测" : " · Inferred") : ""}</span>)}</div>
      </div>
      <div className="resource-card-bottom"><div className="resource-meta"><span className={metadataVerified ? "verified" : ""}>{metadataVerified ? (zh ? "● 信息已核对" : "● Information reviewed") : (zh ? "○ 未核对" : "○ Unreviewed")}</span><span>{resource.license}</span><span>{formatRelativeDate(resource.updatedAt, new Date(), locale)}</span></div><Link className="text-link" href={resourceHref(resource, locale)}>{zh ? "查看详情" : "View details"} →</Link></div>
    </article>
  );
}
