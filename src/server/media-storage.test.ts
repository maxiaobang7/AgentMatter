import { describe, expect, it } from "vitest";
import { ContentOperationError } from "@/server/content-service";
import { storedMediaPath, validateMediaIdentity, validateMediaSourceUrl } from "@/server/media-storage";

describe("media storage validation", () => {
  it("normalizes safe GitHub identities", () => {
    expect(validateMediaIdentity("PyAng5166", "gbro-cover-design")).toEqual({ owner: "pyang5166", repo: "gbro-cover-design" });
  });

  it("rejects path traversal in repository identities", () => {
    expect(() => validateMediaIdentity("../owner", "repo")).toThrow(ContentOperationError);
  });

  it("accepts GitHub sources and rejects unrelated hosts", () => {
    expect(validateMediaSourceUrl("https://raw.githubusercontent.com/owner/repo/main/example.png")).toContain("raw.githubusercontent.com");
    expect(() => validateMediaSourceUrl("https://example.com/example.png")).toThrow(ContentOperationError);
  });

  it("only resolves content-addressed WebP filenames", () => {
    expect(storedMediaPath("owner", "repo", "0123456789abcdef01234567.webp")).toContain("0123456789abcdef01234567.webp");
    expect(() => storedMediaPath("owner", "repo", "../../secret.webp")).toThrow(ContentOperationError);
  });
});
