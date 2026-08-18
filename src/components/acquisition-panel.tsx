"use client";

import { useState } from "react";
import type { Acquisition, Resource, VerificationLevel } from "@/lib/types";

const verificationLabels: Record<VerificationLevel, string> = {
  metadata: "仓库元数据",
  install: "安装方式",
  function: "功能运行",
};

function actionLabel(resource: Resource, acquisition: Acquisition) {
  if (acquisition.label.toLowerCase().includes("docker")) return "使用 Docker 连接";
  if (acquisition.mode === "connect") return `连接${resource.name}`;
  if (acquisition.mode === "install") return "查看安装说明";
  if (acquisition.mode === "copy") return "查看并复制内容";
  if (acquisition.mode === "learn") return "开始学习";
  return acquisition.label;
}

function acquisitionDescription(acquisition: Acquisition) {
  if (acquisition.mode === "connect") return "按照官方授权流程连接远程服务。";
  if (acquisition.mode === "install") return `使用${acquisition.label}在本地或自托管环境运行。`;
  if (acquisition.mode === "copy") return "打开仓库内容并复制到你的工作流。";
  if (acquisition.mode === "learn") return "从仓库课程和文档开始学习。";
  return "浏览仓库并选择适合当前任务的资源。";
}

export function AcquisitionPanel({
  acquisitions,
  resource,
  activeIndex,
  onActiveIndexChange,
}: {
  acquisitions: Acquisition[];
  resource: Resource;
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
}) {
  const [copied, setCopied] = useState(false);
  const active = acquisitions[activeIndex];

  async function copyCommand() {
    if (!active.command) return;
    await navigator.clipboard.writeText(active.command);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="acquisition-panel">
      <h2>获取与连接</h2>
      <div className="acquisition-tabs" role="tablist" aria-label="获取方式">
        {acquisitions.map((item, index) => (
          <button
            key={`${item.label}-${index}`}
            role="tab"
            aria-selected={index === activeIndex}
            className={index === activeIndex ? "active" : ""}
            onClick={() => onActiveIndexChange(index)}
          >{item.label}</button>
        ))}
      </div>
      <p className="acquisition-description">{acquisitionDescription(active)}</p>
      <div className="acquisition-actions">
        <a className="button button-primary full-width" href={active.url ?? `https://github.com/${resource.owner}/${resource.repo}`} target="_blank" rel="noreferrer">{actionLabel(resource, active)} ↗</a>
        {active.command ? <button className="button button-quiet full-width" type="button" onClick={copyCommand}>{copied ? "配置已复制" : "复制配置"}</button> : null}
      </div>

      <dl className="acquisition-facts">
        <div><dt>类型</dt><dd>{resource.officialKind === "platform" ? "官方" : resource.officialKind === "publisher" ? "发布者" : "社区"}</dd></div>
        <div><dt>方式</dt><dd>{active.label}</dd></div>
        <div><dt>要求</dt><dd>{active.requirements?.join(" / ") ?? "按官方说明"}</dd></div>
        <div><dt>组件路径</dt><dd>{resource.componentPath ?? "仓库根目录"}</dd></div>
      </dl>

      <div className="sidebar-verification">
        <h3>AgentMatter 核验记录</h3>
        {resource.verifications.map((item) => (
          <div className={item.status === "verified" ? "verified" : "unverified"} key={item.level}>
            <span>{verificationLabels[item.level]}</span>
            <strong>{item.status === "verified" ? "已核对 ✓" : item.level === "function" ? "尚未实测 ○" : "尚未核对 ○"}</strong>
          </div>
        ))}
      </div>

      <div className="sidebar-repository-health">
        <div><span>最近更新</span><strong>{new Intl.DateTimeFormat("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(resource.detail.maintenance.lastPush))}</strong></div>
        <div><span>仓库状态</span><strong>{resource.detail.maintenance.archived ? "已归档" : "未归档"}</strong></div>
        <div><span>Stars</span><strong>{resource.stars.toLocaleString("en-US")}</strong></div>
        {resource.language ? <div><span>主要语言</span><strong>{resource.language}</strong></div> : null}
      </div>

      {resource.detail.dataBoundaries.some((item) => item.risk !== "low") ? <div className="sidebar-warning"><strong>安全提示</strong><p>资源可能访问宿主数据或执行操作。请使用最小权限，并在启用前审查源码与配置。</p></div> : null}
      <div className="sidebar-links">
        <a href={`https://github.com/${resource.owner}/${resource.repo}`} target="_blank" rel="noreferrer">License ({resource.license}) <span>↗</span></a>
        <a href={`https://github.com/${resource.owner}/${resource.repo}/security`} target="_blank" rel="noreferrer">Security <span>↗</span></a>
        <a href={`https://github.com/${resource.owner}/${resource.repo}/releases`} target="_blank" rel="noreferrer">Releases <span>↗</span></a>
      </div>
    </div>
  );
}
