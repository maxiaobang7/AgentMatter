import { destroyAdminSession } from "@/server/admin-auth";

export async function POST() {
  await destroyAdminSession();
  return Response.json({ ok: true });
}
