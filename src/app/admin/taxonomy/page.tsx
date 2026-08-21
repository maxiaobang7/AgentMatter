import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminLogoutButton } from "@/components/admin-logout-button";
import { AdminNav } from "@/components/admin-nav";
import { AdminTaxonomyManager } from "@/components/admin-taxonomy-manager";
import { isAdminSessionValid } from "@/server/admin-auth";
import { isDatabaseConfigured } from "@/server/db";
import { getTaxonomyTopics } from "@/server/taxonomy-service";

export const metadata: Metadata = { title: "能力领域管理", robots: { index: false, follow: false } };

export default async function AdminTaxonomyPage() {
  if (!await isAdminSessionValid()) redirect("/admin/login");
  if (!isDatabaseConfigured()) return <section className="admin-page"><div className="admin-shell"><h1>数据库尚未配置</h1><p>能力领域管理需要数据库支持。</p></div></section>;
  const topics = await getTaxonomyTopics({ includeInactive: true, withUsage: true });
  return (
    <section className="admin-page"><div className="admin-shell">
      <header className="admin-header"><div><span className="admin-eyebrow">TAXONOMY CONTROL</span><h1>能力领域管理</h1><p>维护分类页顶部用于筛选资源的中英文能力标签。</p></div><AdminLogoutButton /></header>
      <AdminNav active="taxonomy" />
      <AdminTaxonomyManager topics={topics} />
    </div></section>
  );
}
