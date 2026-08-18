import type { MetadataRoute } from "next";
import { categorySlugs, resourceHref } from "@/lib/resources";
import { getSiteUrl } from "@/lib/seo";
import { localizedPath } from "@/lib/i18n";
import { getCatalogResources } from "@/server/catalog";

function bilingualEntries(baseUrl: string, path: string, options: Omit<MetadataRoute.Sitemap[number], "url" | "alternates">) {
  const english = `${baseUrl}${localizedPath(path, "en")}`;
  const chinese = `${baseUrl}${localizedPath(path, "zh")}`;
  const languages = { en: english, "zh-Hans": chinese, "x-default": english };
  return [{ ...options, url: english, alternates: { languages } }, { ...options, url: chinese, alternates: { languages } }] satisfies MetadataRoute.Sitemap;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const resources = await getCatalogResources();
  const baseUrl = getSiteUrl();
  const latestUpdate = resources.reduce((latest, resource) => resource.updatedAt > latest ? resource.updatedAt : latest, resources[0]?.updatedAt ?? new Date().toISOString());
  return [
    ...bilingualEntries(baseUrl, "/", { lastModified: latestUpdate, changeFrequency: "daily", priority: 1 }),
    ...categorySlugs.flatMap((category) => {
      const items = resources.filter((resource) => resource.category === category);
      const lastModified = items.reduce((latest, resource) => resource.updatedAt > latest ? resource.updatedAt : latest, items[0]?.updatedAt ?? latestUpdate);
      return bilingualEntries(baseUrl, `/${category}`, { lastModified, changeFrequency: "daily", priority: 0.9 });
    }),
    ...resources.flatMap((resource) => bilingualEntries(baseUrl, resourceHref(resource), { lastModified: resource.updatedAt, changeFrequency: "weekly", priority: 0.8 })),
    ...["/guidelines", "/about", "/submit"].flatMap((path) => bilingualEntries(baseUrl, path, { changeFrequency: "monthly", priority: path === "/submit" ? 0.4 : 0.5 })),
  ];
}
