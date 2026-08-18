"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import styles from "./resource-detail.module.css";
import { CATEGORY_INFO, CATEGORY_INFO_EN } from "@/data/resources";
import { formatRelativeDate, formatStars } from "@/lib/format";
import { canonicalIdentity, githubHref } from "@/lib/resources";
import type { Acquisition, CategorySlug, Resource, ResourceMediaPlacement } from "@/lib/types";
import { localizedPath, type PublicLocale } from "@/lib/i18n";

type IconName =
  | "actions"
  | "book"
  | "clock"
  | "code"
  | "copy"
  | "external"
  | "github"
  | "issue"
  | "license"
  | "release"
  | "security"
  | "share"
  | "star";

const installHeadings: Record<CategorySlug, string> = {
  skills: "安装与使用",
  dsh: "安装与使用",
  plugins: "安装与使用",
  mcp: "安装与连接",
  prompts: "获取与使用",
};
const installHeadingsEn: Record<CategorySlug, string> = { skills: "Installation and usage", dsh: "Installation and usage", plugins: "Installation and usage", mcp: "Setup and connection", prompts: "Access and usage" };

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (name === "github") return <svg {...common} fill="currentColor" stroke="none"><path d="M12 .8a11.2 11.2 0 0 0-3.54 21.83c.56.1.76-.24.76-.54v-2.12c-3.13.68-3.79-1.33-3.79-1.33-.51-1.3-1.25-1.65-1.25-1.65-1.02-.7.08-.69.08-.69 1.13.08 1.72 1.16 1.72 1.16 1 1.72 2.63 1.22 3.28.93.1-.73.39-1.22.71-1.5-2.5-.29-5.13-1.25-5.13-5.57 0-1.23.44-2.24 1.16-3.03-.12-.28-.5-1.43.11-2.99 0 0 .95-.3 3.09 1.16A10.7 10.7 0 0 1 12 6.07c.95 0 1.9.13 2.8.38 2.14-1.46 3.08-1.16 3.08-1.16.62 1.56.23 2.71.12 2.99.72.79 1.15 1.8 1.15 3.03 0 4.33-2.63 5.28-5.14 5.56.4.35.77 1.04.77 2.1v3.12c0 .3.2.65.77.54A11.2 11.2 0 0 0 12 .8Z" /></svg>;
  if (name === "star") return <svg {...common}><path d="m12 3 2.75 5.57 6.15.9-4.45 4.33 1.05 6.12L12 17.03l-5.5 2.89 1.05-6.12L3.1 9.47l6.15-.9L12 3Z" /></svg>;
  if (name === "license") return <svg {...common}><path d="M9 4H5v16h4M15 4h4v16h-4M8 9h8M7 13h10M12 5v13" /></svg>;
  if (name === "clock") return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>;
  if (name === "code") return <svg {...common}><path d="m8 9-3 3 3 3M16 9l3 3-3 3M14 5l-4 14" /></svg>;
  if (name === "copy") return <svg {...common}><rect x="8" y="8" width="11" height="11" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></svg>;
  if (name === "external") return <svg {...common}><path d="M14 5h5v5M12 12l7-7M19 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" /></svg>;
  if (name === "share") return <svg {...common}><circle cx="18" cy="5" r="2.5" /><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="19" r="2.5" /><path d="m8.2 10.8 7.6-4.6M8.2 13.2l7.6 4.6" /></svg>;
  if (name === "book") return <svg {...common}><path d="M4 5.5A3.5 3.5 0 0 1 7.5 2H11v17H7.5A3.5 3.5 0 0 0 4 22V5.5ZM20 5.5A3.5 3.5 0 0 0 16.5 2H13v17h3.5A3.5 3.5 0 0 1 20 22V5.5Z" /></svg>;
  if (name === "release") return <svg {...common}><path d="m4 12 8-8h6l2 2v6l-8 8-8-8Z" /><circle cx="16" cy="8" r="1" /></svg>;
  if (name === "issue") return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M12 7v6M12 17h.01" /></svg>;
  if (name === "security") return <svg {...common}><path d="M12 3 5 6v5c0 4.6 2.8 8.3 7 10 4.2-1.7 7-5.4 7-10V6l-7-3Z" /><path d="M9.5 12 11 13.5l3.5-4" /></svg>;
  return <svg {...common}><path d="M5 4h4v4H5zM15 16h4v4h-4zM5 16h4v4H5zM9 6h4a4 4 0 0 1 4 4v6M7 8v8" /></svg>;
}

