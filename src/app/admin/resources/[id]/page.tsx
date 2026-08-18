import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AdminResourceEditor } from "@/components/admin-resource-editor";
import { AdminRollbackButton } from "@/components/admin-rollback-button";
import { isAdminSessionValid } from "@/server/admin-auth";
import { getAdminResource } from "@/server/admin-data";

export const metadata: Metadata = { title: "编辑资源", robots: { index: false, follow: false } };

export default async function AdminResourcePage({ params }: { params: Promise<{ id: string }> }) {
  if (!await isAdminSessionValid()) redirect("/admin/login");
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isSafeInteger(numericId)) notFound();
  const data = await getAdminResource(numericId);
  if (!data) notFound();
  return <section className="admin-page"><div className="admin-shell"><header className="admin-header compact"><div><Link className="admin-back" href="/admin">← 返回运营后台</Link><h1>{data.stableKey}</h1><p>当前状态：{data.status} · 当前版本：v{data.version}</p></div></header><div className="admin-grid"><div className="admin-panel"><h2>资源 JSON</h2><p>保存前会执行与 Codex 发布 API 完全相同的内容校验。</p><AdminResourceEditor resource={data.resource} status={data.status} /></div><aside className="admin-side"><div className="admin-panel"><h2>版本历史</h2><div className="admin-version-list">{data.versions.map((version) => <div key={version.version_number}><div><strong>v{version.version_number}</strong><span>{version.action} · {version.actor}</span><small>{new Date(version.created_at).toLocaleString("zh-CN")}</small></div>{version.version_number !== data.version ? <AdminRollbackButton resourceId={data.id} version={version.version_number} /> : <em>当前</em>}</div>)}</div></div></aside></div></div></section>;
}
