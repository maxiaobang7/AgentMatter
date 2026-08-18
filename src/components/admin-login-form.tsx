"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminLoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const response = await fetch("/api/admin/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ password }) });
    const body = await response.json();
    setBusy(false);
    if (!response.ok) return setError(body.error ?? "登录失败");
    router.replace("/admin");
    router.refresh();
  }

  return <form className="admin-login-form" onSubmit={submit}><label>管理员密码<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required /></label>{error ? <p role="alert">{error}</p> : null}<button type="submit" disabled={busy}>{busy ? "正在验证…" : "进入后台"}</button></form>;
}
