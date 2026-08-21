"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function messageFrom(body: unknown) {
  if (!body || typeof body !== "object" || !("error" in body)) return "操作失败";
  const error = body.error;
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") return error.message;
  return "操作失败";
}
export function AdminResourceStatusActions({ resourceId, status }: { resourceId: number; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function run(action: "draft" | "archive") {
    const prompt = action === "draft"
      ? "转为草稿后，资源会立即从前台隐藏，但内容和版本仍会保留。确认继续？"
      : "归档删除后，资源会从前台隐藏并保留历史记录。确认继续？";
    if (!window.confirm(prompt)) return;
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(`/api/admin/resources/${resourceId}/status`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action, note: action === "draft" ? "管理员转为草稿" : "管理员归档删除" }) });
      const body = await response.json();
      if (!response.ok) throw new Error(messageFrom(body));
      setMessage(action === "draft" ? "已转为草稿，前台已隐藏" : "已归档，前台已隐藏");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "操作失败");
    } finally {
      setBusy(false);
    }
  }

  if (status === "archived") return <div className="admin-status-actions archived"><strong>该资源已归档</strong><p>内容和版本仍然保留。如需恢复，可以检查内容后重新发布。</p></div>;

  return (
    <div className="admin-status-actions">
      <div><h2>资源状态操作</h2><p>状态操作会写入审计记录，并立即刷新前台目录。</p></div>
      <div className="admin-status-buttons">
        {status !== "draft" ? <button disabled={busy} onClick={() => void run("draft")} type="button">转为草稿</button> : <span>当前已经是草稿</span>}
        <button className="danger" disabled={busy} onClick={() => void run("archive")} type="button">归档删除</button>
      </div>
      {message ? <p role="status">{message}</p> : null}
    </div>
  );
}
