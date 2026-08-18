import { CATEGORY_INFO, resources } from "@/data/resources";
import { getResourceTaxonomy } from "@/data/taxonomy";
import type { CategorySlug, Resource, ResourceFacetKey, SearchHit } from "@/lib/types";
import { localizedPath, type PublicLocale } from "@/lib/i18n";

export const categorySlugs = Object.keys(CATEGORY_INFO) as CategorySlug[];

export function isCategorySlug(value: string): value is CategorySlug {
  return categorySlugs.includes(value as CategorySlug);
}

export function canonicalIdentity(resource: Resource) {
  const base = `${resource.owner}/${resource.repo}`;
  return resource.componentPath ? `${base}#${resource.componentPath}` : base;
}

export function resourceHref(resource: Resource, locale?: PublicLocale) {
  const base = `/resource/${encodeURIComponent(resource.owner)}/${encodeURIComponent(resource.repo)}`;
  const href = resource.componentPath ? `${base}?component=${encodeURIComponent(resource.componentPath)}` : base;
  return locale ? localizedPath(href, locale) : href;
}

export function githubHref(resource: Resource) {
  return `https://github.com/${resource.owner}/${resource.repo}`;
}

export function getResources(category?: CategorySlug, source: Resource[] = resources) {
  return category ? source.filter((resource) => resource.category === category) : source;
}

export function getResource(owner: string, repo: string, componentPath?: string, source: Resource[] = resources) {
  const candidates = source.filter(
    (resource) => resource.owner.toLowerCase() === owner.toLowerCase() && resource.repo.toLowerCase() === repo.toLowerCase(),
  );
  if (!componentPath) return candidates[0];
  return candidates.find((resource) => resource.componentPath === componentPath) ?? candidates[0];
}

export type ResourceFilters = {
  category?: CategorySlug;
  host?: string;
  subtype?: string;
  topic?: string;
  facets?: Partial<Record<ResourceFacetKey, string[]>>;
};

export function filterResources({ category, host, subtype, topic, facets }: ResourceFilters, source: Resource[] = resources) {
  return source.filter((resource) => {
    if (category && resource.category !== category) return false;
    if (host && !resource.compatibilities.some((item) => item.host.toLowerCase() === host.toLowerCase())) return false;
    if (subtype && resource.subtype !== subtype) return false;
    const taxonomy = getResourceTaxonomy(resource);
    if (topic && taxonomy.primaryTopic !== topic && !taxonomy.secondaryTopics?.includes(topic)) return false;
    for (const [facet, selectedValues] of Object.entries(facets ?? {})) {
      if (!selectedValues?.length) continue;
      const resourceValues = taxonomy.facets?.[facet as ResourceFacetKey] ?? [];
      if (!selectedValues.some((value) => resourceValues.includes(value))) return false;
    }
    return true;
  });
}

export function searchResources(query: string, category?: CategorySlug, source: Resource[] = resources, locale: PublicLocale = "zh"): SearchHit[] {
  const normalized = query.trim().toLowerCase();
  const candidates = getResources(category, source);
  if (!normalized) return candidates.map((resource) => ({ resource, score: resource.featured ? 2 : 1, reasons: [locale === "zh" ? "精选资源" : "Curated resource"] })).sort((a, b) => b.score - a.score || b.resource.stars - a.resource.stars);

  return candidates
    .map((resource) => {
      let score = 0;
      const reasons: string[] = [];
      const identity = canonicalIdentity(resource).toLowerCase();
      const name = resource.name.toLowerCase();
      const summary = resource.summary.toLowerCase();
      const hosts = resource.compatibilities.map((item) => item.host).join(" ").toLowerCase();
      const capabilityText = resource.capabilities.join(" ").toLowerCase();
      const taxonomy = getResourceTaxonomy(resource);
      const taxonomyText = [taxonomy.primaryTopic, ...(taxonomy.secondaryTopics ?? []), ...Object.values(taxonomy.facets ?? {}).flat()].join(" ").toLowerCase();
      const factText = `${resource.subtype} ${resource.facts.join(" ")} ${taxonomyText}`.toLowerCase();

      if (identity === normalized || name === normalized) { score += 100; reasons.push(locale === "zh" ? "名称或仓库精确命中" : "Exact name or repository match"); }
      else if (identity.includes(normalized) || name.includes(normalized)) { score += 60; reasons.push(locale === "zh" ? "名称或组件路径命中" : "Name or component path match"); }
      if (capabilityText.includes(normalized)) { score += 35; reasons.push(locale === "zh" ? "能力命中" : "Capability match"); }
      if (hosts.includes(normalized)) { score += 25; reasons.push(locale === "zh" ? "宿主兼容命中" : "Host match"); }
      if (summary.includes(normalized)) { score += 20; reasons.push(locale === "zh" ? "项目说明命中" : "Description match"); }
      if (factText.includes(normalized)) { score += 12; reasons.push(locale === "zh" ? "资源特征命中" : "Resource fact match"); }

      const tokens = normalized.split(/\s+/).filter(Boolean);
      if (tokens.length > 1) {
        const haystack = `${identity} ${name} ${summary} ${hosts} ${capabilityText} ${factText}`;
        const matches = tokens.filter((token) => haystack.includes(token)).length;
        if (matches) { score += matches * 6; reasons.push(locale === "zh" ? `匹配 ${matches}/${tokens.length} 个关键词` : `Matched ${matches}/${tokens.length} terms`); }
      }

      return { resource, score, reasons: [...new Set(reasons)] };
    })
    .filter((hit) => hit.score > 0)
    .sort((a, b) => b.score - a.score || b.resource.stars - a.resource.stars);
}

export function categoryCounts(source: Resource[] = resources) {
  return categorySlugs.reduce<Record<CategorySlug, number>>((counts, category) => {
    counts[category] = source.filter((resource) => resource.category === category).length;
    return counts;
  }, {} as Record<CategorySlug, number>);
}

export function allHosts(category?: CategorySlug, source: Resource[] = resources) {
  return [...new Set(getResources(category, source).flatMap((resource) => resource.compatibilities.map((item) => item.host)))].sort();
}

export function allSubtypes(category: CategorySlug, source: Resource[] = resources) {
  return [...new Set(getResources(category, source).map((resource) => resource.subtype))].sort();
}
