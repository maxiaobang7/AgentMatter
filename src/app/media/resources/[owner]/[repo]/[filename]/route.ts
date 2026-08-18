import { apiError } from "@/server/api-response";
import { readResourceMedia } from "@/server/media-storage";

export const runtime = "nodejs";

export async function GET(_request: Request, context: RouteContext<"/media/resources/[owner]/[repo]/[filename]">) {
  try {
    const { owner, repo, filename } = await context.params;
    const bytes = await readResourceMedia(owner, repo, filename);
    return new Response(new Uint8Array(bytes), {
      headers: {
        "content-type": "image/webp",
        "cache-control": "public, max-age=31536000, immutable",
        "x-content-type-options": "nosniff",
      },
    });
  } catch (error) {
    return apiError(error);
  }
}
