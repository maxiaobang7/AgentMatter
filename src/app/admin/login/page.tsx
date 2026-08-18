import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin-login-form";
import { isAdminSessionValid } from "@/server/admin-auth";

export const metadata: Metadata = { title: "管理后台登录", robots: { index: false, follow: false } };

export default async function AdminLoginPage() {
  if (await isAdminSessionValid()) redirect("/admin");
  return <section className="admin-login-page"><div className="admin-login-card"><span className="admin-eyebrow">AGENTMATTER OPS</span><h1>管理后台</h1><p>查看 Codex 生成的草稿、发布记录与资源版本。</p><AdminLoginForm /></div></section>;
}
