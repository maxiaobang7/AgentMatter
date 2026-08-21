import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { isAdminMutationAllowed } from "@/server/admin-auth";
import { apiError } from "@/server/api-response";
import { refreshCatalogPaths } from "@/server/agent-route";
import { changeResourceStatus } from "@/server/content-service";

const requestSchema = z.object({ action: z.enum(["draft", "archive"]), note: z.string().max(500).optional() }).strict();

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    if (!await isAdminMutationAllowed(request)) return Response.json({ ok: false, error: { message: "未登录或来源无效" } }, { status: 401 });
    const { id } = await context.params;
    const resourceId = Number(id);
    if (!Number.isSafeInteger(resourceId) || resourceId <= 0) return Response.json({ ok: false, error: { message: "资源编号无效" } }, { status: 400 });
    const parsed = requestSchema.safeParse(await request.json());
    if (!parsed.success) return Response.json({ ok: false, error: { message: "资源状态操作无效" } }, { status: 422 });
    const result = await changeResourceStatus({ operationId: `admin:${randomUUID()}`, resourceId, action: parsed.data.action, actor: "admin:web", note: parsed.data.note });
    refreshCatalogPaths(result.path as string | undefined);
    revalidatePath("/admin");
    revalidatePath(`/admin/resources/${resourceId}`);
    return Response.json({ ok: true, result });
  } catch (error) {
    return apiError(error);
  }
}
