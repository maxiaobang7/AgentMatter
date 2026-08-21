import { revalidatePath } from "next/cache";
import { z } from "zod";
import { taxonomyTopicInputSchema } from "@/lib/taxonomy-admin";
import { isAdminMutationAllowed } from "@/server/admin-auth";
import { apiError } from "@/server/api-response";
import { parseTaxonomyTopicUpdate, setTaxonomyTopicActive, updateTaxonomyTopic } from "@/server/taxonomy-service";

const requestSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("update"), topic: taxonomyTopicInputSchema }).strict(),
  z.object({ action: z.literal("set-active"), active: z.boolean(), category: z.enum(["skills", "dsh", "plugins", "mcp", "prompts"]) }).strict(),
]);

function refreshTaxonomy(category: string) {
  revalidatePath("/admin/taxonomy");
  revalidatePath(`/${category}`);
  revalidatePath(`/zh/${category}`);
  revalidatePath("/");
  revalidatePath("/zh");
  revalidatePath("/search");
  revalidatePath("/zh/search");
}
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    if (!await isAdminMutationAllowed(request)) return Response.json({ ok: false, error: { message: "未登录或来源无效" } }, { status: 401 });
    const { id } = await context.params;
    if (!/^\d+$/.test(id)) return Response.json({ ok: false, error: { message: "能力领域编号无效" } }, { status: 400 });
    const parsed = requestSchema.safeParse(await request.json());
    if (!parsed.success) return Response.json({ ok: false, error: { message: "能力领域数据无效" } }, { status: 422 });
    const result = parsed.data.action === "update"
      ? await updateTaxonomyTopic(Number(id), parseTaxonomyTopicUpdate(parsed.data.topic))
      : await setTaxonomyTopicActive(Number(id), parsed.data.active);
    const category = parsed.data.action === "update" ? parsed.data.topic.category : parsed.data.category;
    refreshTaxonomy(category);
    return Response.json({ ok: true, result });
  } catch (error) {
    return apiError(error);
  }
}
