import { randomBytes } from "node:crypto";
import { z } from "zod";
import { isAdminMutationAllowed } from "@/server/admin-auth";
import { apiError } from "@/server/api-response";
import { sha256 } from "@/server/crypto";
import { executeStatement } from "@/server/db";

const scopes = ["resources:read", "resources:validate", "resources:draft", "resources:publish", "resources:update", "resources:unpublish", "resources:rollback", "media:write"] as const;
const schema = z.object({ name: z.string().trim().min(2).max(100), scopes: z.array(z.enum(scopes)).min(1) }).strict();

export async function POST(request: Request) {
  try {
    if (!await isAdminMutationAllowed(request)) return Response.json({ ok: false, error: "未登录或来源无效" }, { status: 401 });
    const body = schema.parse(await request.json());
    const token = `am_${randomBytes(32).toString("base64url")}`;
    await executeStatement("INSERT INTO api_tokens (name, token_prefix, token_hash, scopes_json) VALUES (?, ?, ?, ?)", [body.name, token.slice(0, 12), sha256(token), JSON.stringify(body.scopes)]);
    return Response.json({ ok: true, token, warning: "Token 只显示这一次，请立即保存到本地 .env" }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
