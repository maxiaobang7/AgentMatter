import { formatZodIssues, resourceSchema } from "@/lib/resource-schema";
import { authenticateAgent } from "@/server/agent-auth";
import { apiError, assertBodySize, unauthorized } from "@/server/api-response";
import { getCatalogTaxonomy } from "@/server/catalog";

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
    if (parsed.data.taxonomy) {
      const taxonomy = await getCatalogTaxonomy();
      const activeTopics = new Set(taxonomy[parsed.data.category].topics.map((topic) => topic.slug));
      const selectedTopics = [parsed.data.taxonomy.primaryTopic, ...(parsed.data.taxonomy.secondaryTopics ?? [])];
      const missingTopics = selectedTopics.filter((topic) => !activeTopics.has(topic));
      if (missingTopics.length) {
        return Response.json({
          ok: false,
          valid: false,
          issues: missingTopics.map((topic) => ({ path: "taxonomy", message: `能力领域不存在或已停用：${topic}` })),
        }, { status: 422 });
      }
    }
    return Response.json({ ok: true, valid: true, resource: parsed.data });
  } catch (error) {
    return apiError(error);
  }
}
