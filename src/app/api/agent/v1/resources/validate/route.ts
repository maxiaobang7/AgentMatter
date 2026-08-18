import { formatZodIssues, resourceSchema } from "@/lib/resource-schema";
import { authenticateAgent } from "@/server/agent-auth";
import { apiError, assertBodySize, unauthorized } from "@/server/api-response";

export async function POST(request: Request) {
  try {
    const principal = await authenticateAgent(request, "resources:validate");
    if (!principal) return unauthorized();
    assertBodySize(request);
    const body = await request.json();
    const candidate = body?.resource ?? body;
    const parsed = resourceSchema.safeParse(candidate);
    if (!parsed.success) {
      return Response.json({ ok: false, valid: false, issues: formatZodIssues(parsed.error) }, { status: 422 });
    }
    return Response.json({ ok: true, valid: true, resource: parsed.data });
  } catch (error) {
    return apiError(error);
  }
}
