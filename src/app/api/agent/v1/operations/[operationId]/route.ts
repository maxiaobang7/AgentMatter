import { authenticateAgent } from "@/server/agent-auth";
import { apiError, unauthorized } from "@/server/api-response";
import { getOperation } from "@/server/content-service";

export async function GET(request: Request, { params }: { params: Promise<{ operationId: string }> }) {
  try {
    const principal = await authenticateAgent(request, "resources:read");
    if (!principal) return unauthorized();
    const { operationId } = await params;
    const operation = await getOperation(operationId);
    if (!operation) return Response.json({ ok: false, error: { code: "not_found", message: "操作不存在" } }, { status: 404 });
    return Response.json({ ok: true, result: operation });
  } catch (error) {
    return apiError(error);
  }
}
