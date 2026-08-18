export type PublicLocale = "en" | "zh";

export const DEFAULT_LOCALE: PublicLocale = "en";
export const CHINESE_PREFIX = "/zh";

export function isPublicLocale(value: string | null | undefined): value is PublicLocale {
  return value === "en" || value === "zh";
}

export function stripLocalePrefix(pathname: string) {
  if (pathname === CHINESE_PREFIX) return "/";
  if (pathname.startsWith(`${CHINESE_PREFIX}/`)) return pathname.slice(CHINESE_PREFIX.length) || "/";
  return pathname || "/";
}

export function localeFromPathname(pathname: string): PublicLocale {
  return pathname === CHINESE_PREFIX || pathname.startsWith(`${CHINESE_PREFIX}/`) ? "zh" : "en";
}

export function localizedPath(path: string, locale: PublicLocale) {
  const hashIndex = path.indexOf("#");
  const hash = hashIndex >= 0 ? path.slice(hashIndex) : "";
  const withoutHash = hashIndex >= 0 ? path.slice(0, hashIndex) : path;
  const queryIndex = withoutHash.indexOf("?");
  const query = queryIndex >= 0 ? withoutHash.slice(queryIndex) : "";
  const pathname = queryIndex >= 0 ? withoutHash.slice(0, queryIndex) : withoutHash;
  const base = stripLocalePrefix(pathname || "/");
  const localized = locale === "zh" ? (base === "/" ? CHINESE_PREFIX : `${CHINESE_PREFIX}${base}`) : base;
  return `${localized}${query}${hash}`;
}

export function localizedAlternates(path: string, locale: PublicLocale = DEFAULT_LOCALE) {
  return {
    canonical: localizedPath(path, locale),
    languages: {
      en: localizedPath(path, "en"),
      "zh-Hans": localizedPath(path, "zh"),
      "x-default": localizedPath(path, DEFAULT_LOCALE),
    },
  };
}
