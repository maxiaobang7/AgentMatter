import { revalidatePath } from "next/cache";
import { z } from "zod";
import { isAdminMutationAllowed } from "@/server/admin-auth";
import { executeStatement } from "@/server/db";

const requestSchema = z.object({ status: z.enum(["new", "reviewing", "accepted", "rejected"]) }).strict();

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!await isAdminMutationAllowed(request)) return Response.json({ ok: false, error: "未登录或来源无效" }, { status: 401 });
  const { id } = await context.params;
  if (!/^\d+$/.test(id)) return Response.json({ ok: false, error: "投稿编号无效" }, { status: 400 });
  const parsed = requestSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ ok: false, error: "审核状态无效" }, { status: 422 });
  const result = await executeStatement("UPDATE submissions SET status = ? WHERE id = ?", [parsed.data.status, Number(id)]);
  if (!result.affectedRows) return Response.json({ ok: false, error: "投稿不存在" }, { status: 404 });
  revalidatePath("/admin");
  revalidatePath("/admin/submissions");
  return Response.json({ ok: true, status: parsed.data.status });
}
