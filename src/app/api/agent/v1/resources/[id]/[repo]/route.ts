import { authenticateAgent } from "@/server/agent-auth";
import { apiError, unauthorized } from "@/server/api-response";
import { getCatalogResource } from "@/server/catalog";
import { getStoredResource } from "@/server/content-service";
import { stableResourceKey } from "@/server/crypto";
import { isDatabaseConfigured } from "@/server/db";

export async function GET(request: Request, { params }: { params: Promise<{ id: string; repo: string }> }) {
  try {
    const principal = await authenticateAgent(request, "resources:read");
    if (!principal) return unauthorized();
    const { id: owner, repo } = await params;
    const componentPath = new URL(request.url).searchParams.get("component") ?? undefined;
    if (!isDatabaseConfigured()) {
      const resource = await getCatalogResource(owner, repo, componentPath);
      if (!resource) return Response.json({ ok: false, error: { code: "not_found", message: "资源不存在" } }, { status: 404 });
      return Response.json({ ok: true, result: { stableKey: stableResourceKey(owner, repo, componentPath), status: "published", version: 1, resource, mode: "static-fallback" } });
    }
    const resource = await getStoredResource(owner, repo, componentPath);
    if (!resource) return Response.json({ ok: false, error: { code: "not_found", message: "资源不存在" } }, { status: 404 });
    return Response.json({ ok: true, result: resource });
  } catch (error) {
    return apiError(error);
  }
}
