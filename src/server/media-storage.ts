import "server-only";

import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { ContentOperationError } from "@/server/content-service";

const identityPattern = /^[a-z0-9](?:[a-z0-9._-]{0,99})$/i;
const filenamePattern = /^[a-f0-9]{24}\.webp$/;
const allowedSourceHosts = new Set(["github.com", "raw.githubusercontent.com"]);
const maxSourceBytes = 8_000_000;

export interface StoredMediaAsset {
  assetKey: string;
  owner: string;
  repo: string;
  sourceUrl: string;
  publicUrl: string;
  contentHash: string;
  mimeType: "image/webp";
  width: number;
  height: number;
  bytes: number;
}

function storageRoot() {
  return path.resolve(/* turbopackIgnore: true */ process.env.AGENTMATTER_MEDIA_DIR ?? path.join(process.cwd(), "storage", "media"));
}

export function validateMediaIdentity(owner: string, repo: string) {
  if (!identityPattern.test(owner) || !identityPattern.test(repo)) {
    throw new ContentOperationError("媒体资源的 owner 或 repo 无效", 422, "invalid_media_identity");
  }
  return { owner: owner.toLowerCase(), repo: repo.toLowerCase() };
}

export function validateMediaSourceUrl(value: string) {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new ContentOperationError("媒体来源地址无效", 422, "invalid_media_source");
  }
  if (url.protocol !== "https:" || !allowedSourceHosts.has(url.hostname)) {
    throw new ContentOperationError("媒体来源必须是 GitHub HTTPS 地址", 422, "invalid_media_source");
  }
  return url.toString();
}

export function storedMediaPath(owner: string, repo: string, filename: string) {
  const identity = validateMediaIdentity(owner, repo);
  if (!filenamePattern.test(filename)) throw new ContentOperationError("媒体文件名无效", 404, "media_not_found");
  const root = storageRoot();
  const target = path.resolve(root, identity.owner, identity.repo, filename);
  if (!target.startsWith(`${root}${path.sep}`)) throw new ContentOperationError("媒体路径无效", 404, "media_not_found");
  return target;
}

export async function storeResourceMedia(input: { owner: string; repo: string; sourceUrl: string; bytes: Uint8Array }) {
  const identity = validateMediaIdentity(input.owner, input.repo);
  const sourceUrl = validateMediaSourceUrl(input.sourceUrl);
  if (!input.bytes.byteLength || input.bytes.byteLength > maxSourceBytes) {
    throw new ContentOperationError("图片文件为空或超过 8 MB", 413, "media_too_large");
  }

  let output: Buffer;
  try {
    output = await sharp(input.bytes, { failOn: "error", limitInputPixels: 36_000_000 })
      .rotate()
      .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82, smartSubsample: true })
      .toBuffer();
  } catch {
    throw new ContentOperationError("图片无法解码或格式不受支持", 422, "invalid_media_file");
  }

  const metadata = await sharp(output).metadata();
  if (!metadata.width || !metadata.height || metadata.width < 160 || metadata.height < 120) {
    throw new ContentOperationError("正文配图尺寸过小", 422, "media_dimensions_too_small");
  }
  const contentHash = createHash("sha256").update(output).digest("hex");
  const filename = `${contentHash.slice(0, 24)}.webp`;
  const target = storedMediaPath(identity.owner, identity.repo, filename);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, output, { flag: "wx" }).catch((error: NodeJS.ErrnoException) => {
    if (error.code !== "EEXIST") throw error;
  });

  return {
    assetKey: `media_${contentHash.slice(0, 32)}`,
    owner: identity.owner,
    repo: identity.repo,
    sourceUrl,
    publicUrl: `/media/resources/${identity.owner}/${identity.repo}/${filename}`,
    contentHash,
    mimeType: "image/webp" as const,
    width: metadata.width,
    height: metadata.height,
    bytes: output.byteLength,
  } satisfies StoredMediaAsset;
}

export async function readResourceMedia(owner: string, repo: string, filename: string) {
  try {
    return await readFile(/* turbopackIgnore: true */ storedMediaPath(owner, repo, filename));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      throw new ContentOperationError("媒体文件不存在", 404, "media_not_found");
    }
    throw error;
  }
}
