"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { localizedPath, type PublicLocale } from "@/lib/i18n";

type FormState = { status: "idle" | "loading" | "success" | "error"; message?: string };
type RepositoryPreview = { owner: string; repo: string } | null;

export function SubmissionForm({ locale }: { locale: PublicLocale }) {
  const zh = locale === "zh";
  const categories = [["skills", "◇", "Skills"], ["dsh", "♣", zh ? "DSH 插件" : "DSH Plugins"], ["plugins", "▣", zh ? "Agent 插件" : "Agent Plugins"], ["mcp", "▤", zh ? "MCP 服务器" : "MCP Servers"], ["prompts", "◯", "Prompts"]];
  const [state, setState] = useState<FormState>({ status: "idle" });
  const [preview, setPreview] = useState<RepositoryPreview>(null);
  const [draftSaved, setDraftSaved] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const form = formRef.current;
    const saved = window.localStorage.getItem("agentmatter-submission-draft");
    if (!form || !saved) return;
    try {
      const draft = JSON.parse(saved) as Record<string, unknown>;
      for (const name of ["repositoryUrl", "componentPath", "displayName", "notes"]) {
        const control = form.elements.namedItem(name);
        if ((control instanceof HTMLInputElement || control instanceof HTMLTextAreaElement) && typeof draft[name] === "string") control.value = draft[name];
      }
      if (typeof draft.category === "string") {
        const category = form.querySelector<HTMLInputElement>(`input[name="category"][value="${CSS.escape(draft.category)}"]`);
        if (category) category.checked = true;
      }
      const hosts = Array.isArray(draft.hosts) ? new Set(draft.hosts.filter((host): host is string => typeof host === "string")) : new Set<string>();
      form.querySelectorAll<HTMLInputElement>('input[name="hosts"]').forEach((input) => { input.checked = hosts.has(input.value); });
    } catch {
      window.localStorage.removeItem("agentmatter-submission-draft");
    }
  }, []);

  function parseRepository(form: HTMLFormElement) {
    const value = String(new FormData(form).get("repositoryUrl") ?? "").trim();
    try {
      const url = new URL(value);
      const [owner, repo] = url.pathname.split("/").filter(Boolean);
      if (url.protocol !== "https:" || url.hostname !== "github.com" || !owner || !repo) throw new Error();
      return { owner, repo: repo.replace(/\.git$/i, "") };
    } catch {
      return null;
    }
  }

  function verifyRepository(form: HTMLFormElement) {
    const result = parseRepository(form);
    setPreview(result);
    setState(result ? { status: "idle" } : { status: "error", message: zh ? "请输入 https://github.com/owner/repo 格式的仓库地址" : "Enter a repository URL in the format https://github.com/owner/repo" });
  }

  function saveDraft(form: HTMLFormElement) {
    const formData = new FormData(form);
    const data = { repositoryUrl: formData.get("repositoryUrl"), category: formData.get("category"), componentPath: formData.get("componentPath"), displayName: formData.get("displayName"), notes: formData.get("notes"), hosts: formData.getAll("hosts") };
    window.localStorage.setItem("agentmatter-submission-draft", JSON.stringify(data));
    setDraftSaved(true);
    window.setTimeout(() => setDraftSaved(false), 1800);
  }

  function clearDraft(form: HTMLFormElement) {
    window.localStorage.removeItem("agentmatter-submission-draft");
    form.reset();
    setPreview(null);
    setDraftSaved(false);
    setState({ status: "idle" });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const repository = parseRepository(formElement);
    if (!repository) {
      setState({ status: "error", message: zh ? "请先填写有效的 GitHub 仓库地址" : "Enter a valid GitHub repository URL first" });
      return;
    }
    setPreview(repository);
    setState({ status: "loading" });
    const form = new FormData(formElement);
    const payload = { repositoryUrl: form.get("repositoryUrl"), category: form.get("category"), componentPath: form.get("componentPath"), displayName: form.get("displayName"), notes: form.get("notes"), hosts: form.getAll("hosts"), website: form.get("website") };
    try {
      const response = await fetch("/api/submissions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json() as { message?: string; error?: string };
      if (!response.ok) throw new Error(result.error ?? (zh ? "提交失败" : "Submission failed"));
      window.localStorage.removeItem("agentmatter-submission-draft");
      formElement.reset();
      setPreview(null);
      setState({ status: "success", message: zh ? result.message : "The repository was submitted for review." });
    } catch (error) {
      setState({ status: "error", message: error instanceof Error ? error.message : (zh ? "提交失败，请稍后再试" : "Submission failed. Try again later.") });
    }
  }

  return (
    <form className="mockup-submission-form" onSubmit={submit} ref={formRef}>
      <label className="submission-honeypot" aria-hidden="true">Website<input name="website" type="text" tabIndex={-1} autoComplete="off" /></label>
      <section className="submission-form-section">
        <h2>{zh ? "GitHub 仓库" : "GitHub repository"}</h2>
        <label htmlFor="repositoryUrl">{zh ? "仓库地址" : "Repository URL"}</label>
        <div className="repository-input-row"><input id="repositoryUrl" name="repositoryUrl" type="url" inputMode="url" placeholder="https://github.com/owner/repository" required maxLength={300} onChange={() => setPreview(null)} /><button type="button" onClick={(event) => verifyRepository(event.currentTarget.form!)}>{zh ? "验证仓库" : "Verify repository"}</button></div>
        {preview ? <div className="repository-preview"><div className="repository-avatar">◉</div><div><strong>{preview.owner}/{preview.repo}</strong><span>{zh ? "地址格式有效，正式接入后将读取 GitHub 元数据" : "The URL is valid. GitHub metadata will be reviewed during intake."}</span></div><b>✓ {zh ? "公开仓库格式" : "Public repository format"}</b></div> : null}
      </section>

      <section className="submission-form-section">
        <h2>{zh ? "资源信息" : "Resource information"}</h2>
        <fieldset className="category-radio-group"><legend>{zh ? "资源类型" : "Resource type"}</legend>{categories.map(([value, icon, label]) => <label key={value}><input type="radio" name="category" value={value} defaultChecked={value === "skills"} /><span>{icon}</span>{label}</label>)}</fieldset>
        <div className="submission-fields-grid">
          <div className="field"><label htmlFor="componentPath">{zh ? "组件路径（可选）" : "Component path (optional)"}</label><input id="componentPath" name="componentPath" maxLength={300} placeholder={zh ? "如：skills/code-review" : "e.g. skills/code-review"} /></div>
          <div className="field"><label htmlFor="displayName">{zh ? "中文名称" : "Display name"}</label><input id="displayName" name="displayName" maxLength={180} placeholder={zh ? "请输入中文名称" : "Enter a display name"} /></div>
          <div className="field wide-field"><label htmlFor="notes">{zh ? "中文简介" : "Project notes"}</label><textarea id="notes" name="notes" rows={4} maxLength={1000} placeholder={zh ? "请说明它解决什么问题、组件在哪里以及支持哪些 Agent" : "Explain what it solves, where the component lives, and which agents it supports"} /></div>
        </div>
        <fieldset className="host-checkboxes"><legend>{zh ? "兼容平台（可多选）" : "Compatible platforms"}</legend>{["Codex", "Claude Code", "Cursor", "OpenCode", "DSH"].map((host) => <label key={host}><input type="checkbox" name="hosts" value={host} />{host}</label>)}</fieldset>
        <label className="rules-confirm"><input type="checkbox" name="confirmRules" required />{zh ? "我确认该项目符合 " : "I confirm this project follows the "}<Link href={localizedPath("/guidelines", locale)}>{zh ? "收录规则" : "submission guidelines"}</Link></label>
        <div className="submission-actions"><button type="button" onClick={(event) => saveDraft(event.currentTarget.form!)}>{draftSaved ? (zh ? "已保存到本机" : "Saved locally") : (zh ? "保存到本机" : "Save locally")}</button><button className="primary" type="submit" disabled={state.status === "loading"}>{state.status === "loading" ? (zh ? "正在检查…" : "Checking…") : (zh ? "提交审核" : "Submit for review")}</button></div>
        <button className="submission-clear-draft" type="button" onClick={(event) => clearDraft(event.currentTarget.form!)}>{zh ? "清除本机草稿" : "Clear local draft"}</button>
        {state.status === "success" ? <div className="form-notice success" role="status"><strong>{zh ? "提交格式有效" : "Submission received"}</strong><p>{state.message}</p></div> : null}
        {state.status === "error" ? <div className="form-notice error" role="alert"><strong>{zh ? "暂时无法提交" : "Unable to submit"}</strong><p>{state.message}</p></div> : null}
      </section>
    </form>
  );
}
