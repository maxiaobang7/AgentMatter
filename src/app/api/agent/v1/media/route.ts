import { z } from "zod";
import { authenticateAgent } from "@/server/agent-auth";
import { apiError, assertBodySize, unauthorized } from "@/server/api-response";
import { ContentOperationError } from "@/server/content-service";
import { executeStatement, isDatabaseConfigured } from "@/server/db";
import { storeResourceMedia } from "@/server/media-storage";

export const runtime = "nodejs";

const fieldsSchema = z.object({
  owner: z.string().trim().min(1).max(100),
  repo: z.string().trim().min(1).max(100),
  sourceUrl: z.url(),
}).strict();

export async function POST(request: Request) {
  try {
    const principal = await authenticateAgent(request, "media:write");
    if (!principal) return unauthorized();
    assertBodySize(request, 8_500_000);
    if (!isDatabaseConfigured()) throw new ContentOperationError("DATABASE_URL 未配置，媒体写入不可用", 503, "database_not_configured");
    const form = await request.formData();
    const fields = fieldsSchema.parse({ owner: form.get("owner"), repo: form.get("repo"), sourceUrl: form.get("sourceUrl") });
    const file = form.get("file");
    if (!(file instanceof File)) throw new ContentOperationError("缺少图片文件", 422, "media_file_missing");
    const asset = await storeResourceMedia({ ...fields, bytes: new Uint8Array(await file.arrayBuffer()) });
    await executeStatement(
      `INSERT INTO media_assets
        (asset_key, owner, repo, source_url, public_url, content_hash, mime_type, width, height, byte_size, actor)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE source_url = VALUES(source_url), actor = VALUES(actor), updated_at = CURRENT_TIMESTAMP(3)`,
      [asset.assetKey, asset.owner, asset.repo, asset.sourceUrl, asset.publicUrl, asset.contentHash, asset.mimeType, asset.width, asset.height, asset.bytes, principal.actor],
    );
    return Response.json({ ok: true, asset }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
