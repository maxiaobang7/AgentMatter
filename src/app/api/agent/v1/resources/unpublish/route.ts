import { z } from "zod";
import { authenticateAgent } from "@/server/agent-auth";
import { apiError, assertBodySize, assertIdempotencyKey, unauthorized } from "@/server/api-response";
import { formatZodIssues } from "@/lib/resource-schema";
import { refreshCatalogPaths } from "@/server/agent-route";
import { unpublishResource } from "@/server/content-service";

const schema = z.object({
  operationId: z.string().min(8).max(120),
  owner: z.string().min(1).max(100),
  repo: z.string().min(1).max(100),
  componentPath: z.string().max(300).optional(),
  note: z.string().max(500).optional(),
}).strict();

export async function POST(request: Request) {
  try {
    const principal = await authenticateAgent(request, "resources:unpublish");
    if (!principal) return unauthorized();
    assertBodySize(request, 20_000);
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return Response.json({ ok: false, error: { code: "validation_failed", issues: formatZodIssues(parsed.error) } }, { status: 422 });
    assertIdempotencyKey(request, parsed.data.operationId);
    const result = await unpublishResource({ ...parsed.data, actor: principal.actor });
    refreshCatalogPaths();
    return Response.json({ ok: true, result });
  } catch (error) {
    return apiError(error);
  }
}
