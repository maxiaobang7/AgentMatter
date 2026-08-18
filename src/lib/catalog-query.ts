export type CatalogQuery = Record<string, string | string[] | undefined>;

export function readQueryValue(value: string | string[] | undefined) {
  return typeof value === "string" ? value : value?.[0];
}

export function readQueryValues(value: string | string[] | undefined) {
  const values = Array.isArray(value) ? value : value ? [value] : [];
  return [...new Set(values.flatMap((item) => item.split(",")).map((item) => item.trim()).filter(Boolean))];
}

export function catalogHref(basePath: string, current: CatalogQuery, updates: CatalogQuery) {
  const merged: CatalogQuery = { ...current, ...updates };
  const params = new URLSearchParams();
  Object.entries(merged).forEach(([key, value]) => {
    if (Array.isArray(value)) value.filter(Boolean).forEach((item) => params.append(key, item));
    else if (value) params.set(key, value);
  });
  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export function toggleQueryValue(basePath: string, current: CatalogQuery, key: string, value: string) {
  const selected = readQueryValues(current[key]);
  const next = selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value];
  return catalogHref(basePath, current, { [key]: next.length ? next : undefined });
}
