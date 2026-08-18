"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { evaluateResourceSeoTitle } from "@/lib/seo-title";
import { resourceSeoDescription, resourceSeoTitle } from "@/lib/seo";
import type { Resource, ResourceSeo, SeoSearchIntent } from "@/lib/types";

const INTENT_LABELS: Record<SeoSearchIntent, string> = {
  installation: "安装教程",
  configuration: "配置教程",
  usage: "使用指南",
  overview: "项目介绍",
  learning: "学习资料",
};

function initialSeo(resource: Resource): ResourceSeo {
  return resource.seo ?? {
    primaryKeyword: `${resource.name} 安装教程`,
    title: resourceSeoTitle(resource),
    description: resourceSeoDescription(resource),
    searchIntent: resource.category === "mcp" ? "configuration" : "installation",
    secondaryKeywords: [resource.name, resource.subtype],
  };
}

export function AdminResourceEditor({ resource, status }: { resource: Resource; status: string }) {
  const router = useRouter();
  const [json, setJson] = useState(JSON.stringify(resource, null, 2));
  const [seo, setSeo] = useState<ResourceSeo>(() => initialSeo(resource));
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const score = useMemo(() => evaluateResourceSeoTitle(resource, seo.title), [resource, seo.title]);

  function updateSeo(next: ResourceSeo) {
    setSeo(next);
    try {
      const parsed = JSON.parse(json) as Resource;
      parsed.seo = next;
      setJson(JSON.stringify(parsed, null, 2));
      setMessage("");
    } catch {
      setMessage("资源 JSON 当前无法解析，请先修复 JSON 再编辑 SEO 字段。");
    }
  }

  function updateJson(value: string) {
    setJson(value);
    try {
      const parsed = JSON.parse(value) as Resource;
      if (parsed.seo) setSeo(parsed.seo);
      setMessage("");
    } catch {
      // 保留正在输入的 JSON，保存时再显示完整错误。
    }
  }

  async function save(action: "draft" | "publish" | "update") {
    setBusy(true);
    setMessage("");
    try {
      const parsed = JSON.parse(json);
      const response = await fetch("/api/admin/resources/write", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action, resource: parsed, note: "管理员后台编辑" }) });
      const body = await response.json();
      setMessage(response.ok ? `已保存，版本 ${body.result.version}` : `${body.error ?? "保存失败"}${body.issues ? `：${body.issues.map((item: { path: string; message: string }) => `${item.path} ${item.message}`).join("；")}` : ""}`);
      if (response.ok) router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "JSON 格式错误");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-editor">
      <section className="admin-seo-editor" aria-labelledby="seo-editor-title">
        <div className="admin-seo-heading">
          <div><span>SEARCH PREVIEW</span><h2 id="seo-editor-title">SEO 标题与摘要</h2></div>
          <div className={`admin-seo-score ${score.grade}`}><strong>{score.score}</strong><span>/ 100</span></div>
        </div>
        <div className="admin-search-preview">
          <small>www.agentmatter.net › resource › {resource.owner} › {resource.repo}</small>
          <strong>{seo.title || "等待填写标题"} | AgentMatter</strong>
          <p>{seo.description || "等待填写页面摘要。"}</p>
        </div>
        <div className="admin-seo-grid">
          <label>主关键词<input value={seo.primaryKeyword} onChange={(event) => updateSeo({ ...seo, primaryKeyword: event.target.value })} /></label>
          <label>搜索意图<select value={seo.searchIntent} onChange={(event) => updateSeo({ ...seo, searchIntent: event.target.value as SeoSearchIntent })}>{Object.entries(INTENT_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <label className="wide">页面标题<input value={seo.title} onChange={(event) => updateSeo({ ...seo, title: event.target.value })} /><small>页面会自动补上“| AgentMatter”，无需重复填写。</small></label>
          <label className="wide">搜索摘要<textarea rows={3} value={seo.description} onChange={(event) => updateSeo({ ...seo, description: event.target.value })} /></label>
          <label className="wide">次关键词<input value={seo.secondaryKeywords.join("，")} onChange={(event) => updateSeo({ ...seo, secondaryKeywords: event.target.value.split(/[，,]/).map((item) => item.trim()).filter(Boolean) })} /><small>使用逗号分隔。</small></label>
          <label className="wide">候选标题<textarea rows={3} value={(seo.titleCandidates ?? []).join("\n")} onChange={(event) => updateSeo({ ...seo, titleCandidates: event.target.value.split("\n").map((item) => item.trim()).filter(Boolean) })} /><small>AI 每次生成 3 个候选标题，每行一个，最终标题必须在候选中。</small></label>
          <label className="wide">选择理由<textarea rows={2} value={seo.selectionReason ?? ""} onChange={(event) => updateSeo({ ...seo, selectionReason: event.target.value })} /></label>
        </div>
        <div className="admin-seo-feedback"><strong>完整标题宽度估算：{score.displayUnits}</strong>{score.issues.length ? <ul>{score.issues.map((issue) => <li key={issue}>{issue}</li>)}</ul> : <p>标题结构清楚，可以进入发布校验。</p>}</div>
      </section>
      <details className="admin-json-editor"><summary>编辑完整资源 JSON</summary><textarea aria-label="资源 JSON" value={json} onChange={(event) => updateJson(event.target.value)} spellCheck={false} /></details>
      <div className="admin-editor-actions"><button onClick={() => save(status === "draft" ? "draft" : "update")} disabled={busy}>保存内容</button><button className="primary" onClick={() => save("publish")} disabled={busy}>发布到前台</button></div>
      {message ? <p role="status">{message}</p> : null}
    </div>
  );
}
