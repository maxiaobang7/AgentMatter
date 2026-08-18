"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminRollbackButton({ resourceId, version }: { resourceId: number; version: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return <button className="admin-link-button" disabled={busy} onClick={async () => {
    if (!window.confirm(`确认恢复到版本 ${version}？系统会创建一个新的回滚版本。`)) return;
    setBusy(true);
    const response = await fetch(`/api/admin/resources/${resourceId}/rollback`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ version, note: "管理员后台回滚" }) });
    setBusy(false);
    if (!response.ok) return window.alert("回滚失败");
    router.refresh();
  }}>{busy ? "处理中…" : "恢复此版本"}</button>;
}
