import { describe, expect, it } from "vitest";
import { resources } from "@/data/resources";
import { getStandalonePrompt, splitPromptAroundPlaceholder } from "@/lib/prompt-detail";

function promptResource() {
  return structuredClone(resources.find((resource) => resource.category === "prompts")!);
}

describe("standalone Prompt selection", () => {
  it("returns explicitly configured standalone Prompt content", () => {
    const resource = promptResource();
    resource.detail.prompt = {
      kind: "standalone",
      text: "先分析我的目标，然后回答。\n我的问题是：[粘贴你的问题]",
      placeholder: "[粘贴你的问题]",
      sourceUrl: `https://github.com/${resource.owner}/${resource.repo}/blob/HEAD/README.md`,
    };
    expect(getStandalonePrompt(resource)).toEqual({
      text: resource.detail.prompt.text,
      placeholder: resource.detail.prompt.placeholder,
      sourceUrl: resource.detail.prompt.sourceUrl,
    });
  });

  it("does not treat Prompt collections as standalone content", () => {
    const resource = promptResource();
    resource.detail.prompt = { kind: "collection" };
    expect(getStandalonePrompt(resource)).toBeNull();
  });

  it("extracts legacy copy-ready Prompt text without its editorial lead", () => {
    const resource = promptResource();
    resource.acquisitions = [{ label: "复制 Prompt", mode: "copy", url: `https://github.com/${resource.owner}/${resource.repo}/blob/HEAD/README.md` }];
    resource.detail.readmeSummary = ["Prompt 原文如下。\n\n请先分析问题。\n我的问题是：[粘贴你的问题]"];
    expect(getStandalonePrompt(resource)).toMatchObject({
      text: "请先分析问题。\n我的问题是：[粘贴你的问题]",
      placeholder: "[粘贴你的问题]",
    });
  });

  it("turns an Alfred cursor token into a user-facing question placeholder", () => {
    const resource = promptResource();
    resource.acquisitions = [{ label: "复制 Prompt", mode: "copy", url: `https://github.com/${resource.owner}/${resource.repo}/blob/HEAD/README.md` }];
    resource.detail.readmeSummary = ["Prompt 原文如下。\n\n请先分析问题。\n我的问题是：{cursor}"];
    expect(getStandalonePrompt(resource)).toMatchObject({
      text: "请先分析问题。\n我的问题是：[粘贴你的问题]",
      placeholder: "[粘贴你的问题]",
    });
  });

  it("ignores Prompt-like content in other resource categories", () => {
    const resource = structuredClone(resources[0]);
    resource.acquisitions = [{ label: "复制", mode: "copy", url: `https://github.com/${resource.owner}/${resource.repo}` }];
    resource.detail.readmeSummary = ["Prompt 原文如下。\n\n请执行任务。"];
    expect(getStandalonePrompt(resource)).toBeNull();
  });

  it("splits every visible placeholder without altering copied text", () => {
    expect(splitPromptAroundPlaceholder("A [问题] B [问题] C", "[问题]")).toEqual(["A ", " B ", " C"]);
  });
});
