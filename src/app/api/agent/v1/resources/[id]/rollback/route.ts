import { z } from "zod";
import { formatZodIssues } from "@/lib/resource-schema";
import { authenticateAgent } from "@/server/agent-auth";
import { apiError, assertBodySize, assertIdempotencyKey, unauthorized } from "@/server/api-response";
import { refreshCatalogPaths } from "@/server/agent-route";
import { rollbackResource } from "@/server/content-service";

const schema = z.object({ operationId: z.string().min(8).max(120), version: z.number().int().positive(), note: z.string().max(500).optional() }).strict();

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const principal = await authenticateAgent(request, "resources:rollback");
    if (!principal) return unauthorized();
    assertBodySize(request, 20_000);
    const { id } = await params;
    const resourceId = Number(id);
    if (!Number.isSafeInteger(resourceId) || resourceId <= 0) return Response.json({ ok: false, error: { code: "invalid_resource_id", message: "资源 ID 无效" } }, { status: 400 });
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return Response.json({ ok: false, error: { code: "validation_failed", issues: formatZodIssues(parsed.error) } }, { status: 422 });
    assertIdempotencyKey(request, parsed.data.operationId);
    const result = await rollbackResource({ ...parsed.data, resourceId, actor: principal.actor });
    refreshCatalogPaths(result.path as string);
    return Response.json({ ok: true, result });
  } catch (error) {
    return apiError(error);
  }
}
