import { ContentOperationError } from "@/server/content-errors";

export function apiError(error: unknown) {
  if (error instanceof ContentOperationError) {
    return Response.json({ ok: false, error: { code: error.code, message: error.message } }, { status: error.status });
  }
  console.error(error);
  return Response.json({ ok: false, error: { code: "internal_error", message: "服务器处理失败" } }, { status: 500 });
}

export function unauthorized() {
  return Response.json({ ok: false, error: { code: "unauthorized", message: "Token 无效或权限不足" } }, { status: 401 });
}

export function assertIdempotencyKey(request: Request, operationId: string) {
  const key = request.headers.get("idempotency-key");
  if (!key || key !== operationId) throw new ContentOperationError("Idempotency-Key 必须与 operationId 一致", 400, "invalid_idempotency_key");
}

export function assertBodySize(request: Request, maxBytes = 600_000) {
  const length = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(length) && length > maxBytes) throw new ContentOperationError("请求内容过大", 413, "payload_too_large");
}
