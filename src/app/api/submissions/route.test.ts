import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { POST } from "./route";

const originalDatabaseUrl = process.env.DATABASE_URL;

function request(body: unknown) {
  return new Request("http://localhost/api/submissions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
}

describe("submission API", () => {
  beforeEach(() => {
    delete process.env.DATABASE_URL;
  });

  afterAll(() => {
    if (originalDatabaseUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = originalDatabaseUrl;
  });

  it("normalizes a valid GitHub repository", async () => {
    const response = await POST(request({ repositoryUrl: "https://github.com/openai/skills.git", category: "skills", componentPath: "skills/review", displayName: "Review Skill", hosts: ["Codex", "Claude Code"], notes: "test" }));
    const data = await response.json();
    expect(response.status).toBe(202);
    expect(data.submission.canonicalUrl).toBe("https://github.com/openai/skills");
    expect(data.submission.componentPath).toBe("skills/review");
    expect(data.submission.displayName).toBe("Review Skill");
    expect(data.submission.hosts).toEqual(["Codex", "Claude Code"]);
    expect(data.previewOnly).toBe(true);
  });

  it("rejects non-GitHub URLs", async () => {
    const response = await POST(request({ repositoryUrl: "https://example.com/a/b" }));
    expect(response.status).toBe(400);
  });

  it("rejects unsupported platform values", async () => {
    const response = await POST(request({ repositoryUrl: "https://github.com/openai/skills", hosts: ["Unknown Agent"] }));
    expect(response.status).toBe(400);
  });

  it("silently accepts honeypot submissions without persistence", async () => {
    const response = await POST(request({ repositoryUrl: "https://github.com/openai/skills", website: "spam.example" }));
    expect(response.status).toBe(201);
  });
});
