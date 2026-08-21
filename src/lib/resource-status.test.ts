import { describe, expect, it } from "vitest";
import { nextResourceStatus } from "@/lib/resource-status";

describe("resource status transitions", () => {
  it("moves published and unpublished resources to draft", () => {
    expect(nextResourceStatus("published", "draft")).toBe("draft");
    expect(nextResourceStatus("unpublished", "draft")).toBe("draft");
  });

  it("archives any non-archived resource", () => {
    expect(nextResourceStatus("published", "archive")).toBe("archived");
    expect(nextResourceStatus("draft", "archive")).toBe("archived");
  });

  it("does not allow an archived resource to be converted directly to draft", () => {
    expect(() => nextResourceStatus("archived", "draft")).toThrow("已归档资源");
  });
});
