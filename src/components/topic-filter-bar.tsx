import Link from "next/link";
import { catalogHref, type CatalogQuery } from "@/lib/catalog-query";
import type { PublicLocale } from "@/lib/i18n";

export type TopicFilterOption = { slug: string; label: string; count: number };

export function TopicFilterBar({ basePath, current, currentTopic, label, topics, total, locale }: { basePath: string; current: CatalogQuery; currentTopic?: string; label: string; topics: TopicFilterOption[]; total: number; locale: PublicLocale }) {
  const visible = topics.slice(0, 7);
  const overflow = topics.slice(7);
  const allLabel = locale === "zh" ? "全部" : "All";

  return (
    <nav className="topic-filter" aria-label={label}>
      <strong>{label}</strong>
      <div className="topic-chip-row">
        <Link className={!currentTopic ? "active" : ""} aria-current={!currentTopic ? "page" : undefined} href={catalogHref(basePath, current, { topic: undefined })}><span>{allLabel}</span><b>{total}</b></Link>
        {visible.map((topic) => <Link className={currentTopic === topic.slug ? "active" : ""} aria-current={currentTopic === topic.slug ? "page" : undefined} href={catalogHref(basePath, current, { topic: topic.slug })} key={topic.slug}><span>{topic.label}</span><b>{topic.count}</b></Link>)}
        {overflow.length ? <details className="topic-more"><summary>{locale === "zh" ? "更多" : "More"}<span aria-hidden="true">＋</span></summary><div>{overflow.map((topic) => <Link className={currentTopic === topic.slug ? "active" : ""} href={catalogHref(basePath, current, { topic: topic.slug })} key={topic.slug}><span>{topic.label}</span><b>{topic.count}</b></Link>)}</div></details> : null}
      </div>
    </nav>
  );
}
