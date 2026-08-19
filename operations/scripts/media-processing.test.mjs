import { describe, expect, it } from "vitest";
import sharp from "sharp";
import { compressImageToWebp, mediaProcessingLimits } from "./media-processing.mjs";

describe("local media processing", () => {
  it("resizes and converts source images to compressed WebP before upload", async () => {
    const png = await sharp({
      create: { width: 2400, height: 1800, channels: 3, background: { r: 52, g: 78, b: 240 } },
    }).png().toBuffer();

    const result = await compressImageToWebp(png);
    const metadata = await sharp(result.bytes).metadata();

    expect(result.mimeType).toBe("image/webp");
    expect(metadata.format).toBe("webp");
    expect(result.width).toBeLessThanOrEqual(mediaProcessingLimits.maximumWidth);
    expect(result.height).toBeLessThanOrEqual(mediaProcessingLimits.maximumHeight);
    expect(result.outputBytes).toBe(result.bytes.byteLength);
  });

  it("rejects files that cannot be decoded as images", async () => {
    await expect(compressImageToWebp(Buffer.from("not-an-image"))).rejects.toThrow("本地解码");
  });
});
