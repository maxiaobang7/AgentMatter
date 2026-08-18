import Link from "next/link";
import { localizedPath } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/server-locale";

export default async function NotFound() {
  const locale = await getRequestLocale();
  const zh = locale === "zh";
  return <section className="page-section"><div className="shell empty-state"><span className="eyebrow">404</span><strong>{zh ? "没有找到这个资源" : "Resource not found"}</strong><p>{zh ? "它可能尚未收录、已经移动，或者组件路径发生了变化。" : "It may not be indexed yet, may have moved, or its component path may have changed."}</p><div className="cluster" style={{ justifyContent: "center" }}><Link className="button button-primary" href={localizedPath("/search", locale)}>{zh ? "搜索资源" : "Search resources"}</Link><Link className="button button-quiet" href={localizedPath("/submit", locale)}>{zh ? "提交仓库" : "Submit a repository"}</Link></div></div></section>;
}
