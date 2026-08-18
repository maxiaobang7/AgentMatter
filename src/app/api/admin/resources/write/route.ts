import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { formatZodIssues, resourceSchema } from "@/lib/resource-schema";
import { isAdminMutationAllowed } from "@/server/admin-auth";
import { apiError } from "@/server/api-response";
import { refreshCatalogPaths } from "@/server/agent-route";
import { writeResource } from "@/server/content-service";

const requestSchema = z.object({ action: z.enum(["draft", "publish", "update"]), resource: resourceSchema, note: z.string().max(500).optional() }).strict();

export async function POST(request: Request) {
  try {
    if (!await isAdminMutationAllowed(request)) return Response.json({ ok: false, error: "未登录或来源无效" }, { status: 401 });
    const parsed = requestSchema.safeParse(await request.json());
    if (!parsed.success) return Response.json({ ok: false, error: "内容校验失败", issues: formatZodIssues(parsed.error) }, { status: 422 });
    const operationId = `admin:${randomUUID()}`;
    const result = await writeResource({ ...parsed.data, operationId, actor: "admin:web" });
    refreshCatalogPaths(result.path as string);
    revalidatePath("/admin");
    return Response.json({ ok: true, result });
  } catch (error) {
    return apiError(error);
  }
}
