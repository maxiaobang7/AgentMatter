"use client";

import Link from "next/link";
import { useState } from "react";
import { CATEGORY_INFO, CATEGORY_INFO_EN } from "@/data/resources";
import { localizedPath, type PublicLocale } from "@/lib/i18n";
import { splitPromptAroundPlaceholder, type StandalonePromptPresentation } from "@/lib/prompt-detail";
import type { Resource } from "@/lib/types";
import styles from "./standalone-prompt-detail.module.css";

type CopyState = "idle" | "copied" | "error";

function CopyIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="8" y="8" width="11" height="11" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></svg>;
}

function ExternalIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 5h5v5M12 12l7-7M19 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" /></svg>;
}

async function copyPlainText(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  textarea.remove();
  if (!copied) throw new Error("copy failed");
}

export function StandalonePromptDetail({ resource, prompt, locale }: { resource: Resource; prompt: StandalonePromptPresentation; locale: PublicLocale }) {
  const zh = locale === "zh";
  const info = (zh ? CATEGORY_INFO : CATEGORY_INFO_EN)[resource.category];
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const segments = splitPromptAroundPlaceholder(prompt.text, prompt.placeholder);

  async function handleCopy() {
    try {
      await copyPlainText(prompt.text);
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 1800);
    } catch {
      setCopyState("error");
    }
  }

  return (
    <article className={styles.page}>
      <div className={styles.ambient} aria-hidden="true"><i /><i /><i /></div>
      <div className={styles.shell}>
        <nav className={styles.breadcrumb} aria-label={zh ? "面包屑导航" : "Breadcrumb"}>
          <Link href={localizedPath("/", locale)}>{zh ? "首页" : "Home"}</Link><span>/</span>
          <Link href={localizedPath(`/${resource.category}`, locale)}>{info.label}</Link><span>/</span>
          <span>{resource.name}</span>
        </nav>

        <header className={styles.hero}>
          <span className={styles.badge}>{zh ? "单条 Prompt" : "Standalone Prompt"}</span>
          <h1>{resource.name}</h1>
          <p>{resource.detail.introduction}</p>
        </header>

        <section className={styles.promptCard} aria-labelledby="prompt-heading">
          <div className={styles.promptToolbar}>
            <div><span>READY TO COPY</span><h2 id="prompt-heading">{zh ? "Prompt 原文" : "Complete prompt"}</h2></div>
            <button className={copyState === "copied" ? styles.copiedButton : ""} type="button" onClick={handleCopy}>
              <CopyIcon />
              {copyState === "copied" ? (zh ? "已复制" : "Copied") : copyState === "error" ? (zh ? "复制失败，请手动选择" : "Copy failed") : (zh ? "复制全文" : "Copy prompt")}
            </button>
          </div>

          <div className={styles.promptText} lang={zh ? "zh-CN" : "en"}>
            {segments.map((segment, index) => (
              <span key={`${index}-${segment.slice(0, 12)}`}>
                {segment}
                {prompt.placeholder && index < segments.length - 1 ? <mark>{prompt.placeholder}</mark> : null}
              </span>
            ))}
          </div>

          <p className={styles.copyHint} aria-live="polite">
            {copyState === "error"
              ? (zh ? "浏览器没有允许自动复制，你仍可以直接选中上方文字。" : "The browser blocked automatic copying. You can still select the text above.")
              : prompt.placeholder
                ? (zh ? `复制后，把 ${prompt.placeholder} 替换成你的实际问题。` : `After copying, replace ${prompt.placeholder} with your actual question.`)
                : (zh ? "复制后直接粘贴到你使用的 AI 对话中。" : "Copy and paste it into your AI conversation.")}
          </p>
        </section>

        <footer className={styles.sourceRow}>
          <div><small>{zh ? "来源" : "Source"}</small><strong>{resource.owner}/{resource.repo}</strong></div>
          <a href={prompt.sourceUrl} target="_blank" rel="noreferrer">{zh ? "查看 GitHub 原文" : "View source on GitHub"}<ExternalIcon /></a>
        </footer>
      </div>
    </article>
  );
}
