import { describe, expect, it } from "vitest";
import { POST } from "./route";

describe("agent validation API", () => {
  it("rejects an unauthenticated request before reading content", async () => {
    const response = await POST(new Request("http://localhost/api/agent/v1/resources/validate", { method: "POST", body: "{}" }));
    expect(response.status).toBe(401);
    expect(await response.json()).toMatchObject({ ok: false, error: { code: "unauthorized" } });
  });
});
