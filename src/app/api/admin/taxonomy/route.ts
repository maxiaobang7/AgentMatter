import { revalidatePath } from "next/cache";
import { isAdminMutationAllowed } from "@/server/admin-auth";
import { apiError } from "@/server/api-response";
import { createTaxonomyTopic } from "@/server/taxonomy-service";

function refreshTaxonomy(category: string) {
  revalidatePath("/admin/taxonomy");
  revalidatePath(`/${category}`);
  revalidatePath(`/zh/${category}`);
  revalidatePath("/");
  revalidatePath("/zh");
  revalidatePath("/search");
  revalidatePath("/zh/search");
}
export async function POST(request: Request) {
  try {
    if (!await isAdminMutationAllowed(request)) return Response.json({ ok: false, error: { message: "未登录或来源无效" } }, { status: 401 });
    const result = await createTaxonomyTopic(await request.json());
    refreshTaxonomy(result.category);
    return Response.json({ ok: true, result }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
