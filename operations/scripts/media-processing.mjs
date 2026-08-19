import sharp from "sharp";

export const mediaProcessingLimits = Object.freeze({
  maximumSourceBytes: 8_000_000,
  maximumWidth: 1600,
  maximumHeight: 1600,
  minimumWidth: 160,
  minimumHeight: 120,
  webpQuality: 82,
});

export async function compressImageToWebp(input) {
  const source = Buffer.from(input);
  if (!source.byteLength || source.byteLength > mediaProcessingLimits.maximumSourceBytes) {
    throw new Error("图片为空或超过 8 MB");
  }

  let output;
  try {
    output = await sharp(source, { failOn: "error", limitInputPixels: 36_000_000 })
      .rotate()
      .resize({
        width: mediaProcessingLimits.maximumWidth,
        height: mediaProcessingLimits.maximumHeight,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: mediaProcessingLimits.webpQuality, smartSubsample: true, effort: 4 })
      .toBuffer();
  } catch {
    throw new Error("图片无法在本地解码或转换为 WebP");
  }

  const metadata = await sharp(output).metadata();
  if (metadata.format !== "webp" || !metadata.width || !metadata.height) {
    throw new Error("本地 WebP 转换结果无效");
  }
  if (metadata.width < mediaProcessingLimits.minimumWidth || metadata.height < mediaProcessingLimits.minimumHeight) {
    throw new Error("正文配图尺寸过小");
  }
  if (output.byteLength > mediaProcessingLimits.maximumSourceBytes) {
    throw new Error("本地 WebP 压缩结果超过 8 MB");
  }

  return {
    bytes: new Uint8Array(output),
    mimeType: "image/webp",
    width: metadata.width,
    height: metadata.height,
    sourceBytes: source.byteLength,
    outputBytes: output.byteLength,
  };
}
