import { isDatabaseConfigured, queryRows } from "@/server/db";

export async function GET() {
  if (!isDatabaseConfigured()) return Response.json({ ok: true, mode: "static-fallback", database: "not-configured" });
  try {
    await queryRows("SELECT 1 AS healthy");
    return Response.json({ ok: true, mode: "database", database: "connected" });
  } catch {
    return Response.json({ ok: false, mode: "database", database: "unavailable" }, { status: 503 });
  }
}
