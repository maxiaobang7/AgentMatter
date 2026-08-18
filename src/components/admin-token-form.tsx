"use client";

import { useState } from "react";

const scopes = ["resources:read", "resources:validate", "resources:draft", "resources:publish", "resources:update", "resources:unpublish", "resources:rollback", "media:write"];

export function AdminTokenForm() {
  const [name, setName] = useState("本地 Codex");
  const [token, setToken] = useState("");
  const [error, setError] = useState("");

  async function create(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    const response = await fetch("/api/admin/tokens", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name, scopes }) });
    const body = await response.json();
    if (!response.ok) return setError(body.error?.message ?? body.error ?? "创建失败");
    setToken(body.token);
  }

  return <form className="admin-token-form" onSubmit={create}><label>Token 名称<input value={name} onChange={(event) => setName(event.target.value)} required /></label><button type="submit">生成全权限运营 Token</button>{error ? <p role="alert">{error}</p> : null}{token ? <div className="admin-secret"><strong>仅显示一次，请复制到本地环境变量</strong><code>{token}</code></div> : null}</form>;
}
