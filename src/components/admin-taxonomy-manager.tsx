"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORY_INFO } from "@/data/resources";
import type { TaxonomyTopicRecord } from "@/lib/taxonomy-admin";
import type { CategorySlug } from "@/lib/types";

const categories: CategorySlug[] = ["skills", "dsh", "plugins", "mcp", "prompts"];

function errorMessage(body: unknown, fallback: string) {
  if (!body || typeof body !== "object" || !("error" in body)) return fallback;
  const error = body.error;
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") return error.message;
  return fallback;
}
function TopicRow({ topic }: { topic: TaxonomyTopicRecord }) {
  const router = useRouter();
  const [labelZh, setLabelZh] = useState(topic.labelZh);
  const [labelEn, setLabelEn] = useState(topic.labelEn);
  const [keywords, setKeywords] = useState(topic.keywords.join("，"));
  const [sortOrder, setSortOrder] = useState(String(topic.sortOrder));
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function mutate(body: object, success: string) {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(`/api/admin/taxonomy/${topic.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      const result = await response.json();
      if (!response.ok) throw new Error(errorMessage(result, "操作失败"));
      setMessage(success);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "操作失败");
    } finally {
      setBusy(false);
    }
  }

  function save() {
    return mutate({
      action: "update",
      topic: { category: topic.category, slug: topic.slug, labelZh, labelEn, keywords, sortOrder: Number(sortOrder) },
    }, "已保存");
  }

  function toggle() {
    const nextActive = !topic.active;
    if (!window.confirm(nextActive ? "恢复这个能力领域？" : "停用后它会从前台筛选中消失，确认继续？")) return;
    void mutate({ action: "set-active", active: nextActive, category: topic.category }, nextActive ? "已恢复" : "已停用");
  }

  return (
    <article className={`admin-taxonomy-row${topic.active ? "" : " inactive"}`}>
      <div className="admin-taxonomy-id"><strong>{topic.labelZh}</strong><code>{topic.slug}</code><span>{topic.usageCount} 个资源使用</span></div>
      <label>中文名称<input disabled={busy || !topic.active} value={labelZh} onChange={(event) => setLabelZh(event.target.value)} /></label>
      <label>英文名称<input disabled={busy || !topic.active} value={labelEn} onChange={(event) => setLabelEn(event.target.value)} /></label>
      <label className="keywords">检索关键词<input disabled={busy || !topic.active} value={keywords} onChange={(event) => setKeywords(event.target.value)} /></label>
      <label className="order">顺序<input disabled={busy || !topic.active} min="0" type="number" value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} /></label>
      <div className="admin-taxonomy-actions">
        {topic.active ? <button disabled={busy} onClick={() => void save()} type="button">保存</button> : null}
        <button className={topic.active ? "danger" : "restore"} disabled={busy || (topic.active && topic.usageCount > 0)} onClick={toggle} title={topic.active && topic.usageCount > 0 ? "请先修改仍在使用该标签的资源" : undefined} type="button">{topic.active ? "停用删除" : "恢复"}</button>
      </div>
      {message ? <p role="status">{message}</p> : null}
    </article>
  );
}

export function AdminTaxonomyManager({ topics }: { topics: TaxonomyTopicRecord[] }) {
  const router = useRouter();
  const [category, setCategory] = useState<CategorySlug>("skills");
  const [showInactive, setShowInactive] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const visible = useMemo(() => topics.filter((topic) => topic.category === category && (showInactive || topic.active)), [category, showInactive, topics]);

  async function create(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/taxonomy", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ category, slug: data.get("slug"), labelZh: data.get("labelZh"), labelEn: data.get("labelEn"), keywords: data.get("keywords"), sortOrder: Number(data.get("sortOrder")) }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(errorMessage(result, "新增失败"));
      form.reset();
      setMessage("能力领域已新增");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "新增失败");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-taxonomy-manager">
      <div className="admin-taxonomy-tabs" role="tablist" aria-label="资源分类">
        {categories.map((item) => <button aria-selected={category === item} className={category === item ? "active" : ""} key={item} onClick={() => setCategory(item)} role="tab" type="button"><span>{CATEGORY_INFO[item].label}</span><b>{topics.filter((topic) => topic.category === item && topic.active).length}</b></button>)}
      </div>
      <form className="admin-taxonomy-create" onSubmit={create}>
        <div><span className="admin-eyebrow">ADD CAPABILITY</span><h2>新增{CATEGORY_INFO[category].label}能力领域</h2><p>slug 创建后保持不变，中英文名称和排序可以随时修改。</p></div>
        <label>slug<input name="slug" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" placeholder="browser-tools" required /></label>
        <label>中文名称<input name="labelZh" placeholder="浏览器工具" required /></label>
        <label>英文名称<input name="labelEn" placeholder="Browser tools" required /></label>
        <label className="wide">检索关键词<input name="keywords" placeholder="浏览器，browser，automation" /></label>
        <label>显示顺序<input defaultValue={100} min="0" name="sortOrder" type="number" required /></label>
        <button disabled={busy} type="submit">{busy ? "正在新增…" : "新增能力领域"}</button>
        {message ? <p role="status">{message}</p> : null}
      </form>
      <div className="admin-taxonomy-list-head"><div><h2>{CATEGORY_INFO[category].label}能力领域</h2><p>正在使用的标签需先从相关资源中移除，随后才能停用。</p></div><label><input checked={showInactive} onChange={(event) => setShowInactive(event.target.checked)} type="checkbox" />显示已停用</label></div>
      <div className="admin-taxonomy-list">{visible.map((topic) => <TopicRow key={topic.id} topic={topic} />)}</div>
    </div>
  );
}
