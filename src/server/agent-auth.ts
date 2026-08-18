import "server-only";

import { timingSafeEqual } from "node:crypto";
import type { RowDataPacket } from "mysql2/promise";
import { executeStatement, isDatabaseConfigured, queryRows } from "@/server/db";
import { sha256 } from "@/server/crypto";

export type AgentScope = "resources:read" | "resources:validate" | "resources:draft" | "resources:publish" | "resources:update" | "resources:unpublish" | "resources:rollback" | "media:write";

type TokenRow = RowDataPacket & { id: number; name: string; token_hash: string; scopes_json: string | AgentScope[] };

function equalHash(left: string, right: string) {
  if (!/^[a-f0-9]{64}$/i.test(left) || !/^[a-f0-9]{64}$/i.test(right)) return false;
  return timingSafeEqual(Buffer.from(left, "hex"), Buffer.from(right, "hex"));
}

function bearerToken(request: Request) {
  const authorization = request.headers.get("authorization") ?? "";
  const [scheme, token] = authorization.split(" ");
  return scheme?.toLowerCase() === "bearer" && token?.length >= 24 ? token : undefined;
}

export async function authenticateAgent(request: Request, requiredScope: AgentScope) {
  const token = bearerToken(request);
  if (!token) return null;
  const hash = sha256(token);

  const bootstrapHash = process.env.AGENT_API_TOKEN_SHA256;
  if (bootstrapHash && equalHash(hash, bootstrapHash)) {
    return { actor: "codex:bootstrap", scopes: ["*"] as const };
  }

  if (!isDatabaseConfigured()) return null;
  const rows = await queryRows<TokenRow[]>(
    "SELECT id, name, token_hash, scopes_json FROM api_tokens WHERE enabled = 1 AND token_prefix = ? LIMIT 20",
    [token.slice(0, 12)],
  );
  const matched = rows.find((row) => equalHash(hash, row.token_hash));
  if (!matched) return null;
  const scopes = typeof matched.scopes_json === "string" ? JSON.parse(matched.scopes_json) as AgentScope[] : matched.scopes_json;
  if (!scopes.includes(requiredScope)) return null;
  void executeStatement("UPDATE api_tokens SET last_used_at = CURRENT_TIMESTAMP(3) WHERE id = ?", [matched.id]).catch(() => undefined);
  return { actor: `codex:${matched.name}`, scopes };
}