function installationSnippet(resource: Resource, acquisition: Acquisition, locale: PublicLocale) {
  if (acquisition.config) return acquisition.config;
  if (acquisition.command) return acquisition.command;
  if (resource.id === "github-mcp" && acquisition.mode === "connect") {
    return `{
  "servers": {
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/"
    }
  }
}`;
  }
  return locale === "zh" ? `项目地址：${acquisition.url ?? githubHref(resource)}
复制地址并按照下方步骤完成设置。` : `Project URL: ${acquisition.url ?? githubHref(resource)}
Copy the URL and follow the steps below to complete setup.`;
}

function EditorialMedia({ resource, placement, locale }: { resource: Resource; placement: ResourceMediaPlacement; locale: PublicLocale }) {
  const items = resource.detail.media?.filter((item) => item.placement === placement) ?? [];
  if (!items.length) return null;

  return (
    <div className={`${styles.mediaGallery} ${items.length > 1 ? styles.mediaGalleryMultiple : ""}`} aria-label={locale === "zh" ? "项目配图" : "Project media"}>
      {items.map((item) => (
        <figure className={styles.mediaFigure} key={item.id}>
          <div className={styles.mediaFrame} style={{ aspectRatio: `${item.width} / ${item.height}` }}>
            <Image
              src={item.src}
              alt={item.alt}
              width={item.width}
              height={item.height}
              sizes="(max-width: 860px) calc(100vw - 56px), (max-width: 1464px) 65vw, 900px"
            />
          </div>
          <figcaption>
            <span>{item.caption ?? item.alt}</span>
            <a href={item.evidenceUrl} target="_blank" rel="noreferrer">{locale === "zh" ? "查看仓库原图" : "View repository image"} <Icon name="external" size={14} /></a>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

export function ResourceDetail({ resource, locale }: { resource: Resource; locale: PublicLocale }) {
  const zh = locale === "zh";
  const info = (zh ? CATEGORY_INFO : CATEGORY_INFO_EN)[resource.category];
  const publisherLabel = resource.officialKind === "platform" ? (zh ? "官方实现" : "Official") : resource.officialKind === "publisher" ? (zh ? "发布者仓库" : "Publisher repository") : (zh ? "社区项目" : "Community project");
  const [repoCopied, setRepoCopied] = useState(false);
  const [snippetCopied, setSnippetCopied] = useState(false);
  const [agentPromptCopied, setAgentPromptCopied] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const activeAcquisition = resource.acquisitions[0];
  const snippet = installationSnippet(resource, activeAcquisition, locale);
  const repositoryUrl = `https://github.com/${resource.owner}/${resource.repo}`;
  const projectUrl = githubHref(resource);
  const installationGuide = resource.detail.installationGuide ?? {
    summary: activeAcquisition.command || activeAcquisition.config
      ? (zh ? `下面是根据 ${resource.name} 当前公开资料整理的推荐安装路径。先准备运行环境，再复制配置并完成最小验证。` : `This setup path is based on the current public documentation for ${resource.name}. Prepare the runtime, apply the configuration, and complete a minimal verification.`)
      : (zh ? `下面是根据 ${resource.name} 当前公开资料整理的推荐使用路径，按顺序完成设置后即可在 Agent 中调用。` : `This usage path is based on the current public documentation for ${resource.name}. Complete the steps in order before using it from your agent.`),
    prerequisites: activeAcquisition.requirements?.length
      ? activeAcquisition.requirements
      : (zh ? ["准备支持该资源的 Agent 或运行环境", "确认可以访问项目所需的本地文件或服务"] : ["Prepare a compatible agent or runtime", "Confirm access to the local files or services required by the project"]),
    verification: zh ? "回到 Agent 中运行一个最小任务；资源能够被识别并返回符合项目说明的结果，就表示设置已经生效。" : "Run a minimal task in the agent. If the resource is recognized and returns the documented type of result, the setup is active.",
    notes: resource.limitations?.slice(0, 3) ?? [],
  };
  const agentInstallPrompt = installationGuide.agentInstallPrompt ?? (zh ? `请帮我安装${info.label}：${resource.name}
项目地址：${projectUrl}

请先阅读项目 README 和安装文件，确认当前环境与安装目录，再按项目提供的方式完成安装。安装完成后运行一个最小任务验证是否可用，并告诉我安装位置、执行步骤和验证结果；如果需要账号、凭据、额外权限或执行高风险操作，请先说明并等待我确认。` : `Help me install this ${info.shortLabel}: ${resource.name}
Project URL: ${projectUrl}

Read the README and installation files first, confirm the current environment and target directory, then follow the project's documented installation method. Run a minimal verification task afterward and report the install location, steps, and result. Ask before requesting credentials, additional permissions, overwriting files, or performing risky actions.`);
  const tutorialSteps = resource.detail.tutorialSteps ?? [
    { title: zh ? "复制并执行配置" : "Apply the configuration", description: zh ? "使用上方提供的命令或配置，把资源加入当前 Agent 环境。" : "Use the command or configuration above to add the resource to the current agent environment." },
    { title: zh ? "完成必要设置" : "Complete required setup", description: activeAcquisition.requirements?.length ? (zh ? `根据提示准备 ${activeAcquisition.requirements.join("、")}。` : `Prepare ${activeAcquisition.requirements.join(", ")}.`) : (zh ? "根据运行环境完成路径、权限或连接设置。" : "Complete path, permission, or connection settings for the current runtime.") },
    { title: zh ? "运行最小任务" : "Run a minimal task", description: installationGuide.verification },
  ];
  const useCases = resource.detail.useCases ?? resource.detail.suitableFor.map((item) => ({ title: item, description: "" }));
  const reviewStrengths = resource.detail.review?.strengths ?? resource.detail.suitableFor;
  const reviewLimitations = resource.detail.review?.limitations ?? resource.detail.notSuitableFor;

  async function copyRepositoryIdentity() {
    await navigator.clipboard.writeText(canonicalIdentity(resource));
    setRepoCopied(true);
    window.setTimeout(() => setRepoCopied(false), 1600);
  }

  async function copySnippet() {
    await navigator.clipboard.writeText(snippet);
    setSnippetCopied(true);
    window.setTimeout(() => setSnippetCopied(false), 1600);
  }

  async function copyAgentInstallPrompt() {
    await navigator.clipboard.writeText(agentInstallPrompt);
    setAgentPromptCopied(true);
    window.setTimeout(() => setAgentPromptCopied(false), 1600);
  }

  async function shareResource() {
    const shareData = { title: resource.name, text: resource.summary, url: window.location.href };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        return;
      }
    }
    await navigator.clipboard.writeText(window.location.href);
    setShareCopied(true);
    window.setTimeout(() => setShareCopied(false), 1600);
  }

  const projectLinks: Array<{ label: string; href: string; icon: IconName }> = [
    { label: zh ? "GitHub 仓库" : "GitHub repository", href: projectUrl, icon: "github" },
    { label: "README", href: `${projectUrl}#readme`, icon: "book" },
    { label: "Releases", href: `${repositoryUrl}/releases`, icon: "release" },
    { label: "Issues", href: `${repositoryUrl}/issues`, icon: "issue" },
    { label: "Security", href: `${repositoryUrl}/security`, icon: "security" },
  ];

  return (
    <article className={styles.page}>
      <div className={styles.shell}>
        <nav className={styles.breadcrumb} aria-label={zh ? "面包屑导航" : "Breadcrumb"}>
          <Link href={localizedPath("/", locale)}>{zh ? "首页" : "Home"}</Link><span>/</span><Link href={localizedPath(`/${resource.category}`, locale)}>{info.label}</Link><span>/</span><span>{resource.name}</span>
        </nav>
      </div>

      <header className={styles.hero}>
        <div className={styles.heroBlueprint} aria-hidden="true"><i /><i /><i /><i /></div>
        <div className={`${styles.shell} ${styles.heroInner}`}>
          <div className={styles.heroCopy}>
            <span className={styles.badge}>{info.label} · {publisherLabel}</span>
            <h1>{resource.name}</h1>
            <button className={styles.repoIdentity} type="button" onClick={copyRepositoryIdentity} aria-label={zh ? "复制仓库名称" : "Copy repository name"}>
              <span>{canonicalIdentity(resource)}</span><Icon name="copy" size={17} /><small>{repoCopied ? (zh ? "已复制" : "Copied") : ""}</small>
            </button>
            <p>{resource.summary}</p>
            <div className={styles.heroMeta} aria-label={zh ? "项目参数摘要" : "Project summary"}>
              <span><Icon name="star" size={19} />{formatStars(resource.stars)} Stars</span>
              <span><Icon name="license" size={19} />{resource.license}</span>
              {resource.language ? <span><Icon name="code" size={19} />{resource.language}</span> : null}
              <span><Icon name="clock" size={19} />{formatRelativeDate(resource.updatedAt, new Date(), locale)}</span>
            </div>
          </div>
          <div className={styles.heroActions}>
            <a className={styles.primaryButton} href="#installation">{zh ? "安装与使用" : "Install and use"} <span aria-hidden="true">↓</span></a>
            <a className={styles.secondaryButton} href={projectUrl} target="_blank" rel="noreferrer">GitHub <Icon name="external" size={18} /></a>
            <button className={styles.secondaryButton} type="button" onClick={shareResource}><Icon name="share" size={18} />{shareCopied ? (zh ? "链接已复制" : "Link copied") : (zh ? "分享" : "Share")}</button>
          </div>
        </div>
      </header>

      <div className={`${styles.shell} ${styles.detailGrid}`}>
        <div className={styles.article}>
          <section className={styles.contentCard} id="introduction">
            <div className={styles.sectionHeading}><span>01</span><h2>{zh ? "项目介绍" : "Project overview"}</h2></div>
            <p className={styles.introduction}>{resource.detail.introduction}</p>
            <EditorialMedia resource={resource} placement="after-introduction" locale={locale} />
          </section>

          <section className={styles.contentCard} id="capabilities">
            <div className={styles.sectionHeading}><span>02</span><h2>{zh ? "核心功能" : "Core capabilities"}</h2></div>
            <div className={styles.capabilityGrid}>
              {resource.detail.capabilityDetails.map((capability, index) => (
                <article key={capability.name}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div><h3>{capability.name}</h3><p>{capability.description}</p></div>
                </article>
              ))}
            </div>
            <EditorialMedia resource={resource} placement="after-capabilities" locale={locale} />
          </section>

          <section className={styles.contentCard} id="installation">
            <div className={styles.sectionHeading}><span>03</span><h2>{(zh ? installHeadings : installHeadingsEn)[resource.category]}</h2></div>
            <p className={styles.installLead}>{installationGuide.summary}</p>
            <div className={styles.agentInstallCard}>
              <div className={styles.agentInstallHeader}>
                <div><small>AI AGENT INSTALL</small><h3>{zh ? "让 AI Agent 帮你安装" : "Let an AI Agent install it"}</h3></div>
                <button type="button" onClick={copyAgentInstallPrompt} aria-label={zh ? "复制 AI Agent 安装提示词" : "Copy AI Agent installation prompt"}><Icon name="copy" size={16} />{agentPromptCopied ? (zh ? "已复制" : "Copied") : (zh ? "复制提示词" : "Copy prompt")}</button>
              </div>
              <p>{zh ? "把这段话发送给 Codex、Claude Code 或其他可以操作本地环境的 AI Agent。" : "Send this prompt to Codex, Claude Code, or another AI agent that can work with your local environment."}</p>
              <pre><code>{agentInstallPrompt}</code></pre>
            </div>
            <div className={styles.prerequisitePanel}>
              <div className={styles.guideLabel}><span>01</span><strong>{zh ? "开始前准备" : "Before you start"}</strong></div>
              <ul>
                {installationGuide.prerequisites.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
            <div className={styles.guideLabel}><span>02</span><strong>{zh ? "复制安装命令或配置" : "Copy the install command or configuration"}</strong></div>
            <div className={styles.codeBlock}>
              <pre><code>{snippet}</code></pre>
              <button type="button" onClick={copySnippet} aria-label={zh ? "复制安装配置" : "Copy installation configuration"}><Icon name="copy" size={16} />{snippetCopied ? (zh ? "已复制" : "Copied") : (zh ? "复制" : "Copy")}</button>
            </div>
            <div className={styles.guideLabel}><span>03</span><strong>{zh ? "按步骤完成安装" : "Complete the setup steps"}</strong></div>
            <ol className={styles.steps}>
              {tutorialSteps.map((step, index) => (
                <li key={`${step.title}-${index}`}><b>{index + 1}</b><div><strong>{step.title}</strong><p>{step.description}</p></div></li>
              ))}
            </ol>
            <div className={styles.verificationPanel}>
              <span><Icon name="security" size={22} /></span>
              <div><strong>{zh ? "如何确认安装成功" : "How to verify the setup"}</strong><p>{installationGuide.verification}</p></div>
            </div>
            {installationGuide.notes?.length ? (
              <div className={styles.installNotes}>
                <strong>{zh ? "使用前注意" : "Before using it"}</strong>
                <ul>{installationGuide.notes.map((item) => <li key={item}>{item}</li>)}</ul>
              </div>
            ) : null}
            <EditorialMedia resource={resource} placement="after-installation" locale={locale} />
          </section>

          <section className={styles.contentCard} id="use-cases">
            <div className={styles.sectionHeading}><span>04</span><h2>{zh ? "使用场景" : "Use cases"}</h2></div>
            <div className={styles.useCaseGrid}>
              {useCases.map((useCase, index) => (
                <article key={`${useCase.title}-${index}`}>
                  <small>SCENARIO {String(index + 1).padStart(2, "0")}</small>
                  <h3>{useCase.title}</h3>
                  {useCase.description ? <p>{useCase.description}</p> : null}
                </article>
              ))}
            </div>
            <EditorialMedia resource={resource} placement="after-use-cases" locale={locale} />
          </section>

          <section className={styles.contentCard} id="review">
            <div className={styles.sectionHeading}><span>05</span><h2>{zh ? "使用评价" : "Assessment"}</h2></div>
            {resource.detail.review ? <p className={styles.reviewSummary}>{resource.detail.review.summary}</p> : null}
            <div className={styles.reviewColumns}>
              <div><h3>{zh ? "值得一试的地方" : "Why it may be useful"}</h3><ul>{reviewStrengths.map((item) => <li key={item}>{item}</li>)}</ul></div>
              <div><h3>{zh ? "使用前要知道" : "What to know first"}</h3><ul>{reviewLimitations.map((item) => <li key={item}>{item}</li>)}</ul></div>
            </div>
            <EditorialMedia resource={resource} placement="after-review" locale={locale} />
          </section>

          <section className={styles.contentCard} id="readme">
            <div className={styles.sectionHeading}><span>06</span><h2>README</h2></div>
            <div className={styles.readmeDocument}>
              <h3>{resource.name}</h3>
              <hr />
              <h4>Overview</h4>
              <p>{resource.summary} {resource.detail.githubDescription}</p>
              <EditorialMedia resource={resource} placement="in-readme" locale={locale} />
              <h4>Getting started</h4>
              <ul>
                <li>{installationGuide.summary}</li>
                {resource.detail.readmeSummary.slice(0, 2).map((item) => <li key={item}>{item}</li>)}
                <li>{installationGuide.verification}</li>
              </ul>
              <h4>Configuration</h4>
              <pre><code>{snippet}</code></pre>
              <a href={`${projectUrl}#readme`} target="_blank" rel="noreferrer">{zh ? "在 GitHub 阅读完整 README" : "Read the complete README on GitHub"} <span>→</span></a>
            </div>
          </section>
        </div>

        <aside className={styles.sidebar} aria-label={zh ? "项目链接和参数" : "Project links and details"}>
          <section className={styles.sidebarCard}>
            <h2>{zh ? "项目链接" : "Project links"}</h2>
            <div className={styles.linkList}>
              {projectLinks.map((item) => (
                <a href={item.href} target="_blank" rel="noreferrer" key={item.label}>
                  <Icon name={item.icon} size={20} /><span>{item.label}</span><Icon name="external" size={16} />
                </a>
              ))}
            </div>
          </section>
          <section className={styles.sidebarCard}>
            <h2>{zh ? "项目参数" : "Project details"}</h2>
            <dl className={styles.parameters}>
              <div><dt>{zh ? "类型" : "Type"}</dt><dd>{info.label}</dd></div>
              <div><dt>{zh ? "作者" : "Author"}</dt><dd>{resource.owner}</dd></div>
              <div><dt>{zh ? "主要语言" : "Language"}</dt><dd>{resource.language ?? "—"}</dd></div>
              <div><dt>{zh ? "许可证" : "License"}</dt><dd>{resource.license}</dd></div>
              <div><dt>Stars</dt><dd>{formatStars(resource.stars)}</dd></div>
              <div><dt>{zh ? "最近更新" : "Updated"}</dt><dd>{formatRelativeDate(resource.updatedAt, new Date(), locale).replace("更新", "").replace("Updated", "").trim()}</dd></div>
            </dl>
            <p className={styles.sourceNote}>{zh ? "数据来源：GitHub" : "Source: GitHub"}{resource.provenance ? (zh ? " · Codex 整理" : " · Curated with Codex") : ""}</p>
          </section>
        </aside>
      </div>
    </article>
  );
}
