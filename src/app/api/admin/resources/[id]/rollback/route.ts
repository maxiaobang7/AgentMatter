import { randomUUID } from "node:crypto";
import { z } from "zod";
import { isAdminMutationAllowed } from "@/server/admin-auth";
import { apiError } from "@/server/api-response";
import { refreshCatalogPaths } from "@/server/agent-route";
import { rollbackResource } from "@/server/content-service";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!await isAdminMutationAllowed(request)) return Response.json({ ok: false, error: "未登录或来源无效" }, { status: 401 });
    const { id } = await params;
    const resourceId = Number(id);
    if (!Number.isSafeInteger(resourceId) || resourceId <= 0) return Response.json({ ok: false, error: "资源 ID 无效" }, { status: 400 });
    const body = z.object({ version: z.number().int().positive(), note: z.string().max(500).optional() }).parse(await request.json());
    const result = await rollbackResource({ operationId: `admin:${randomUUID()}`, resourceId, version: body.version, note: body.note, actor: "admin:web" });
    refreshCatalogPaths(result.path as string);
    return Response.json({ ok: true, result });
  } catch (error) {
    return apiError(error);
  }
}
