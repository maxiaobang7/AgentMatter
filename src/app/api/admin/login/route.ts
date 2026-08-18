import { createAdminSession, isTrustedAdminOrigin, verifyAdminPassword } from "@/server/admin-auth";

export async function POST(request: Request) {
  if (!isTrustedAdminOrigin(request)) return Response.json({ ok: false, error: "来源校验失败" }, { status: 403 });
  const body = await request.json().catch(() => null) as { password?: unknown } | null;
  if (typeof body?.password !== "string" || body.password.length > 300 || !verifyAdminPassword(body.password)) {
    await new Promise((resolve) => setTimeout(resolve, 250));
    return Response.json({ ok: false, error: "密码错误" }, { status: 401 });
  }
  await createAdminSession();
  return Response.json({ ok: true });
}
