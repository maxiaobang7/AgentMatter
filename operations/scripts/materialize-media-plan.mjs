import { readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { compressImageToWebp } from "./media-processing.mjs";

const planFile = path.resolve(process.argv[2] ?? "operations/batch25-media-plan.json");
const plan = JSON.parse(await readFile(planFile, "utf8"));
const stagingRoot = path.resolve("operations/media-staging");
const draftRoot = path.resolve("operations/drafts");
const allowedHosts = new Set(["github.com", "raw.githubusercontent.com"]);

function assertGitHubUrl(value, label) {
  const url = new URL(value);
  if (url.protocol !== "https:" || !allowedHosts.has(url.hostname)) {
    throw new Error(`${label} 必须是 GitHub HTTPS 地址`);
  }
  return url.toString();
}

function resolveInside(root, value, label) {
  const target = path.resolve(root, value);
  if (target !== root && !target.startsWith(`${root}${path.sep}`)) throw new Error(`${label} 路径越界`);
  return target;
}

async function loadSource(source) {
  if (source.type === "screenshot") {
    return readFile(resolveInside(stagingRoot, source.file, "截图"));
  }
  if (source.type !== "remote") throw new Error(`未知媒体来源类型: ${source.type}`);
  const url = assertGitHubUrl(source.url, "远程图片");
  const response = await fetch(url, { headers: { "user-agent": "AgentMatter-Codex/1.0", accept: "image/*" }, redirect: "follow" });
  if (!response.ok) throw new Error(`${url} 下载失败 HTTP ${response.status}`);
  const contentType = (response.headers.get("content-type") ?? "").split(";")[0].trim();
  if (!contentType.startsWith("image/")) throw new Error(`${url} 不是图片 (${contentType || "unknown"})`);
  return Buffer.from(await response.arrayBuffer());
}

function upsertMedia(items, media) {
  const current = Array.isArray(items) ? items : [];
  const index = current.findIndex((item) => item.id === media.id);
  if (index === -1) current.push(media);
  else current[index] = media;
  return current;
}

const results = [];
for (const item of plan) {
  const draftPath = resolveInside(draftRoot, item.draft, "草稿");
  const resource = JSON.parse(await readFile(draftPath, "utf8"));
  const sourceUrl = assertGitHubUrl(item.sourceUrl, "图片来源");
  const evidenceUrl = assertGitHubUrl(item.evidenceUrl, "图片证据");
  const sourceBytes = await loadSource(item.source);
  const compressed = await compressImageToWebp(sourceBytes);
  const preparedDirectory = path.join(stagingRoot, "prepared", resource.owner.toLowerCase(), resource.repo.toLowerCase());
  await mkdir(preparedDirectory, { recursive: true });
  const preparedPath = path.join(preparedDirectory, `${item.id}.webp`);
  await writeFile(preparedPath, compressed.bytes);

  const base = {
    id: item.id,
    src: pathToFileURL(preparedPath).toString(),
    sourceUrl,
    evidenceUrl,
    kind: item.kind,
    placement: item.placement,
    width: compressed.width,
    height: compressed.height,
  };
  resource.detail.media = upsertMedia(resource.detail.media, {
    ...base,
    alt: item.altZh,
    caption: item.captionZh,
  });
  resource.localizations.en.detail.media = upsertMedia(resource.localizations.en.detail.media, {
    ...base,
    alt: item.altEn,
    caption: item.captionEn,
  });
  resource.provenance.sourceUrls = [...new Set([...resource.provenance.sourceUrls, sourceUrl, evidenceUrl])];
  await writeFile(draftPath, `${JSON.stringify(resource, null, 2)}\n`, "utf8");
  results.push({
    draft: item.draft,
    id: item.id,
    sourceType: item.source.type,
    sourceBytes: compressed.sourceBytes,
    webpBytes: compressed.outputBytes,
    width: compressed.width,
    height: compressed.height,
    preparedPath,
  });
}

console.log(JSON.stringify({ completedAt: new Date().toISOString(), count: results.length, results }, null, 2));
