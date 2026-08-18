export function formatStars(value: number) {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}m`;
  if (value >= 1000) return `${(value / 1000).toFixed(value >= 10000 ? 1 : 1)}k`;
  return String(value);
}

export function formatDate(value: string, locale: "en" | "zh" = "zh") {
  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", { year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(value));
}

export function formatRelativeDate(value: string, now = new Date(), locale: "en" | "zh" = "zh") {
  const date = new Date(value);
  const days = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 86400000));
  if (locale === "en") {
    if (days === 0) return "Updated today";
    if (days === 1) return "Updated 1 day ago";
    if (days < 30) return `Updated ${days} days ago`;
    if (days < 365) return `Updated ${Math.floor(days / 30)} months ago`;
    return `Updated ${Math.floor(days / 365)} years ago`;
  }
  if (days === 0) return "今天更新";
  if (days === 1) return "1 天前更新";
  if (days < 30) return `${days} 天前更新`;
  if (days < 365) return `${Math.floor(days / 30)} 个月前更新`;
  return `${Math.floor(days / 365)} 年前更新`;
}
