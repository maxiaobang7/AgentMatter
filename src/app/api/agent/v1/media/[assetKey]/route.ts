import type { RowDataPacket } from "mysql2/promise";
import { authenticateAgent } from "@/server/agent-auth";
import { apiError, unauthorized } from "@/server/api-response";
import { queryRows } from "@/server/db";

type AssetRow = RowDataPacket & {
  asset_key: string;
  owner: string;
  repo: string;
  source_url: string;
  public_url: string;
  content_hash: string;
  mime_type: string;
  width: number;
  height: number;
  byte_size: number;
  created_at: Date;
  updated_at: Date;
};

export async function GET(request: Request, context: RouteContext<"/api/agent/v1/media/[assetKey]">) {
  try {
    const principal = await authenticateAgent(request, "resources:read");
    if (!principal) return unauthorized();
    const { assetKey } = await context.params;
    const rows = await queryRows<AssetRow[]>(
      "SELECT asset_key, owner, repo, source_url, public_url, content_hash, mime_type, width, height, byte_size, created_at, updated_at FROM media_assets WHERE asset_key = ? LIMIT 1",
      [assetKey],
    );
    if (!rows[0]) return Response.json({ ok: false, error: { code: "media_not_found", message: "媒体记录不存在" } }, { status: 404 });
    const row = rows[0];
    return Response.json({ ok: true, asset: { assetKey: row.asset_key, owner: row.owner, repo: row.repo, sourceUrl: row.source_url, publicUrl: row.public_url, contentHash: row.content_hash, mimeType: row.mime_type, width: row.width, height: row.height, bytes: row.byte_size, createdAt: row.created_at, updatedAt: row.updated_at } });
  } catch (error) {
    return apiError(error);
  }
}
