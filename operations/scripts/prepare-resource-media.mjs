import { writeFile, mkdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { api, loadResource } from "./common.mjs";
import { compressImageToWebp } from "./media-processing.mjs";

const githubHeaders = { "user-agent": "AgentMatter-Codex/1.0", accept: "image/*" };

function githubContentsFallback(source) {
  if (source.hostname !== "raw.githubusercontent.com") return undefined;
  const segments = source.pathname.split("/").filter(Boolean);
  if (segments.length < 4) return undefined;
  const [owner, repo, ref, ...assetPath] = segments;
  return `https://api.github.com/repos/${owner}/${repo}/contents/${assetPath.join("/")}?ref=${encodeURIComponent(ref)}`;
}

async function downloadGitHubImage(value) {
  const source = new URL(value);
  if (!["github.com", "raw.githubusercontent.com"].includes(source.hostname)) throw new Error("只允许下载 GitHub 图片");
  let response = await fetch(source, { headers: githubHeaders, redirect: "follow" });
  if (response.status === 429) {
    const fallback = githubContentsFallback(source);
    if (fallback) response = await fetch(fallback, { headers: { "user-agent": "AgentMatter-Codex/1.0", accept: "application/vnd.github.raw+json" }, redirect: "follow" });
  }
  if (!response.ok) throw new Error(`下载失败 HTTP ${response.status}`);
  const contentType = (response.headers.get("content-type") ?? "").split(";")[0].trim();
  if (!contentType.startsWith("image/") && contentType !== "application/vnd.github.raw+json") throw new Error(`来源不是图片 (${contentType || "unknown"})`);
  const contentLength = Number(response.headers.get("content-length") ?? 0);
  if (contentLength > 8_000_000) throw new Error("图片超过 8 MB");
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (!bytes.byteLength || bytes.byteLength > 8_000_000) throw new Error("图片为空或超过 8 MB");
  return { bytes, contentType: contentType.startsWith("image/") ? contentType : "application/octet-stream" };
}

async function readStagedMedia(value) {
  const source = new URL(value);
  if (source.protocol !== "file:") throw new Error("本地截图地址必须使用 file://");
  const stagingRoot = path.resolve("operations/media-staging");
  const target = path.resolve(fileURLToPath(source));
  if (target !== stagingRoot && !target.startsWith(`${stagingRoot}${path.sep}`)) {
    throw new Error("本地截图只能来自 operations/media-staging");
  }
  const bytes = new Uint8Array(await readFile(target));
  if (!bytes.byteLength || bytes.byteLength > 8_000_000) throw new Error("图片为空或超过 8 MB");
  const contentType = path.extname(target).toLowerCase() === ".webp" ? "image/webp" : "image/png";
  return { bytes, contentType };
}

async function main() {
  const { file, resource } = await loadResource(process.argv[2]);
  const media = resource.detail?.media ?? [];
  const pending = media.filter((item) => /^(?:https|file):\/\//.test(item.src));
  if (!pending.length) {
    console.log(`media ready: ${resource.owner}/${resource.repo} (${media.length} local assets)`);
    return;
  }

  const readbacks = [];
  for (const item of pending) {
    let downloaded;
    try {
      downloaded = item.src.startsWith("file:") ? await readStagedMedia(item.src) : await downloadGitHubImage(item.src);
    } catch (error) {
      throw new Error(`${item.id}: ${error instanceof Error ? error.message : String(error)}`);
    }
    let compressed;
    try {
      compressed = await compressImageToWebp(downloaded.bytes);
    } catch (error) {
      throw new Error(`${item.id}: ${error instanceof Error ? error.message : String(error)}`);
    }
    const form = new FormData();
    form.set("owner", resource.owner);
    form.set("repo", resource.repo);
    form.set("sourceUrl", item.sourceUrl);
    form.set("file", new File([compressed.bytes], `${item.id}.webp`, { type: compressed.mimeType }));
    const uploaded = await api("/api/agent/v1/media", { method: "POST", body: form });
    const readback = await api(`/api/agent/v1/media/${uploaded.asset.assetKey}`);
    if (readback.asset.contentHash !== uploaded.asset.contentHash || readback.asset.publicUrl !== uploaded.asset.publicUrl) {
      throw new Error(`${item.id}: 媒体读回不一致`);
    }
    item.src = uploaded.asset.publicUrl;
    item.width = uploaded.asset.width;
    item.height = uploaded.asset.height;
    const localizedItem = resource.localizations?.en?.detail?.media?.find((candidate) => candidate.id === item.id);
    if (localizedItem) {
      localizedItem.src = uploaded.asset.publicUrl;
      localizedItem.width = uploaded.asset.width;
      localizedItem.height = uploaded.asset.height;
    }
    readbacks.push({
      id: item.id,
      sourceMimeType: downloaded.contentType,
      localProcessing: {
        mimeType: compressed.mimeType,
        width: compressed.width,
        height: compressed.height,
        sourceBytes: compressed.sourceBytes,
        uploadBytes: compressed.outputBytes,
      },
      ...uploaded.asset,
    });
  }

  await writeFile(file, `${JSON.stringify(resource, null, 2)}\n`, "utf8");
  const runDirectory = path.resolve("operations/runs");
  await mkdir(runDirectory, { recursive: true });
  const receiptPath = path.join(runDirectory, `media-${new Date().toISOString().replace(/[-:.TZ]/g, "")}-${resource.owner}-${resource.repo}.json`);
  await writeFile(receiptPath, `${JSON.stringify({ completedAt: new Date().toISOString(), sourceFile: file, stableKey: `${resource.owner}/${resource.repo}`, assets: readbacks }, null, 2)}\n`, "utf8");
  console.log(`media prepared: ${resource.owner}/${resource.repo} (${readbacks.length} uploaded)`);
  console.log(`receipt: ${receiptPath}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
