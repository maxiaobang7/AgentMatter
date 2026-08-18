import { describe, expect, it } from "vitest";
import { normalizeGitHubRepository, submissionSchema } from "@/lib/submission-schema";

describe("submission intake schema", () => {
  it("canonicalizes repository paths and removes .git", () => {
    expect(normalizeGitHubRepository("https://github.com/Owner/Repo.git/tree/main")).toEqual({ owner: "Owner", repo: "Repo", canonicalUrl: "https://github.com/Owner/Repo" });
  });

  it("preserves all supported editorial fields", () => {
    const result = submissionSchema.parse({ repositoryUrl: "https://github.com/a/b", category: "mcp", componentPath: "server", displayName: "Example", hosts: ["Codex"], notes: "Useful" });
    expect(result).toMatchObject({ category: "mcp", componentPath: "server", displayName: "Example", hosts: ["Codex"], notes: "Useful" });
  });
});
