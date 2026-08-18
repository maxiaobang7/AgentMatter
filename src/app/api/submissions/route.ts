import { createHash } from "node:crypto";
import type { RowDataPacket } from "mysql2/promise";
import { NextResponse } from "next/server";
import { normalizeGitHubRepository, submissionSchema } from "@/lib/submission-schema";
import { executeStatement, isDatabaseConfigured, queryRows } from "@/server/db";

const MAX_BODY_BYTES = 12_000;
const MAX_SUBMISSIONS_PER_HOUR = 5;

function requestIpHash(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || request.headers.get("x-real-ip")?.trim() || "unknown";
  return createHash("sha256").update(`${process.env.SESSION_SECRET ?? "agentmatter-local"}:${ip}`).digest("hex");
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BODY_BYTES) return NextResponse.json({ error: "提交内容过大" }, { status: 413 });

  let rawBody: unknown;
  try { rawBody = await request.json(); } catch { return NextResponse.json({ error: "请求格式无效" }, { status: 400 }); }
  const parsed = submissionSchema.safeParse(rawBody);
  if (!parsed.success) return NextResponse.json({ error: "提交字段无效", issues: parsed.error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })) }, { status: 400 });
  if (parsed.data.website) return NextResponse.json({ accepted: true, message: "项目已进入审核队列。" }, { status: 201 });

  const repository = normalizeGitHubRepository(parsed.data.repositoryUrl);
  if (!repository) return NextResponse.json({ error: "请输入有效的 GitHub 仓库地址" }, { status: 400 });
  const submission = {
    ...repository,
    category: parsed.data.category ?? null,
    componentPath: parsed.data.componentPath,
    displayName: parsed.data.displayName,
    hosts: [...new Set(parsed.data.hosts)],
    notes: parsed.data.notes,
  };

  if (!isDatabaseConfigured()) return NextResponse.json({
    accepted: true,
    previewOnly: true,
    submission,
    message: "当前未配置数据库：地址已通过格式检查，但尚未写入审核队列。",
  }, { status: 202 });

  const existing = await queryRows<(RowDataPacket & { id: number; status: string })[]>("SELECT id, status FROM submissions WHERE github_url = ? AND status IN ('new', 'reviewing') ORDER BY created_at DESC LIMIT 1", [repository.canonicalUrl]);
  if (existing[0]) return NextResponse.json({ accepted: true, duplicate: true, previewOnly: false, submissionId: existing[0].id, submission, message: "该项目已在审核队列中，无需重复提交。" }, { status: 200 });

  const ipHash = requestIpHash(request);
  const recent = await queryRows<(RowDataPacket & { total: number })[]>("SELECT COUNT(*) AS total FROM submissions WHERE ip_hash = ? AND created_at >= DATE_SUB(UTC_TIMESTAMP(3), INTERVAL 1 HOUR)", [ipHash]);
  if ((recent[0]?.total ?? 0) >= MAX_SUBMISSIONS_PER_HOUR) return NextResponse.json({ error: "提交过于频繁，请一小时后再试" }, { status: 429, headers: { "Retry-After": "3600" } });

  const result = await executeStatement("INSERT INTO submissions (github_url, category, component_path, display_name, hosts_json, note, ip_hash) VALUES (?, ?, ?, ?, ?, ?, ?)", [repository.canonicalUrl, submission.category, submission.componentPath || null, submission.displayName || null, JSON.stringify(submission.hosts), submission.notes || null, ipHash]);
  return NextResponse.json({ accepted: true, previewOnly: false, submissionId: result.insertId, submission, message: "项目已进入审核队列。" }, { status: 201 });
}
