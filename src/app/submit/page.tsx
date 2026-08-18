import type { Metadata } from "next";
import Link from "next/link";
import { SubmissionForm } from "@/components/submission-form";
import { localizedAlternates, localizedPath } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/server-locale";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return { title: locale === "zh" ? "提交 GitHub AI Agent 项目" : "Submit a GitHub AI Agent Project", description: locale === "zh" ? "向 AgentMatter 推荐值得收录的 GitHub Skills、插件、MCP 服务器或 Prompt 开源项目。" : "Recommend an open-source GitHub Skill, plugin, MCP server, or Prompt project for AgentMatter.", alternates: localizedAlternates("/submit", locale) };
}

export default async function SubmitPage() {
  const locale = await getRequestLocale();
  const zh = locale === "zh";
  return <section className="mockup-submit-page"><div className="wide-shell"><div className="breadcrumb"><Link href={localizedPath("/", locale)}>{zh ? "首页" : "Home"}</Link><span>/</span><span>{zh ? "提交项目" : "Submit"}</span></div><header className="submission-title"><h1>{zh ? "提交 GitHub 项目" : "Submit a GitHub project"}</h1><p>{zh ? "推荐值得收录的 AI Agent 开源资源" : "Recommend an open-source AI Agent resource"}</p></header><div className="submission-progress"><span className="active"><b>1</b>{zh ? "验证仓库" : "Verify repository"}</span><i /><span><b>2</b>{zh ? "补充信息" : "Add information"}</span><i /><span><b>3</b>{zh ? "提交审核" : "Submit for review"}</span></div><div className="mockup-submission-layout"><SubmissionForm locale={locale} /><aside className="submission-checklist"><h2>{zh ? "提交前请确认" : "Before submitting"}</h2><ul><li>{zh ? "公开 GitHub 仓库" : "Public GitHub repository"}</li><li>{zh ? "与 AI Agent 直接相关" : "Directly related to AI agents"}</li><li>{zh ? "提供可用文件或代码" : "Contains usable files or code"}</li><li>{zh ? "非重复 Fork" : "Not a duplicate fork"}</li></ul><div><strong>ⓘ {zh ? "为什么只收录 GitHub？" : "Why GitHub only?"}</strong><p>{zh ? "GitHub 提供开放透明的源码托管服务，便于验证项目质量与安全性，并可持续追踪项目的更新与维护情况。" : "GitHub provides public source history, clear ownership, and traceable maintenance signals that make projects easier to review."}</p></div><Link href={localizedPath("/guidelines", locale)}>{zh ? "查看完整收录规则" : "Read the complete guidelines"} →</Link></aside></div></div></section>;
}
