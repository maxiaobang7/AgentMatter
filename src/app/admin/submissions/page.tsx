import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminLogoutButton } from "@/components/admin-logout-button";
import { AdminNav } from "@/components/admin-nav";
import { AdminSubmissionStatus } from "@/components/admin-submission-status";
import { isAdminSessionValid } from "@/server/admin-auth";
import { getAdminSubmissions, type SubmissionStatus } from "@/server/admin-data";
import { isDatabaseConfigured } from "@/server/db";

export const metadata: Metadata = { title: "用户投稿审核", robots: { index: false, follow: false } };

const statuses: Array<[SubmissionStatus | "all", string]> = [["all", "全部"], ["new", "新提交"], ["reviewing", "审核中"], ["accepted", "已接收"], ["rejected", "已拒绝"]];

export default async function AdminSubmissionsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  if (!await isAdminSessionValid()) redirect("/admin/login");
  if (!isDatabaseConfigured()) return <section className="admin-page"><div className="admin-shell"><h1>数据库尚未配置</h1><p>用户投稿审核需要数据库支持。</p></div></section>;
  const query = await searchParams;
  const selected = statuses.some(([status]) => status === query.status) ? query.status as SubmissionStatus | "all" : "all";
  const data = await getAdminSubmissions(selected === "all" ? undefined : selected);
  const counts = Object.fromEntries(data.counts.map((item) => [item.status, item.total]));
  const total = Object.values(counts).reduce((sum, value) => sum + Number(value), 0);

  return (
    <section className="admin-page"><div className="admin-shell">
      <header className="admin-header"><div><span className="admin-eyebrow">SUBMISSION INBOX</span><h1>用户投稿审核</h1><p>把用户提交的 GitHub 项目整理为可追踪的 Codex 选题入口。</p></div><AdminLogoutButton /></header>
      <AdminNav active="submissions" />
      <div className="admin-submission-stats">{statuses.map(([status, label]) => <Link className={selected === status ? "active" : ""} href={status === "all" ? "/admin/submissions" : `/admin/submissions?status=${status}`} key={status}><span>{label}</span><strong>{status === "all" ? total : counts[status] ?? 0}</strong></Link>)}</div>
      <div className="admin-panel admin-submissions-panel"><div className="admin-panel-title"><div><h2>{statuses.find(([status]) => status === selected)?.[1]}投稿</h2><p>新提交和审核中的项目默认排在前面，状态修改后会保留在对应筛选中。</p></div><span>{data.submissions.length} 条</span></div><div className="admin-table-wrap"><table><thead><tr><th>项目</th><th>分类 / 路径</th><th>兼容平台</th><th>备注</th><th>提交时间</th><th>审核状态</th></tr></thead><tbody>{data.submissions.length ? data.submissions.map((submission) => <tr key={submission.id}><td><a href={submission.github_url} target="_blank" rel="noreferrer"><strong>{submission.display_name || submission.github_url.replace("https://github.com/", "")}</strong><small>{submission.github_url}</small></a></td><td>{submission.category ?? "未选择"}<small>{submission.component_path || "仓库根目录"}</small></td><td>{submission.hosts.length ? submission.hosts.join("、") : "未填写"}</td><td className="admin-submission-note">{submission.note || "—"}</td><td>{new Date(submission.created_at).toLocaleString("zh-CN")}</td><td><AdminSubmissionStatus id={submission.id} initialStatus={submission.status} /></td></tr>) : <tr><td colSpan={6}>当前筛选下没有用户投稿。</td></tr>}</tbody></table></div></div>
    </div></section>
  );
}
