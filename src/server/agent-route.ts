import "server-only";

import { revalidatePath } from "next/cache";
import { formatZodIssues, resourceWriteRequestSchema } from "@/lib/resource-schema";
import { authenticateAgent, type AgentScope } from "@/server/agent-auth";
import { apiError, assertBodySize, assertIdempotencyKey, unauthorized } from "@/server/api-response";
import { ContentOperationError, writeResource, type WriteAction } from "@/server/content-service";
import { isDatabaseConfigured } from "@/server/db";

export function refreshCatalogPaths(path?: string) {
  revalidatePath("/");
  revalidatePath("/search");
  revalidatePath("/sitemap.xml");
  if (path) revalidatePath(path);
  for (const category of ["skills", "dsh", "plugins", "mcp", "prompts"]) revalidatePath(`/${category}`);
}

export async function handleResourceWrite(request: Request, action: WriteAction, scope: AgentScope) {
  try {
    const principal = await authenticateAgent(request, scope);
    if (!principal) return unauthorized();
    assertBodySize(request);
    if (!isDatabaseConfigured()) throw new ContentOperationError("DATABASE_URL 未配置，写入功能不可用", 503, "database_not_configured");
    const parsed = resourceWriteRequestSchema.safeParse(await request.json());
    if (!parsed.success) {
      return Response.json({ ok: false, error: { code: "validation_failed", message: "资源内容未通过契约校验", issues: formatZodIssues(parsed.error) } }, { status: 422 });
    }
    assertIdempotencyKey(request, parsed.data.operationId);
    const result = await writeResource({ ...parsed.data, action, actor: principal.actor });
    refreshCatalogPaths(result.path as string);
    return Response.json({ ok: true, result }, { status: result.changed ? 201 : 200 });
  } catch (error) {
    return apiError(error);
  }
}
