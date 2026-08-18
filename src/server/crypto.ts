import { createHash } from "node:crypto";

export function sha256(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

export function stableResourceKey(owner: string, repo: string, componentPath?: string) {
  const base = `${owner.trim().toLowerCase()}/${repo.trim().toLowerCase()}`;
  return componentPath?.trim() ? `${base}#${componentPath.trim().toLowerCase()}` : base;
}
