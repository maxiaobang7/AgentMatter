import { authenticateAgent } from "@/server/agent-auth";
import { apiError, unauthorized } from "@/server/api-response";
import { getInventory } from "@/server/content-service";
import { isDatabaseConfigured } from "@/server/db";
import { resources as staticResources } from "@/data/resources";
import { stableResourceKey } from "@/server/crypto";

export async function GET(request: Request) {
  try {
    const principal = await authenticateAgent(request, "resources:read");
    if (!principal) return unauthorized();
    if (!isDatabaseConfigured()) return Response.json({ ok: true, mode: "static-fallback", resources: staticResources.map((resource) => ({ stableKey: stableResourceKey(resource.owner, resource.repo, resource.componentPath), resourceId: resource.id, category: resource.category, status: "published", seoTitle: resource.seo?.title ?? null, version: 1, updatedAt: resource.updatedAt })) });
    return Response.json({ ok: true, mode: "database", resources: await getInventory() });
  } catch (error) {
    return apiError(error);
  }
}
