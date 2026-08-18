"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const options = [["new", "新提交"], ["reviewing", "审核中"], ["accepted", "已接收"], ["rejected", "已拒绝"]] as const;

export function AdminSubmissionStatus({ id, initialStatus }: { id: number; initialStatus: string }) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function update(nextStatus: string) {
    setStatus(nextStatus);
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/submissions/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: nextStatus }) });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "状态更新失败");
      router.refresh();
    } catch (caught) {
      setStatus(initialStatus);
      setError(caught instanceof Error ? caught.message : "状态更新失败");
    } finally {
      setBusy(false);
    }
  }

  return <div className="admin-submission-status"><select aria-label="审核状态" disabled={busy} value={status} onChange={(event) => update(event.target.value)}>{options.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>{error ? <small role="alert">{error}</small> : null}</div>;
}
