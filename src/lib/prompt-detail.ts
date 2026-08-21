import type { Resource } from "@/lib/types";

export interface StandalonePromptPresentation {
  text: string;
  placeholder?: string;
  sourceUrl: string;
}

const LEGACY_PROMPT_INTRO = /^(?:Prompt 原文如下。?|English version of the prompt:)\s*\n+/i;

function inferPlaceholder(text: string) {
  const candidates = ["[粘贴你的问题]", "[paste your question]", "{cursor}"];
  return candidates.find((candidate) => text.includes(candidate));
}

export function getStandalonePrompt(resource: Resource): StandalonePromptPresentation | null {
  if (resource.category !== "prompts") return null;

  const configured = resource.detail.prompt;
  if (configured) {
    if (configured.kind !== "standalone") return null;
    return {
      text: configured.text,
      placeholder: configured.placeholder ?? inferPlaceholder(configured.text),
      sourceUrl: configured.sourceUrl,
    };
  }

  // Temporary compatibility for standalone Prompts published before detail.prompt existed.
  if (!resource.acquisitions.some((item) => item.mode === "copy")) return null;
  const legacyText = resource.detail.readmeSummary.find((item) => item.includes("\n") && /Prompt|请先|Do not answer/i.test(item));
  if (!legacyText) return null;
  let text = legacyText.replace(LEGACY_PROMPT_INTRO, "").trim();
  let placeholder = inferPlaceholder(text);
  if (placeholder === "{cursor}") {
    placeholder = /[\u3400-\u9fff]/.test(text) ? "[粘贴你的问题]" : "[paste your question]";
    text = text.replaceAll("{cursor}", placeholder);
  }
  const sourceUrl = resource.acquisitions.find((item) => item.mode === "copy")?.url
    ?? resource.acquisitions.find((item) => item.mode === "copy")?.evidenceUrl
    ?? `https://github.com/${resource.owner}/${resource.repo}`;
  return { text, placeholder, sourceUrl };
}

export function splitPromptAroundPlaceholder(text: string, placeholder?: string) {
  if (!placeholder || !text.includes(placeholder)) return [text];
  return text.split(placeholder);
}
