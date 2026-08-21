import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminLogoutButton } from "@/components/admin-logout-button";
import { AdminNav } from "@/components/admin-nav";
import { AdminTokenForm } from "@/components/admin-token-form";
import { getAdminDashboard } from "@/server/admin-data";
import { isAdminSessionValid } from "@/server/admin-auth";
import { isDatabaseConfigured } from "@/server/db";

export const metadata: Metadata = { title: "内容运营后台", robots: { index: false, follow: false } };

export default async function AdminPage() {
  if (!await isAdminSessionValid()) redirect("/admin/login");
  if (!isDatabaseConfigured()) return <section className="admin-page"><div className="admin-shell"><h1>数据库尚未配置</h1><p>请先设置 DATABASE_URL 并执行数据库迁移，然后刷新此页面。公开网站当前仍使用静态资源。</p><AdminLogoutButton /></div></section>;
  const data = await getAdminDashboard();
  const totals = Object.fromEntries(data.counts.map((item) => [item.status, item.total]));
  totals.draft = data.resources.filter((item) => Boolean(item.pending_content_hash)).length + (totals.draft ?? 0);
  const submissionTotals = Object.fromEntries(data.submissionCounts.map((item) => [item.status, item.total]));
  const pendingSubmissions = (submissionTotals.new ?? 0) + (submissionTotals.reviewing ?? 0);

  return (
    <section className="admin-page"><div className="admin-shell">
      <header className="admin-header"><div><span className="admin-eyebrow">AGENTMATTER OPS</span><h1>AI 内容运营后台</h1><p>Codex 负责生成内容，服务端负责校验、版本、审核与发布。</p></div><AdminLogoutButton /></header>
      <AdminNav active="dashboard" />
      <div className="admin-stat-grid"><article><span>已发布</span><strong>{totals.published ?? 0}</strong></article><article><span>待审核草稿</span><strong>{totals.draft ?? 0}</strong></article><article><span>用户投稿</span><strong>{pendingSubmissions}</strong></article><article><span>最近操作</span><strong>{data.operations.length}</strong></article></div>
      <div className="admin-grid">
        <div className="admin-panel admin-resources-panel"><div className="admin-panel-title"><div><h2>资源队列</h2><p>点击资源可编辑 JSON、发布或恢复历史版本。</p></div></div><div className="admin-table-wrap"><table><thead><tr><th>资源</th><th>分类</th><th>状态</th><th>版本</th><th>更新时间</th></tr></thead><tbody>{data.resources.map((resource) => <tr key={resource.id}><td><Link href={`/admin/resources/${resource.id}`}>{resource.stable_key}</Link></td><td>{resource.category}</td><td><span className={`admin-status ${resource.status}`}>{resource.status}</span></td><td>v{resource.version_number}</td><td>{new Date(resource.updated_at).toLocaleString("zh-CN")}</td></tr>)}</tbody></table></div></div>
        <aside className="admin-side"><div className="admin-panel"><h2>本地 Codex Token</h2><p>创建后只显示一次，网站数据库只保存哈希。</p><AdminTokenForm /></div><div className="admin-panel"><h2>最近操作</h2><div className="admin-operation-list">{data.operations.map((operation) => <div key={operation.operation_id}><strong>{operation.action}</strong><span>{operation.actor}</span><small>{operation.status} · {new Date(operation.created_at).toLocaleString("zh-CN")}</small></div>)}</div></div></aside>
      </div>
      <Link className="admin-submission-entry" href="/admin/submissions"><div><span className="admin-eyebrow">SUBMISSION INBOX</span><h2>用户投稿审核</h2><p>已移至独立页面。集中查看 GitHub 地址、组件路径、兼容平台、备注与审核状态。</p></div><strong><b>{pendingSubmissions}</b> 条待处理 <i>进入审核 →</i></strong></Link>
    </div></section>
  );
}
