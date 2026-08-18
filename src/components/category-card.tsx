import Link from "next/link";
import { CATEGORY_INFO } from "@/data/resources";
import type { CategorySlug } from "@/lib/types";

export function CategoryCard({ category, count, index }: { category: CategorySlug; count: number; index: number }) {
  const info = CATEGORY_INFO[category];
  return (
    <Link className="category-card" href={`/${category}`} style={{ "--category-accent": info.accent } as React.CSSProperties}>
      <div className="category-index">0{index}</div>
      <div><span className="category-kicker">{info.shortLabel}</span><h3>{info.label}</h3><p>{info.description}</p></div>
      <div className="category-card-footer"><span>{count} 个首批样本</span><span aria-hidden="true">↗</span></div>
    </Link>
  );
}
